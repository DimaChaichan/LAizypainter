import {storage} from "uxp";
import {app} from "photoshop";
import {signal} from "@preact/signals";
import {EServerEventTypes, Server} from "../server/server.tsx";
import {ITaskVariable} from "../components/taskvariables/taskVariable.comp.tsx";


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

    let task: any;
    const taskName = signal<string | undefined>(undefined);
    const taskConfig = signal<ETaskConfig>({
        mode: "loop",
        uploadSize: 512
    });
    const taskVariables = signal<any>(undefined);
    const taskVariablesFlat = signal<any>({});
    const taskStatus = signal<ETaskStatus>(ETaskStatus.stop);
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
    const flatTaskConfig = (name: string, variable: ITaskVariable | any, obj: any) => {
        switch (variable.type) {
            case "row":
                Object.keys(variable).map(key => {
                    if (key !== "type" && key !== "advanced")
                        flatTaskConfig(key, variable[key], obj)
                })
                break;
            default:
                if (obj[name])
                    throw new Error(`[ERROR] Config with the name: ${name} exist multiple times!`);
                obj[name] = variable.value
                break;
        }
    }

    server.on(EServerEventTypes.changeStatus, (data) => {
        serverStatus.value = data;
    })
    server.on(EServerEventTypes.changeTaskStatus, (data) => {
        taskStatus.value = data;
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
        if (serverStatus.value == EServerStatus.connected) {
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
                server.imageHash = "";
                server.taskVariables = taskVariablesFlat.value;
            }, timer)
        } else {
            server.imageHash = "";
            server.taskVariables = taskVariablesFlat.value;
        }
    }

    // Force Rerender for Config
    const reRenderTaskVariables = () => {
        if (!taskVariablesFlat.value)
            return
        taskVariablesFlat.value = JSON.parse(JSON.stringify(taskVariablesFlat.value)); // Deep Copy
    }
    // TODO: Clean this Function, to much duplication, to noise
    const setTask = async (file: storage.File | undefined) => {
        if (file) {
            let data = JSON.parse((await file.read({format: storage.formats.utf8})).toString())
            if (!data.hasOwnProperty('prompt'))
                data = {prompt: data}
            if (data.hasOwnProperty('config')) {
                taskConfig.value = {
                    mode: data.config.mode ? data.config.mode : 'loop',
                    uploadSize: data.config.uploadSize ? data.config.uploadSize : 512
                }
            } else {
                taskConfig.value = {mode: "loop", uploadSize: 512};
            }
            if (data.hasOwnProperty('variables')) {
                let variables: any = {};
                try {
                    Object.keys(data.variables).map(key => {
                        flatTaskConfig(key, data.variables[key], variables)
                    })
                } catch (e: any) {
                    app.showAlert(e)
                    return
                }
                taskVariables.value = data.variables;
                taskVariablesFlat.value = variables
            } else {
                taskVariables.value = undefined;
                taskVariablesFlat.value = undefined;
            }

            task = data;
            server.task = task;
            taskName.value = file.name;
            previewImageUrl.value = '';
            server.taskConfig = taskConfig.value;
            server.taskVariables = taskVariablesFlat.value;
        } else {
            task = undefined;
            taskVariables.value = undefined;
            taskVariablesFlat.value = undefined;
            server.task = task;
            taskName.value = undefined;
            server.taskConfig = {mode: "loop", uploadSize: 512};
            server.taskVariables = undefined;
            previewImageUrl.value = '';
        }
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
        taskProgress,

        taskName,
        taskConfig,
        taskVariables,
        taskVariablesFlat,
        reRenderTaskVariables,
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
    uploadSize: number
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