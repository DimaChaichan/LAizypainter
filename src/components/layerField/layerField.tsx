import {app} from "photoshop";
import ComboBox, {ComboBoxDividerItem, ComboBoxItem} from "../comboBox/comboBox.comp.tsx";
import {Layer} from "photoshop/dom/Layer";
import {Document} from "photoshop/dom/Document";
import {useRef, useState} from "react";
import {MutableRef} from "preact/hooks";

function flatLayers(layer: Layer, array: Array<ComboBoxItem | ComboBoxDividerItem>) {
    if (layer.kind === "group") {
        if (layer.layers)
            for (let i = 0; i < layer.layers.length; i++) {
                flatLayers(layer.layers[i], array)
            }
    } else if (layer.kind === 'pixel' || layer.kind === 'smartObject')
        array.push({label: `${layer.name} : ${layer.document.name}`, value: layer})
}

export function LayerField(props: {
    label?: string,
    onChange?: (layer: Layer | Document, index?: number) => void,
}) {
    const comboBoxRef: MutableRef<any> = useRef(null);
    const getLayers = () => {
        const options: Array<ComboBoxItem | ComboBoxDividerItem> = [];
        for (let i = 0; i < app.documents.length; i++) {
            const document = app.documents[i];
            options.push({label: document.name});
            options.push({label: `Document: ${document.name}`, value: document})
            for (let j = 0; j < document.layers.length; j++) {
                flatLayers(document.layers[j], options)
            }
        }
        return options;
    }
    const [layers, setLayers] = useState<Array<ComboBoxItem | ComboBoxDividerItem>>([]);
    const handleOnChange = (value: Layer, index: number | undefined) => {
        props.onChange?.(value, index);
    }
    const handleOnOpen = () => {
        setLayers(getLayers())
    }
    const handleOnclickSelectedLayer = () => {
        if (app.activeDocument.activeLayers.length) {
            if (app.activeDocument.activeLayers[0].kind !== "pixel" &&
                app.activeDocument.activeLayers[0].kind !== "smartObject") {
                app.showAlert("Only pixel layer can be select!")
                return
            }
            const layer = app.activeDocument.activeLayers[0];
            comboBoxRef.current.setLabel(`${layer.name} : ${layer.document.name}`)
            props.onChange?.(app.activeDocument.activeLayers[0]);
        }
    }
    const handleOnclickSelectedDocument = () => {
        if (app.activeDocument) {
            comboBoxRef.current.setLabel(`Document: ${app.activeDocument.name}`);
            props.onChange?.(app.activeDocument);
        }
    }
    return (
        <div style={{width: "100%", minHeight: "33px", display: "flex"}}>
            <ComboBox ref={comboBoxRef} style={{width: "100%"}}
                      options={layers}
                      label={props.label}
                      onChange={handleOnChange}
                      onOpen={handleOnOpen}
                      minMenuWidth={300}/>
            <sp-action-button
                title="Select Active Layer"
                style={{
                    marginTop: "24px"
                }}
                onClick={handleOnclickSelectedLayer}>
                <div slot="icon" className="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18"
                         width="18" style={{fill: "currentColor"}}>
                        <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18"/>
                        <path className="fill"
                              d="M3.1135,10.1555H1A8.086,8.086,0,0,0,7.844,17V14.8865A6.00351,6.00351,0,0,1,3.1135,10.1555Z"/>
                        <path className="fill"
                              d="M14.8865,10.1555a6.0035,6.0035,0,0,1-4.7305,4.731V17A8.086,8.086,0,0,0,17,10.1555Z"/>
                        <path className="fill"
                              d="M7.844,3.114V1A8.0855,8.0855,0,0,0,1,7.844H3.114A6,6,0,0,1,7.844,3.114Z"/>
                        <path className="fill"
                              d="M14.886,7.844H17A8.0855,8.0855,0,0,0,10.156,1V3.114A6,6,0,0,1,14.886,7.844Z"/>
                    </svg>
                </div>
            </sp-action-button>
            <sp-action-button
                title="Select Active Document"
                style={{
                    marginTop: "24px"
                }}
                onClick={handleOnclickSelectedDocument}>
                <div slot="icon" className="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18"
                         width="18" style={{fill: "currentColor"}}>
                        <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18"/>
                        <path className="fill"
                              d="M10,5.5V1H3.5a.5.5,0,0,0-.5.5v15a.5.5,0,0,0,.5.5h11a.5.5,0,0,0,.5-.5V6H10.5A.5.5,0,0,1,10,5.5Z"/>
                        <path className="fill"
                              d="M11,1h.043a.5.5,0,0,1,.3535.1465l3.457,3.457A.5.5,0,0,1,15,4.957V5H11Z"/>
                    </svg>
                </div>
            </sp-action-button>
        </div>
    );
}

