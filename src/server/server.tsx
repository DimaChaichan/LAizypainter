import {EImageComfy, ELoopStatus, EModelsConfig, EServerStatus, ETaskConfig, ETaskStatus} from "../store/store.tsx";
import {app, core, imaging} from "photoshop";
import {
    createFileInDataFolder, findVal,
    findValAndReplace, getAllLayer, getDocumentByID,
    map,
    randomSeed,
    serializeImageComfyData
} from "../utils.tsx";
import {encode} from "fast-png";
import {ImageData} from "fast-png/src/types.ts";

/**
 * Websocket server to communicate with ComfyUI Server (https://github.com/comfyanonymous/ComfyUI)
 * TODO: Create a Abstract Server Connected class for handle different server like ComfUI, Fooocus, A1111
 */
export class Server {
    url: string | undefined;
    socket: WebSocket | undefined;

    task: any;
    taskConfig: ETaskConfig = {mode: "loop"};
    taskVariables: any;

    clientId = "photoshopclient";
    promptId = "";
    executingNodeId = "";

    status: EServerStatus = EServerStatus.disconnected;
    taskStatus: ETaskStatus = ETaskStatus.stop;
    loopStatus: ELoopStatus = ELoopStatus.stop;

    handler: Array<{
        type: EServerEventTypes,
        callback: (data: any) => void
    }> = [];

    imageName = 'upload';
    lastHistoryID = -1;
    executingNodes: any = [];
    executingNodesCount = 0;

    timer: any;
    timerWait = 2000;

    on(type: EServerEventTypes, callback: (data: any) => void) {
        this.handler.push({type: type, callback: callback});
    }

    isConnected() {
        return this.status === EServerStatus.connected;
    }

    setStatus(status: EServerStatus) {
        this.status = status;
        this.emitEvent(EServerEventTypes.changeStatus, status)
    }

    setTaskStatus(status: ETaskStatus) {
        this.taskStatus = status;
        this.emitEvent(EServerEventTypes.changeTaskStatus, status)
    }

    setLoopStatus(status: ELoopStatus) {
        this.loopStatus = status;
        this.emitEvent(EServerEventTypes.changeLoopStatus, status)
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
            self.setStatus(EServerStatus.connected)

            self.getModels().catch(err => {
                console.error(`[Error] getModels ${err}`)
                self.disconnect();
            })
            self.getEmbeddings().catch(err => {
                console.error(`[Error] getEmbeddings ${err}`)
                self.disconnect();
            })
            self.getHistory().catch(err => {
                console.error(`[Error] getHistory ${err}`)
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

                                self.setTaskStatus(ETaskStatus.done)

                                self.getFinishedImage()
                                    .then(() => {
                                        if (self.taskConfig?.mode === "single")
                                            self.stopLoop()
                                        else
                                            self.runTask()
                                    })
                                    .catch(err => {
                                        console.error("[Error] getFinishedImage " + err)
                                        if (self.taskConfig?.mode === "single")
                                            self.stopLoop()
                                        else
                                            self.runTask()
                                    })
                            }
                            break;
                        case "progress":
                            const value = map(data.data.value, 0, data.data.max, 0, 1);
                            self.emitEvent(EServerEventTypes.changeNodeProgress, value)
                            break;
                        case "executing":
                            self.executingNodeId = data.data.node;
                            if (data.data.prompt_id !== self.promptId)
                                return
                            if (self.executingNodeId && self.executingNodes.hasOwnProperty(self.executingNodeId)) {
                                self.executingNodesCount++;
                                const taskProgress =
                                    map(self.executingNodesCount, 0, Object.keys(self.executingNodes).length, 0, 1)
                                self.emitEvent(EServerEventTypes.changeTaskProgress, taskProgress)
                            }
                            if (self.executingNodeId && self.taskStatus !== ETaskStatus.stopping) {
                                self.setTaskStatus(ETaskStatus.run)
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
                                self.emitEvent(EServerEventTypes.changeNodeProgress, 0)
                                self.emitEvent(EServerEventTypes.changeTaskProgress, 0)
                                self.setTaskStatus(ETaskStatus.run)
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
            self.setStatus(EServerStatus.disconnected)
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
        self.lastHistoryID = -1;
        self.setLoopStatus(ELoopStatus.run)
        self.runTask()
    }

    stopLoop(skip?: boolean) {
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

        self.setTaskStatus(ETaskStatus.stopping)

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
                if (skip && self.taskConfig?.mode === "loop") {
                    self.setTaskStatus(ETaskStatus.stop)
                    self.runTask();
                } else {
                    self.clearTask();
                }
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

    validTask() {
        const valid = this.validatePromptTask();
        this.emitEvent(EServerEventTypes.onValidateTask, valid)
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

        const valid = self.validatePromptTask();
        self.emitEvent(EServerEventTypes.onValidateTask, valid)
        if (!valid) {
            self.runLoopTask();
            return;
        }
        /**
         * This is a HUGE!!!! hack!!
         * But with the PS 23.3 there is a problem when Photoshop have open a Madal (like ColorPicker)
         * I this moment you can"t use executeAsModal!
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
            const lastHistory = app.activeDocument.historyStates[app.activeDocument.historyStates.length - 1];
            if (self.lastHistoryID === lastHistory.id) {
                self.setTaskStatus(ETaskStatus.done)
                sameImage = true;
            } else {
                self.lastHistoryID = lastHistory.id;

                const promptText = await self.createPromptTask();
                if (!promptText)
                    return
                self.setTaskStatus(ETaskStatus.pending)

                self.executingNodes = promptText.prompt;
                self.executingNodesCount = 0;
                self.emitEvent(EServerEventTypes.sendPrompt, JSON.stringify(promptText, null, 4))
                self.emitEvent(EServerEventTypes.changeNodeProgress, 0)
                self.emitEvent(EServerEventTypes.changeTaskProgress, 0)
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

    private async createUploadImage(name: string, applyAlpha: boolean = true, size: {
                                        width?: number,
                                        height?: number,
                                    }, documentID?: number | undefined,
                                    layerID?: number | undefined) {
        let options: any = {
            targetSize: size,
            applyAlpha: applyAlpha
        }
        const channels = applyAlpha ? 3 : 4;
        let pixelDataMask;
        if (documentID && layerID) {
            const doc = getDocumentByID(documentID);
            options = {
                documentID: documentID,
                layerID: layerID,
                sourceBounds: doc ? {
                    left: 0,
                    top: 0,
                    right: doc.width,
                    bottom: doc.height
                } : null,
                applyAlpha: applyAlpha
            }
            // It is currently not possible to check, has a layer a mask or not
            // TODO: find a better solution
            try {
                const maskObj = await imaging.getLayerMask(options);
                pixelDataMask = await maskObj.imageData.getData({});
            } catch (e) {
            }
        }
        const pixelDataResult = await imaging.getPixels(options);
        let pixelData = await pixelDataResult.imageData.getData({});

        if (pixelDataMask && pixelDataMask.length) {
            let mergedArray = new Uint8Array(pixelData.length);
            mergedArray.set(pixelData);
            for (let i = 0; i < pixelDataMask.length; i++) {
                if (channels === 3) {
                    const alpha = pixelDataMask[i] > 0 ? pixelDataMask[i] / 255 : 0;
                    mergedArray[i * channels] = ((1 - alpha) * 255) + (alpha * pixelData[i * channels]);
                    mergedArray[i * channels + 1] = ((1 - alpha) * 255) + (alpha * pixelData[i * channels + 1]);
                    mergedArray[i * channels + 2] = ((1 - alpha) * 255) + (alpha * pixelData[i * channels + 2]);
                } else
                    mergedArray[(i + 1) * channels - 1] = pixelDataMask[i];
            }
            pixelData = mergedArray;
        }

        const pngData: ImageData = {
            width: pixelDataResult.imageData.width,
            height: pixelDataResult.imageData.height,
            data: (pixelData as Uint8Array),
            channels: channels
        }
        const png = encode(pngData)

        const tmpFile = await createFileInDataFolder(name)
        await tmpFile.write(png)
        await pixelDataResult.imageData.dispose();

        const body = new FormData();
        body.append("overwrite", "true");
        // @ts-ignore
        body.append("image", tmpFile);

        return this.fetch('/upload/image', {
            method: 'POST',
            body: body,
        })
    }

    private async fetch(path: string, init?: RequestInit) {
        const self = this;
        if (self.status !== EServerStatus.connected)
            return
        return fetch(`${self.url}${path}`, init)
    }

    private clearTask() {
        this.timer = undefined;
        this.lastHistoryID = -1;
        this.setTaskStatus(ETaskStatus.stop)
        this.setLoopStatus(ELoopStatus.stop)
    }

    private async getModels() {
        const self = this;
        const response = await self.fetch('/object_info', {
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
        const models: EModelsConfig = {
            checkpoints: responseData.CheckpointLoaderSimple.input.required.ckpt_name[0],
            clip: responseData.CLIPLoader.input.required.clip_name[0],
            clipVision: responseData.CLIPVisionLoader.input.required.clip_name[0],
            controlnet: responseData.ControlNetLoader.input.required.control_net_name[0],
            diffusers: responseData.DiffusersLoader.input.required.model_path[0],
            embeddings: [],
            gligen: responseData.GLIGENLoader.input.required.gligen_name[0],
            hypernetworks: responseData.HypernetworkLoader.input.required.hypernetwork_name[0],
            loras: responseData.LoraLoader.input.required.lora_name[0],
            styleModels: responseData.StyleModelLoader.input.required.style_model_name[0],
            upscaleModels: responseData.UpscaleModelLoader.input.required.model_name[0],
            vae: responseData.VAELoader.input.required.vae_name[0]
        }
        self.emitEvent(EServerEventTypes.getModels, models)
    }

    private async getEmbeddings() {
        const self = this;
        const response = await self.fetch('/embeddings', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
        if (!response)
            return
        if (response.status !== 200) {
            self.stopLoop();
            throw `[ERROR] Get Embeddings: ${response.statusText} Status: ${response.status}`;
        }
        const responseData = await response.json();
        self.emitEvent(EServerEventTypes.getEmbeddings, responseData)
    }

    private async getHistory() {
        const self = this;
        const response = await self.fetch('/history', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json; charset=utf-8'
            }
        })
        if (!response)
            return
        if (response.status !== 200) {
            self.stopLoop();
            throw `[ERROR] Get History: ${response.statusText} Status: ${response.status}`;
        }

        const responseData = await response.json();
        self.emitEvent(EServerEventTypes.getHistory, Object.values(responseData).reverse())
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

        const image = images[images.length - 1];
        const url_values = serializeImageComfyData(image)
        const responseImage = await self.fetch(`/view?${url_values}`)
        if (!responseImage)
            return
        if (responseImage.status !== 200) {
            throw `Response view Status: ${responseImage.status}`;
        }
        self.emitEvent(EServerEventTypes.addHistory, data[self.promptId])
        const imageData = await responseImage.arrayBuffer();
        const imageBlob = new Blob([imageData], {type: "image/png"});
        self.emitEvent(EServerEventTypes.previewImage, imageBlob)
        self.emitEvent(EServerEventTypes.changeTaskProgress, 1)
    }

    async getHistoryImage(image: EImageComfy) {
        const self = this;
        const url_values = serializeImageComfyData(image)
        const responseImage = await self.fetch(`/view?${url_values}`)
        if (!responseImage)
            return
        if (responseImage.status !== 200) {
            throw `Response view Status: ${responseImage.status}`;
        }
        const imageData = await responseImage.arrayBuffer();
        return new Blob([imageData], {type: "image/png"});
    }

    private getImageName() {
        return `${this.imageName}.png`
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
            const variable = this.taskVariables[keys[i]];
            if (variable === undefined ||
                variable === null ||
                !variable.hasOwnProperty('value')) {
                return false;
            }
            const value = variable.value
            if (value === undefined ||
                value === null ||
                (typeof value === "number" && isNaN(value))) {
                return false;
            }
        }
        return true;
    }

    private async createPromptTask() {
        if (!this.validatePromptTask()) {
            return;
        }
        let taskCopy: any = JSON.parse(JSON.stringify(this.task)); // Deep Copy
        taskCopy.client_id = this.clientId;
        if (this.taskVariables) {
            let imageMaxSize = Math.max(app.activeDocument.height, app.activeDocument.width);
            let size: any = {width: imageMaxSize}
            if (app.activeDocument.height > app.activeDocument.width)
                size = {height: imageMaxSize}

            if (findVal(this.task, '#image#')) {
                const responseUpload = await this.createUploadImage(this.getImageName(), true, size)
                if (!responseUpload)
                    return
                if (responseUpload.status !== 200) {
                    this.stopLoop();
                    throw `[ERROR] Upload Main Image: ${responseUpload.statusText} Status: ${responseUpload.status}`;
                }
            }
            findValAndReplace(taskCopy, '#image#', this.getImageName())

            const keys = Object.keys(this.taskVariables);
            for (let i = 0; i < keys.length; i++) {
                const key = keys[i];
                const variable = this.taskVariables[key];
                let value = variable.value === -1 || variable.value === "-1" ? randomSeed() : variable.value;

                if (typeof value === "object" &&
                    value._id !== undefined &&
                    value._docId !== undefined) {
                    const document = app.documents.find(doc => doc.id === value._docId)
                    if (!document) {
                        this.stopLoop();
                        throw `[ERROR] Document ${key}: Document from selected Layer not exist!`;
                    }

                    const allLayer = await getAllLayer(document);
                    const layer = allLayer.find(lay => lay.id === value._id)
                    if (!layer) {
                        this.stopLoop();
                        throw `[ERROR] Document ${key}: Selected Layer not exist!`;
                    }

                    const name = `upload_${key}.png`
                    const responseUpload = await this.createUploadImage(
                        name,
                        layer.positionLocked,
                        size,
                        value._docId,
                        value._id)
                    if (!responseUpload)
                        return
                    if (responseUpload.status !== 200) {
                        this.stopLoop();
                        throw `[ERROR] Upload Image ${key}: ${responseUpload.statusText} Status: ${responseUpload.status}`;
                    }
                    findValAndReplace(taskCopy, `#${key}.x#`, layer.bounds.left)
                    findValAndReplace(taskCopy, `#${key}.y#`, layer.bounds.top)
                    value = name;
                }
                findValAndReplace(taskCopy, `#${key}#`, value)
            }
        }
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
    "addHistory",
    "changeStatus",
    "changeTaskStatus",
    "changeNodeProgress",
    "changeTaskProgress",
    "changeLoopStatus",
    "error",
    "message",
    "previewImage",
    "getModels",
    "getEmbeddings",
    "getHistory",
    "sendPrompt",
    "onValidateTask"
}
