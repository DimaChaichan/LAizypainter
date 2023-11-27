import {useContext} from "react";
import {AppState} from "../../main.tsx";
import CollapseContainer from "../collapseContainer/collapseContainer.comp.tsx";
import {createFileInDataFolder, placeFileAsLayer} from "../../utils.tsx";
import {createRef} from "preact";

export function ImagePreview() {
    const state = useContext(AppState);
    const previewImage = createRef();
    const handleImageAsLayerClick = async () => {
        if (!state.previewImageBlob.value)
            return
        const arrayBuffer = new Uint8Array(await state.previewImageBlob.value?.arrayBuffer());
        const tmpFile = await createFileInDataFolder('Preview.png')
        await tmpFile.write(arrayBuffer)
        await placeFileAsLayer(tmpFile);
    };

    return (
        <div style={{
            padding: "5px"
        }}>
            {state.taskName.value ?
                <>
                    <CollapseContainer
                        expand={true}
                        label={"Image"}
                        selected={false}>
                        <>
                            {state.previewImageUrl.value && state.previewImageUrl.value !== "" ?
                                <div>
                                    {state.previewImageBlob.value ?
                                        <div style={{
                                            width: "100%",
                                            padding: "0 5px"
                                        }}>
                                            <sp-action-button
                                                style={{
                                                    width: "100%"
                                                }}
                                                onClick={handleImageAsLayerClick}>Image as Layer
                                            </sp-action-button>
                                        </div>
                                        :
                                        null
                                    }
                                    <img ref={previewImage}
                                         style={{width: '100%', padding: '5px'}}
                                         src={state.previewImageUrl.value}
                                         alt={'Preview'}
                                    ></img>
                                </div>
                                :
                                <div style={{
                                    width: "100%",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center"
                                }}>
                                    <sp-body size="XS">No Preview available!</sp-body>
                                </div>
                            }
                        </>
                    </CollapseContainer>
                </>
                :
                null
            }
        </div>)
}