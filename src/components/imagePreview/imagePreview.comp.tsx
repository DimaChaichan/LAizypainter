import {useContext} from "react";
import {AppState} from "../../main.tsx";
import CollapseContainer from "../collapseContainer/collapseContainer.comp.tsx";
import {createFileInDataFolder, placeFileAsLayer} from "../../utils.tsx";
import {Image} from "./image.comp.tsx";

export function ImagePreview() {
    const state = useContext(AppState);
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
                        <div style={{
                            height: "350px",
                            overflow: "hidden"
                        }}>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                height: "100%"
                            }}>
                                {state.previewImageUrl.value && state.previewImageUrl.value !== "" ?
                                    <Image url={state.previewImageUrl.value}
                                           onPlaceToLayerCLick={handleImageAsLayerClick}/>
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
                            </div>
                        </div>
                    </CollapseContainer>
                </>
                :
                null
            }
        </div>)
}