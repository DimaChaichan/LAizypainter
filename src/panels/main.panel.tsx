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

export function MainPanel() {
    const state = useContext(AppState);
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

    const handleOpenTaskClick = () => {
        openFileDialog({
            types: ['json'],
            createPersistentToken: true
        }).then(file => {
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
                    <sp-textfield className="theme-border"
                                  value={state.serverUrl.value}
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
                        padding: "10px 5px"
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
                                            variant="primary"
                                            onClick={handleStopClick}>
                                            Stop
                                        </sp-button>

                                        {state.taskStatus.value === ETaskStatus.run ?
                                            <sp-progressbar
                                                style={{
                                                    width: "100%",
                                                    padding: "0 15px"
                                                }}
                                                max={1} value={state.taskProgress.value}>
                                                <sp-label slot="label">Task {state.taskName.value} running...</sp-label>
                                            </sp-progressbar>
                                            : state.taskStatus.value === ETaskStatus.pending ?
                                                <sp-label style={{
                                                    width: "100%",
                                                    padding: "0 15px"
                                                }}>Task is pending...</sp-label>
                                                :
                                                <sp-label style={{
                                                    width: "100%",
                                                    padding: "0 15px"
                                                }}>Waiting for changes!</sp-label>
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
                            height: "100%",
                            overflow: "auto"
                        }}>
                        {state.taskName.value ?
                            <TaskvariablesContainer/>
                            : null
                        }
                        <ImagePreview/>
                        {debug.value ?
                            <Debug/>
                            : null}
                    </div>
                </>}
        </div>
    );
}