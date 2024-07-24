import {useContext} from "react";
import {AppState} from "../../main.tsx";
import CollapseContainer from "../collapseContainer/collapseContainer.comp.tsx";
import {createFileInDataFolder, placeFileAsLayer, getSelection} from "../../utils.tsx";
import {Image} from "./image.comp.tsx";
import {app, core} from "photoshop";

export function ImagePreview() {
    const state = useContext(AppState);
    const handleImageAsLayerClick = async () => {
        if (!state.previewImageBlob.value)
            return
        const arrayBuffer = new Uint8Array(await state.previewImageBlob.value?.arrayBuffer());
        const tmpFile = await createFileInDataFolder('Preview.png')
        await tmpFile.write(arrayBuffer)

        const doc = app.activeDocument;
        const selection: any = await getSelection();
        if (selection) {
            await core.executeAsModal(async () => {
                    await doc.selection.save("lastSelection");
                },
                {"commandName": `Save Selection`})
        }
        await placeFileAsLayer(tmpFile);
        if (selection) {
            await core.executeAsModal(async () => {
                    for (let i = 0; i < doc.channels.length; i++) {
                        const channel = doc.channels[i];
                        if(channel.name === "lastSelection"){
                            await doc.selection.load(channel);
                            await channel.remove()
                        }
                    }
                },
                {"commandName": `Restore Selection`})
        }
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