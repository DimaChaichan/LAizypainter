import "./main.style.scss";
import {createRef} from "preact";
import {useContext, useEffect, useRef} from "react";
import {AppState, debug} from "../main.tsx";
import {
    ELoopStatus,
    EServerStatus,
    ETaskStatus
} from "../store/store.tsx";
import {openFileDialog} from "../utils.tsx";
import {app} from "photoshop";
import {TaskvariablesContainer} from "../components/taskvariables/taskvariablesContainer.comp.tsx";
import {ImagePreview} from "../components/imagePreview/imagePreview.comp.tsx";
import {Debug} from "../components/debug/debug.comp.tsx";
import {History} from "../components/history/history.comp.tsx";

export function MainPanel() {
    const state = useContext(AppState);
    const taskValid = state.taskValid;
    const serverUrl = useRef<HTMLInputElement>(null);
    const mainContainer = createRef();

    const handleConnectClick = () => {
        if (serverUrl.current)
            state.connectServer(serverUrl.current.value);
    };

    const handleOnKeyUpServerURL = (event: any) => {
        if (event.keyCode === 13 && serverUrl.current)
            state.connectServer(serverUrl.current.value);
    }
    const handleDisconnectClick = () => {
        state.disconnectServer();
    };
    const handleStartClick = () => {
        state.startLoop();
    };
    const handleStopClick = () => {
        state.stopLoop();
    };
    const handleSkipClick = () => {
        state.skipLoop();
    };

    const handleOpenTaskClick = () => {
        openFileDialog({
            types: ['lzy'],
            createPersistentToken: false
        }).then(file => {
            if (file)
                state.setTask(file).catch(error => app.showAlert(error))
        })
    };

    useEffect(() => {
        serverUrl.current?.addEventListener("keydown", handleOnKeyUpServerURL);
        return () => {
            serverUrl.current?.removeEventListener("keydown", handleOnKeyUpServerURL);
        };
    },)

    return (
        <div style={{height: "100%", padding: "5px"}}>
            {state.serverStatus.value !== EServerStatus.connected ?
                <div
                    style={{
                        width: "100%",
                        padding: "5px"
                    }}>
                    <sp-textfield value={state.serverUrl.value}
                                  style={{width: "100%"}}
                                  ref={serverUrl}>
                        <sp-label isrequired="true" slot="label"
                                  className="theme-text">Server URL
                        </sp-label>
                    </sp-textfield>
                    <sp-button
                        style={{
                            width: "100%",
                            marginTop: "10px"
                        }}
                        onClick={handleConnectClick}>
                        Connect
                    </sp-button>
                </div>
                : <>
                    <div style={{
                        width: "100%",
                        display: "flex",
                        padding: "10px 5px",
                        minHeight: "58px"
                    }}>
                        {state.taskName.value ?
                            <>

                                {state.loopStatus.value === ELoopStatus.stop ?
                                    <div style={{
                                        width: "100%",
                                    }}>
                                        <sp-button
                                            style={{
                                                width: "100%",
                                                whiteSpace: "nowrap"
                                            }}
                                            tabindex={1}
                                            onClick={handleStartClick}>
                                            <div style={{
                                                width: "100%",
                                                ontSize: "1em",
                                                fontWeight: "inherit",
                                                overflow: "hidden",
                                                textOverflow: "ellipsis"
                                            }} class="label">Start {state.taskName.value}</div>
                                        </sp-button>
                                        <div style={{
                                            width: "100%",
                                            display: "flex",
                                            marginTop: "5px"
                                        }}>
                                            <sp-action-button
                                                style={{
                                                    width: "100%"
                                                }}
                                                quiet={true}
                                                onClick={handleOpenTaskClick}>
                                                Open Task
                                            </sp-action-button>
                                            <sp-action-button
                                                style={{
                                                    width: "100%"
                                                }}
                                                quiet={true}
                                                onClick={handleDisconnectClick}>
                                                Disconnect
                                            </sp-action-button>
                                        </div>
                                    </div>
                                    :
                                    <>
                                        <sp-button
                                            tabindex={1}
                                            variant="warning"
                                            onClick={handleStopClick}>
                                            Stop
                                        </sp-button>
                                        {state.taskConfig.value.mode === "loop" ?
                                            <sp-button
                                                style={{
                                                    marginLeft: "5px"
                                                }}
                                                variant="secondary"
                                                onClick={handleSkipClick}>
                                                Skip
                                            </sp-button> :
                                            null}
                                        {state.taskStatus.value === ETaskStatus.run ?
                                            <div style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                width: "100%"
                                            }}>
                                                <sp-progressbar
                                                    style={{
                                                        width: "100%",
                                                        padding: "0 15px"
                                                    }}
                                                    max={1} value={state.taskProgress.value}>
                                                    <sp-label slot="label">Task {state.taskName.value} running...
                                                    </sp-label>
                                                </sp-progressbar>
                                                <sp-progressbar
                                                    size="small"
                                                    style={{
                                                        width: "100%",
                                                        padding: "3px 15px 0 15px"
                                                    }}
                                                    max={1} value={state.nodeProgress.value}>
                                                </sp-progressbar>
                                            </div>
                                            : state.taskStatus.value === ETaskStatus.pending ?
                                                <sp-label style={{
                                                    width: "100%",
                                                    padding: "0 15px"
                                                }}>Task is pending...</sp-label>
                                                :
                                                <div
                                                    style={{
                                                        width: "100%",
                                                        padding: "0 15px"
                                                    }}>
                                                    <sp-label
                                                        style={{
                                                            margin: "0",
                                                            padding: "0"
                                                        }}>Waiting for
                                                        changes! {!app.activeDocument ? " No Active Document!" : null}
                                                    </sp-label>
                                                    {!taskValid.value ?
                                                        <>
                                                            <br/>
                                                            <sp-label
                                                                style={{
                                                                    margin: "0",
                                                                    padding: "0"
                                                                }}
                                                                class="theme-color-warning">
                                                                Some Variables are not set!
                                                            </sp-label>
                                                        </>
                                                        :
                                                        null}
                                                </div>

                                        }
                                    </>
                                }
                            </> :
                            <div
                                style={{
                                    width: "100%"
                                }}>
                                <sp-button
                                    style={{
                                        width: "100%"
                                    }}
                                    onClick={handleOpenTaskClick}>
                                    Open Task
                                </sp-button>
                                <sp-action-button
                                    style={{
                                        width: "100%"
                                    }}
                                    quiet={true}
                                    onClick={handleDisconnectClick}>
                                    Disconnect
                                </sp-action-button>
                            </div>}
                    </div>
                    <sp-divider></sp-divider>
                    <div
                        ref={mainContainer}
                        style={{
                            width: "100%",
                            height: "calc(100% - 100px)",
                            overflow: "auto"
                        }}>
                        <ImagePreview/>
                        {state.taskName.value ?
                            <TaskvariablesContainer/>
                            : null
                        }
                        <History/>
                        {debug.value ?
                            <Debug/>
                            : null}
                    </div>
                </>}
        </div>
    );
}
