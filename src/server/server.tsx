import {ELoopStatus, EServerStatus, ETaskConfig, ETaskStatus} from "../store/store.tsx";
import {app, core, imaging} from "photoshop";
import {createFileInDataFolder, findValAndReplace, map, MD5, randomSeed} from "../utils.tsx";

/**
 * Websocket server to communicate with ComfyUI Server (https://github.com/comfyanonymous/ComfyUI)
 * TODO: Create a Abstract Server Connected class for handle different server like ComfUI, Fooocus, A1111
 */
export class Server {
    url: string | undefined;
    socket: WebSocket | undefined;

    task: any;
    taskConfig: ETaskConfig | undefined;
    taskVariables: any;

    clientId = "photoshopclient";
    promptId = "";
    executingNodeId = "";

    status: EServerStatus = EServerStatus.disconnected;
    taskStatus: ETaskStatus = ETaskStatus.stop;
    loopStatus: ELoopStatus = ELoopStatus.stop;

    handler: Array<{ type: EServerEventTypes, callback: (data: any) => void }> = [];

    imageName = 'upload';
    imageHash = "";

    timer: any;
    timerWait = 2000;

    on(type: EServerEventTypes, callback: (data: any) => void) {
        this.handler.push({type: type, callback: callback});
    }

    isConnected() {
        // TODO: change to readyState
        return this.status === EServerStatus.connected;
    }

    connect(url: string) {
        let self = this;
        if (url.endsWith('/'))
            url = url.slice(0, -1)
        self.url = url;

        if (self.isConnected())
            return
        self.clearTask();

        let wsUrl = self.url;
        let wsProtocol = 'ws://';
        if (wsUrl.startsWith('https'))
            wsProtocol = 'wss://';

        if (wsUrl.startsWith('http')) {
            wsUrl = wsUrl.replace('http://', '');
            wsUrl = wsUrl.replace('https://', '');
        }

        self.clientId = "photoshopclient-" + randomSeed()
        self.emitEvent(EServerEventTypes.changeStatus, EServerStatus.connecting)
        wsUrl = `${wsProtocol}${wsUrl}/ws?clientId=${self.clientId}`;
        self.socket = new WebSocket(wsUrl);

        self.socket.onopen = function () {
            self.status = EServerStatus.connected;
            self.emitEvent(EServerEventTypes.changeStatus, EServerStatus.connected)

            self.getModels().catch(err => {
                console.error(`[Error] getModels ${err}`)
                self.disconnect();
            })
            self.getLoras().catch(err => {
                console.error(`[Error] getLoras ${err}`)
                self.disconnect();
            })
            self.getControlNetModels().catch(err => {
                console.error(`[Error] getControlNetModels ${err}`)
                self.disconnect();
            })
        };

        self.socket.onmessage = function (event) {
            try {
                if (event.data instanceof ArrayBuffer) {
                    const view = new DataView(event.data);
                    const eventType = view.getUint32(0);
                    const buffer = event.data.slice(4);
                    switch (eventType) {
                        case 1:
                            const view2 = new DataView(event.data);
                            const imageType = view2.getUint32(0)
                            let imageMime
                            switch (imageType) {
                                case 1:
                                default:
                                    imageMime = "image/jpeg";
                                    break;
                                case 2:
                                    imageMime = "image/png"
                            }
                            const imageBlob = new Blob([buffer.slice(4)], {type: imageMime});
                            self.emitEvent(EServerEventTypes.previewImage, imageBlob)
                            break;
                        default:
                            throw new Error(`Unknown binary websocket message of type ${eventType}`);
                    }
                } else {
                    const data = JSON.parse(event.data);
                    self.emitEvent(EServerEventTypes.message, data)

                    switch (data.type) {
                        case "status":
                            if (self.taskStatus === ETaskStatus.run &&
                                data.data.status.exec_info.hasOwnProperty('queue_remaining') &&
                                data.data.status.exec_info.queue_remaining === 0) {

                                self.taskStatus = ETaskStatus.done;
                                self.emitEvent(EServerEventTypes.changeTaskStatus, ETaskStatus.done)

                                self.getFinishedImage()
                                    .then(() => {
                                        if (self.taskConfig?.mode === "single")
                                            self.stopLoop()
                                        else
                                            self.runTask()
                                    })
                                    .catch(err => {
                                        console.error(err)
                                        if (self.taskConfig?.mode === "single")
                                            self.stopLoop()
                                        else
                                            self.runTask()
                                    })
                            }
                            break;
                        case "progress":
                            const value = map(data.data.value, 0, data.data.max, 0, 1);
                            self.emitEvent(EServerEventTypes.changeTaskProgress, value)
                            break;
                        case "executing":
                            self.executingNodeId = data.data.node;
                            if (self.executingNodeId && self.taskStatus !== ETaskStatus.stopping) {
                                self.taskStatus = ETaskStatus.run;
                                self.emitEvent(EServerEventTypes.changeTaskStatus, ETaskStatus.run)
                            }
                            break;
                        case "executed":
                            break;
                        case "execution_start":
                            break;
                        case "execution_error":
                            app.showAlert(`[Task Error]${data.data.exception_type}:${data.data.exception_message}\n\r${data.data.traceback.pop()}`)
                            self.stopLoop();
                            break;
                        case "execution_cached":
                            if (self.taskStatus === ETaskStatus.pending) {
                                self.emitEvent(EServerEventTypes.changeTaskProgress, 0)
                                self.taskStatus = ETaskStatus.run;
                                self.emitEvent(EServerEventTypes.changeTaskStatus, ETaskStatus.run)
                            }
                            break;
                    }
                }
            } catch (error) {
                console.warn("Unhandled message:", event.data, error);
            }
        };

        self.socket.onclose = function () {
            console.error(`Socket Closed!`);
            self.stopLoop();
            self.status = EServerStatus.disconnected;
            self.emitEvent(EServerEventTypes.changeStatus, EServerStatus.disconnected)
        };

        self.socket.onerror = function () {
            self.emitEvent(EServerEventTypes.error, undefined)
            console.error(`Socket Closed with an Error`);
        };
    }

    disconnect() {
        if (!this.isConnected) {
            return;
        }
        this.socket?.close();
    }


    startLoop() {
        const self = this;
        if (!this.isConnected) {
            return;
        }
        self.imageHash = "";
        self.loopStatus = ELoopStatus.run;
        self.emitEvent(EServerEventTypes.changeLoopStatus, self.loopStatus)
        self.runTask()
    }

    cleanImageHash() {
        this.imageHash = '';
    }

    stopLoop() {
        const self = this;
        if (self.taskStatus === ETaskStatus.stopping)
            return;

        if (self.timer) {
            clearTimeout(self.timer);
            self.timer = undefined;
        }

        if (self.status !== EServerStatus.connected) {
            self.clearTask();
            return;
        }

        const cancelUrl = self.taskStatus === ETaskStatus.pending ? "queue" : "interrupt";
        const body = self.taskStatus === ETaskStatus.pending ? {delete: [self.promptId]} : null;

        self.taskStatus = ETaskStatus.stopping;
        self.emitEvent(EServerEventTypes.changeTaskStatus, self.taskStatus)

        self.fetch(`/${cancelUrl}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            },
            body: JSON.stringify(body)
        }).then((responseStop) => {
            if (!responseStop)
                return
            if (responseStop.status !== 200) {
                app.showAlert(`[ERROR] Prompt task: ${responseStop.statusText} Status: ${responseStop.status}`)
            } else {
                self.clearTask();
            }
        }).catch(err => {
            app.showAlert(`[Error] ${err}`)
        });
    }

    runTask() {
        const self = this;
        if (!this.isConnected) {
            return;
        }
        if (self.loopStatus === ELoopStatus.stop) {
            return;
        }
        self.prompt().catch(err => {
            app.showAlert(err)
            self.stopLoop();
        })
    }

    runLoopTask() {
        let self = this;
        if (self.timer) {
            clearTimeout(self.timer)
        }
        self.timer = setTimeout(() => {
            self.runTask()
            self.timer = undefined;
        }, self.timerWait)
    }

    private async prompt() {
        const self = this;
        let sameImage = false;

        if (self.taskStatus === ETaskStatus.stopping) {
            return;
        }

        if (self.taskStatus === ETaskStatus.run) {
            self.runLoopTask();
            return
        }

        if (!app.activeDocument) {
            self.runLoopTask();
            return;
        }

        if (core.isModal()) {
            self.runLoopTask();
            return;
        }

        if (!self.validatePromptTask()) {
            self.runLoopTask();
            return;
        }

        /**
         * This is a HUGE!!!! hack!!
         * But with the PS 23.3 there is problem when Photoshop have open a Madal (like ColorPicker)
         * I this moment you cant use executeAsModal!
         * However, with this code I check is a madal open or not.
         * core.isModal() works only for you plugin not for the Host.
         * TODO: Change this, when you find a better solution!
         */
        try {
            await core.executeAsModal(async () => {
            }, {"commandName": 'Check host is Modal'});
        } catch (e) {
            self.runLoopTask();
            return
        }

        await core.executeAsModal(async () => {
            let imageMaxSize = 512;
            if (this.taskConfig?.uploadSize)
                imageMaxSize = this.taskConfig?.uploadSize;

            let size: any = {width: imageMaxSize}
            if (app.activeDocument.height > app.activeDocument.width)
                size = {height: imageMaxSize}

            const pixelData = await imaging.getPixels({targetSize: size, applyAlpha: true});
            const hash = MD5(await pixelData.imageData.getData({}));

            if (hash === self.imageHash) {
                self.taskStatus = ETaskStatus.done;
                self.emitEvent(EServerEventTypes.changeTaskStatus, ETaskStatus.done)
                sameImage = true;
                await pixelData.imageData.dispose();
            } else {
                self.imageHash = hash;

                self.taskStatus = ETaskStatus.pending;
                self.emitEvent(EServerEventTypes.changeTaskStatus, ETaskStatus.pending)

                let jpegData = await imaging.encodeImageData({"imageData": pixelData.imageData, "base64": false});
                await pixelData.imageData.dispose();
                const tmpFile = await createFileInDataFolder(self.getImageName())
                // @ts-ignore
                await tmpFile.write(jpegData)

                const body = new FormData();
                body.append("overwrite", "true");
                // @ts-ignore
                body.append("image", tmpFile);

                const responseUpload = await self.fetch('/upload/image', {
                    method: 'POST',
                    body: body,
                })
                if (!responseUpload)
                    return
                if (responseUpload.status !== 200) {
                    self.stopLoop();
                    throw `[ERROR] Upload Image: ${responseUpload.statusText} Status: ${responseUpload.status}`;
                }

                const promptText = self.createPromptTask();
                self.emitEvent(EServerEventTypes.sendPrompt, JSON.stringify(promptText, null, 4))
                const responsePrompt = await self.fetch('/prompt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json; charset=utf-8'
                    },
                    body: JSON.stringify(promptText),
                })
                if (!responsePrompt)
                    return
                if (responsePrompt.status !== 200) {
                    self.stopLoop();
                    throw `[ERROR] Prompt task: ${responsePrompt.statusText} Status: ${responsePrompt.status}`;
                }
                const responseData = await responsePrompt.json();
                self.promptId = responseData.prompt_id;
            }
        }, {"commandName": 'Send Prompt'});

        if (sameImage) {
            self.runLoopTask();
        }
    }

    private async fetch(path: string, init?: RequestInit) {
        const self = this;
        if (self.status !== EServerStatus.connected)
            return
        return fetch(`${self.url}${path}`, init)
    }

    private clearTask() {
        this.timer = undefined;
        this.cleanImageHash();
        this.taskStatus = ETaskStatus.stop;
        this.emitEvent(EServerEventTypes.changeTaskStatus, this.taskStatus)
        this.loopStatus = ELoopStatus.stop;
        this.emitEvent(EServerEventTypes.changeLoopStatus, this.loopStatus)
    }

    private async getModels() {
        const self = this;
        const response = await self.fetch('/object_info/CheckpointLoaderSimple', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
        if (!response)
            return
        if (response.status !== 200) {
            self.stopLoop();
            throw `[ERROR] Get Models: ${response.statusText} Status: ${response.status}`;
        }
        const responseData = await response.json();
        self.emitEvent(EServerEventTypes.getModels, responseData.CheckpointLoaderSimple.input.required.ckpt_name[0])
    }

    private async getLoras() {
        const self = this;
        const response = await self.fetch('/object_info/LoraLoader', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
        if (!response)
            return
        if (response.status !== 200) {
            self.stopLoop();
            throw `[ERROR] Get Loras: ${response.statusText} Status: ${response.status}`;
        }
        const responseData = await response.json();
        self.emitEvent(EServerEventTypes.getLoras, responseData.LoraLoader.input.required.lora_name[0])
    }

    private async getControlNetModels() {
        const self = this;
        const response = await self.fetch('/object_info/ControlNetLoader', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
        if (!response)
            return
        if (response.status !== 200) {
            self.stopLoop();
            throw `[ERROR] Prompt task: ${response.statusText} Status: ${response.status}`;
        }
        const responseData = await response.json();
        self.emitEvent(EServerEventTypes.getControlNetModels, responseData.ControlNetLoader.input.required.control_net_name[0])
    }

    private serializeImageData(obj: any) {
        let str = [];
        for (let p in obj)
            if (obj.hasOwnProperty(p)) {
                str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
            }
        return str.join("&");
    }

    private async getFinishedImage() {
        const self = this;
        if (!self.promptId)
            return;
        const responseHistory = await self.fetch(`/history/${self.promptId}`)
        if (!responseHistory)
            return
        if (responseHistory.status !== 200) {
            throw `Response history Status: ${responseHistory.status}`;
        }

        const data = await responseHistory.json();
        const outputs = data[self.promptId].outputs;
        if (!outputs) {
            return
        }

        let previewNode = this.executingNodeId;
        if (!previewNode)
            previewNode = Object.keys(outputs)[0];
        const previewOutput = outputs[previewNode];
        if (!previewOutput)
            return
        const images = previewOutput.images;
        if (!images)
            return

        const image = images.pop();
        const url_values = self.serializeImageData(image)
        const responseImage = await self.fetch(`/view?${url_values}`)
        if (!responseImage)
            return
        if (responseImage.status !== 200) {
            throw `Response view Status: ${responseImage.status}`;
        }
        const imageData = await responseImage.arrayBuffer();
        const imageBlob = new Blob([imageData], {type: "image/png"});
        self.emitEvent(EServerEventTypes.previewImage, imageBlob)
    }

    private getImageName() {
        return `${this.imageName}.jpg`
    }

    private emitEvent(type: EServerEventTypes, payload: any) {
        this.handler.map((handle) => {
            if (handle.type === type)
                handle.callback(payload);
        })
    }

    private validatePromptTask() {
        if (!this.taskVariables)
            return true;
        const keys = Object.keys(this.taskVariables);
        for (let i = 0; i < keys.length; i++) {
            if (this.taskVariables[keys[i]] == undefined || this.taskVariables[keys[i]] == null)
                return false;
        }
        return true;
    }

    private createPromptTask() {
        let taskCopy = JSON.parse(JSON.stringify(this.task)); // Deep Copy
        taskCopy.client_id = this.clientId;
        if (this.taskVariables) {
            Object.keys(this.taskVariables).map(key => {
                findValAndReplace(taskCopy, `#${key}#`, this.taskVariables[key])
            })
        }
        findValAndReplace(taskCopy, '#image#', this.getImageName())
        if (taskCopy.hasOwnProperty('config')) {
            delete taskCopy.config;
        }
        if (taskCopy.hasOwnProperty('variables')) {
            delete taskCopy.variables;
        }
        return taskCopy;
    }
}


export enum EServerEventTypes {
    "changeStatus",
    "changeTaskStatus",
    "changeTaskProgress",
    "changeLoopStatus",
    "error",
    "message",
    "previewImage",
    "getModels",
    "getLoras",
    "getControlNetModels",
    "sendPrompt",
}