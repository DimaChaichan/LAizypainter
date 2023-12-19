import {useContext, useEffect, useRef, useState} from "react";
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
    const image = useRef<HTMLInputElement>(null);
    // TODO: Replace this with CSS: Flex box
    const getSize = () => {
        const bodyOffsetWidth = document.body.offsetWidth;
        if (bodyOffsetWidth < 400) {
            return 400
        } else if (bodyOffsetWidth < 800) {
            return bodyOffsetWidth / 2 - 30
        } else if (bodyOffsetWidth < 1000) {
            return bodyOffsetWidth / 4 - 15
        } else {
            return 150
        }
    }
    const [size, setSize] = useState(getSize());

    const handleResize = () => {
        setSize(getSize())
    };
    useEffect(() => {
        document.body.addEventListener("resize", handleResize);
        return () => {
            document.body.removeEventListener("resize", handleResize);
        };
    },)
    const handleAddAsLayerClick = async () => {
        await placeComfyImageAsLayer(props.image, "History", state)
    }
    return (
        <div
            ref={image}
            style={{
                height: size + "px",
                width: size + "px",
                position: "relative"
            }} className="theme-border">
            <Image url={`${state.serverUrl}/view?${url_values}`} onPlaceToLayerCLick={handleAddAsLayerClick}/>
        </div>)
}
