import {useContext} from "react";
import {AppState} from "../../main.tsx";
import CollapseContainer from "../collapseContainer/collapseContainer.comp.tsx";
import {saveFileDialog} from "../../utils.tsx";
import {app} from "photoshop";

/**
 * Debug Component shop last prompt
 * @constructor
 */
export function Debug() {
    const state = useContext(AppState);
    const handleDownloadClick = () => {
        saveFileDialog("prompt.json", {types: ['js']}).then(file => {
            if (file)
                file.write(state.lastPrompt.value).catch(err => app.showAlert(err))
        })
    }
    return (
        <div style={{
            padding: "5px"
        }}>
            <CollapseContainer
                expand={true}
                label={"Debug"}
                selected={false}>
                <div style={{
                    overflow: "hidden"
                }}>
                    {state.lastPrompt.value ?
                        <>
                            <div style={{
                                width: "100%",
                                display: "flex",
                                flexDirection: "row-reverse"
                            }}>
                                <sp-action-button title="Download Prompt"
                                                  onClick={handleDownloadClick}>
                                    <div slot="icon" style="fill: currentColor">
                                        <svg height="36" viewBox="0 0 36 36" width="36">
                                            <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18"/>
                                            <path className="fill"
                                                  d="M16.5,12h-1a.5.5,0,0,0-.5.5V15H3V12.5a.5.5,0,0,0-.5-.5h-1a.5.5,0,0,0-.5.5v4a.5.5,0,0,0,.5.5h15a.5.5,0,0,0,.5-.5v-4A.5.5,0,0,0,16.5,12Z"/>
                                            <path className="fill"
                                                  d="M8.8245,13.428a.25.25,0,0,0,.35,0L12.9,9.6655a.391.391,0,0,0,.1-.263.4.4,0,0,0-.4-.4H10V1.5A.5.5,0,0,0,9.5,1h-1a.5.5,0,0,0-.5.5V9H5.4a.4.4,0,0,0-.4.4.391.391,0,0,0,.1.263Z"/>
                                        </svg>
                                    </div>
                                </sp-action-button>
                            </div>
                            <sp-body size="S" style={{whiteSpace: "pre-wrap"}}>{state.lastPrompt.value}</sp-body>
                        </>
                        :
                        <div style={{
                            width: "100%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <sp-body size="XS">No Prompt available!</sp-body>
                        </div>}
                </div>
            </CollapseContainer>
        </div>)
}