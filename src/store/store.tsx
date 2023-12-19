import {storage} from "uxp";
import {app} from "photoshop";
import {signal} from "@preact/signals";
import {EServerEventTypes, Server} from "../server/server.tsx";
import {flatTaskConfig} from "../utils.tsx";


/**
 * Main Store
 * We use Preact Signals for handle all store data.
 */
export function createAppState() {
    const debug = signal(false);

    const server = new Server();
    const serverUrl = signal('http://127.0.0.1:8188');
    const serverStatus = signal<EServerStatus>(EServerStatus.disconnected);

    const loopStatus = signal<ELoopStatus>(ELoopStatus.stop);

    let currentTaskFile = "";
    let task: any;
    const taskName = signal<string | undefined>(undefined);
    const taskValid = signal<boolean>(false);
    const taskConfig = signal<ETaskConfig>({
        mode: "loop",
        uploadSize: 512
    });
    const taskVariables = signal<any>(undefined);
    const taskVariablesFlat = signal<any>({});
    const taskStatus = signal<ETaskStatus>(ETaskStatus.stop);
    const nodeProgress = signal(0);
    const taskProgress = signal(0);

    const history = signal<any>([])
    const getHistoryImage = async (image: EImageComfy) => {
        return server.getHistoryImage(image)
    }


    const previewImageUrl = signal('')
    const previewImageBlob = signal<Blob | undefined>(undefined)

    const models = signal<EModelsConfig>({
        checkpoints: [],
        clip: [],
        clipVision: [],
        controlnet: [],
        diffusers: [],
        embeddings: [],
        gligen: [],
        hypernetworks: [],
        loras: [],
        styleModels: [],
        upscaleModels: [],
        vae: []
    })
    const lastPrompt = signal<string>('')
    let rerunTimer: number;

    server.on(EServerEventTypes.changeStatus, (data) => {
        serverStatus.value = data;
    })
    server.on(EServerEventTypes.changeTaskStatus, (data) => {
        taskStatus.value = data;
    })
    server.on(EServerEventTypes.changeNodeProgress, (data) => {
        nodeProgress.value = data;
    })
    server.on(EServerEventTypes.changeTaskProgress, (data) => {
        taskProgress.value = data;
    })
    server.on(EServerEventTypes.changeLoopStatus, (data) => {
        loopStatus.value = data;
    })
    server.on(EServerEventTypes.getModels, (data) => {
        models.value = data;
    })
    server.on(EServerEventTypes.getEmbeddings, (data) => {
        models.value.embeddings = data;
    })
    server.on(EServerEventTypes.sendPrompt, (data) => {
        lastPrompt.value = data;
    })
    server.on(EServerEventTypes.addHistory, (data) => {
        history.value = [data, ...history.value]
    })
    server.on(EServerEventTypes.getHistory, (data) => {
        history.value = data;
    })
    server.on(EServerEventTypes.error, () => {
        app.showAlert(`Can't connect to the Server: ${serverUrl.value}`)
    })
    server.on(EServerEventTypes.onValidateTask, (valid) => {
        taskValid.value = valid;
    })
    server.on(EServerEventTypes.previewImage, (imageBlob) => {
        if (previewImageUrl.value)
            window.URL.revokeObjectURL(previewImageUrl.value);
        previewImageBlob.value = imageBlob;
        previewImageUrl.value = window.URL.createObjectURL(imageBlob);
    })

    const connectServer = (url: string) => {
        if (serverStatus.value === EServerStatus.connected ||
            serverStatus.value === EServerStatus.connecting)
            return
        serverUrl.value = url;
        server.connect(url);
    }
    const disconnectServer = () => {
        setTask(undefined);
        server.disconnect()
    }

    const startLoop = () => {
        if (serverStatus.value === EServerStatus.connected) {
            server.startLoop();
        }
    }
    const stopLoop = () => {
        server.stopLoop();
    }
    const skipLoop = () => {
        server.stopLoop(true);
    }
    const rerunTask = (timer?: number) => {
        if (rerunTimer)
            clearTimeout(rerunTimer)

        if (timer) {
            rerunTimer = setTimeout(() => {
                server.lastHistoryLength = -1;
                server.taskVariables = taskVariablesFlat.value;
            }, timer)
        } else {
            server.lastHistoryLength = -1;
            server.taskVariables = taskVariablesFlat.value;
        }
    }

    const saveTaskVariablesLocal = () => {
        if (!taskVariables.value)
            return
        localStorage.setItem('localVariables', JSON.stringify(taskVariablesFlat.value))
    }
    const validTask = () => {
        server.validTask()
    }

    const setTaskVariable = (name: string, value: any) => {
        const newTaskVariablesFlat: any = {};
        Object.keys(taskVariablesFlat.value).forEach((key) => {
            newTaskVariablesFlat[key] = name === key ? value : taskVariablesFlat.value[key];
        });
        server.taskVariables = newTaskVariablesFlat;
        taskVariablesFlat.value = newTaskVariablesFlat;
        validTask();
    }

    // TODO: Clean this Function, to much duplication, to noise
    const setTask = async (file: storage.File | undefined) => {
        if (currentTaskFile === file?.nativePath)
            return;

        if (file) {
            let data = JSON.parse((await file.read({format: storage.formats.utf8})).toString())
            if (!data.hasOwnProperty('prompt'))
                throw "Task has no Prompt section!"
            if (typeof data["prompt"] !== "object")
                throw "Prompt section is not a Object!"

            if (data.hasOwnProperty('config')) {
                taskConfig.value = {
                    mode: data.config.mode ? data.config.mode : 'loop',
                    uploadSize: data.config.uploadSize ? data.config.uploadSize : undefined
                }
            } else {
                taskConfig.value = {mode: "loop", uploadSize: undefined};
            }
            if (data.hasOwnProperty('variables')) {
                let variables: any = {};
                try {
                    Object.keys(data.variables).map(key => {
                        flatTaskConfig(key, data.variables[key], variables)
                    })
                } catch (e: any) {
                    app.showAlert("[ERROR] FlatTask " + e)
                    return
                }
                taskVariables.value = data.variables;

                const localVariableString = localStorage.getItem('localVariables')
                if (localVariableString) {
                    const localVariable = JSON.parse(localVariableString);
                    Object.keys(localVariable).map(key => {
                        variables[key] = localVariable[key]
                    })
                }
                taskVariablesFlat.value = variables
            } else {
                taskVariables.value = undefined;
                taskVariablesFlat.value = {};
            }

            task = data;
            server.task = task;
            taskName.value = data.config.label ? data.config.label : file.name;
            previewImageUrl.value = '';
            server.taskConfig = taskConfig.value;
            server.taskVariables = taskVariablesFlat.value;
            currentTaskFile = file.nativePath;
        } else {
            task = undefined;
            taskVariables.value = undefined;
            taskVariablesFlat.value = undefined;
            server.task = task;
            taskName.value = undefined;
            server.taskConfig = {mode: "loop", uploadSize: undefined};
            server.taskVariables = undefined;
            previewImageUrl.value = '';
        }
        server.validTask();
    }

    return {
        debug,

        serverUrl,

        connectServer,
        disconnectServer,

        startLoop,
        stopLoop,
        skipLoop,

        serverStatus,
        loopStatus,
        taskStatus,
        nodeProgress,
        taskProgress,

        taskName,
        setTaskVariable,
        taskValid,
        taskConfig,
        taskVariables,
        taskVariablesFlat,
        saveTaskVariablesLocal,
        validTask,
        rerunTask,
        setTask,
        lastPrompt,

        models,

        history,
        getHistoryImage,

        previewImageBlob,
        previewImageUrl
    }
}

// #######################################################
// Interface
export interface EModelsConfig {
    checkpoints: Array<string>
    clip: Array<string>
    clipVision: Array<string>
    controlnet: Array<string>
    diffusers: Array<string>
    embeddings: Array<string>
    gligen: Array<string>
    hypernetworks: Array<string>
    loras: Array<string>
    styleModels: Array<string>
    upscaleModels: Array<string>
    vae: Array<string>
}

export interface EImageComfy {
    filename: string,
    subfolder: string,
    type: string
}

export interface ETaskConfig {
    mode: "single" | "loop"
    uploadSize: number | undefined
}

export enum EServerStatus {
    disconnected = 'disconnected',
    connected = 'connected',
    connecting = 'connecting'
}

export enum ETaskStatus {
    stop = 'stop',
    stopping = 'stopping',
    pending = 'pending',
    run = 'run',
    done = 'done'
}

export enum ELoopStatus {
    stop = 'stop',
    run = 'run',
}
