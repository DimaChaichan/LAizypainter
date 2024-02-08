import {useContext, useState} from "react";
import {AppState} from "../../main.tsx";
import CollapseContainer from "../collapseContainer/collapseContainer.comp.tsx";
import {HistoryImage} from "./historyImage.comp.tsx";
import {EServerStatus} from "../../store/store.tsx";
import {serializeImageComfyData} from "../../utils.tsx";

export function History() {
    const state = useContext(AppState);
    let loadingCounter = 0;
    const loadingBatchCount = 20;

    const [loadingIndex, setLoadingIndex] = useState(0);
    const handleLoadMoreClick = async () => {
        setLoadingIndex(loadingIndex + loadingBatchCount);
    };
    return (
        <div style={{
            padding: "5px"
        }}>
            {state.serverStatus.value === EServerStatus.connected ?
                <>
                    <CollapseContainer
                        expand={true}
                        label={"History"}
                        selected={false}>
                        <div style={{
                            display: "flex",
                            flexWrap: "wrap",
                            overflow: "hidden"
                        }}>
                            {state.history.value.map((session: any) => {
                                const outputsNodes = Object.keys(session.outputs);
                                return (<>
                                    {outputsNodes.map(node => {
                                        return session.outputs[node].images.map((image: any) => {
                                            if(image.type !== "output")
                                                return null
                                            if (loadingCounter >= loadingIndex + loadingBatchCount)
                                                return null;
                                            loadingCounter++;
                                            return <HistoryImage key={serializeImageComfyData(image)} image={image}/>
                                        })
                                    })}
                                </>)
                            })}
                            {state.history.value.length > 0 ?
                                <>
                                    {state.history.value.length > loadingIndex + loadingBatchCount ?
                                        <div style={{
                                            width: "100%",
                                            padding: "0 5px"
                                        }}>
                                            <sp-action-button
                                                style={{
                                                    width: "100%"
                                                }}
                                                onClick={handleLoadMoreClick}>Load more
                                            </sp-action-button>
                                        </div>
                                        :
                                        <div style={{
                                            width: "100%",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center"
                                        }}>
                                            <sp-body size="XS">No more History exist!</sp-body>
                                        </div>
                                    }
                                </>
                                :
                                <div style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <sp-body size="XS">No History exist!</sp-body>
                                </div>
                            }
                        </div>
                    </CollapseContainer>
                </>
                :
                null
            }
        </div>)
}
