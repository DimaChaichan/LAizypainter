import {useContext} from "react";
import {EImageComfy} from "../../store/store.tsx";
import {
    placeComfyImageAsLayer,
    serializeImageComfyData
} from "../../utils.tsx";
import {AppState} from "../../main.tsx";
import {Image} from "../imagePreview/image.comp.tsx";

export function HistoryImage(props: {
    image: EImageComfy
}) {
    const state = useContext(AppState);
    const url_values = serializeImageComfyData(props.image)

    const handleAddAsLayerClick = async () => {
        await placeComfyImageAsLayer(props.image, "History", state)
    }
    return (
        <div style={{
            height: "180px",
            width: "180px",
            position: "relative"
        }}>
            <Image url={`${state.serverUrl}/view?${url_values}`} onPlaceToLayerCLick={handleAddAsLayerClick}/>
        </div>)
}