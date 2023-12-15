import {useContext, useState} from "react";
import {AppState} from "../../main.tsx";
import {randomSeed} from "../../utils.tsx";
import {TaskVariableModels} from "./taskVariableModels.comp.tsx";
import {NumberField} from "../numberField/numberField.comp.tsx";

export function TaskVariable(props: {
    variable: ITaskVariable | any,
    name: string,
    label: string,
}) {
    const state = useContext(AppState);
    // const variable = state.taskVariablesFlat.value[props.name];
    const [invalid, setInvalid] = useState(false);
    let value = state.taskVariablesFlat.value[props.name];

    let comp = null;
    const setVariable = (value: any, rerun: boolean, timer?: number) => {
        state.taskVariablesFlat.value[props.name] = value;
        state.validTask();
        if (rerun)
            state.rerunTask(timer);
        state.saveTaskVariablesLocal()
    }

    const handleCheckboxChange = (event: any) => {
        setVariable(event.target.checked, true);
    };
    const handleTextInput = (event: any) => {
        setVariable(event.target.value, true, 3000);
    };
    const handleNumberInput = (changeValue: string | undefined) => {
        setInvalid(!changeValue);
        setVariable(changeValue, true, 2500);
        state.reRenderTaskVariables();
    };
    const handleIntInput = (event: any) => {
        let newVal = event.target.value;
        if (newVal.slice(-1) === "-")
            return
        handleNumberInput(event);
    };

    const handleSliderInput = (event: any) => {
        setVariable(event.target.value, true, 1000);
    };

    switch (props.variable.type) {
        case "bool":
            if (typeof state.taskVariablesFlat.value[props.name] !== "boolean") {
                state.taskVariablesFlat.value[props.name] = false;
            }
            comp = (<sp-checkbox
                checked={value ? value : false}
                onChange={handleCheckboxChange}
                style={{width: "100%"}}>
                {props.label}
            </sp-checkbox>)
            break;
        case "text":
            comp = (<sp-textfield
                value={value ? value.toString() : ""}
                onInput={handleTextInput}
                style={{width: "100%"}}>
                <sp-label slot="label"
                          className="theme-text">{props.label}
                </sp-label>
            </sp-textfield>)
            break;
        case "textarea":
            comp = (<sp-textarea onInput={handleTextInput}
                                 value={value ? value.toString() : ""}
                                 style={{width: "100%"}}>
                <sp-label slot="label"
                          className="theme-text">{props.label}
                </sp-label>
            </sp-textarea>)
            break;
        case "int":
            comp = (
                <NumberField
                    type={"int"}
                    min={props.variable?.min}
                    max={props.variable?.max}
                    step={props.variable?.step}
                    label={props.label}
                    style={{width: "100%"}}
                    value={value}
                    onInput={handleNumberInput}/>)
            break;
        case "number":
            comp = (
                <NumberField
                    min={props.variable?.min}
                    max={props.variable?.max}
                    step={props.variable?.step}
                    label={props.label}
                    style={{width: "100%"}}
                    value={value}
                    onInput={handleNumberInput}/>)
            break;
        case "seed":
            if (state.taskVariablesFlat.value[props.name] === -1)
                state.taskVariablesFlat.value[props.name] = randomSeed();
            const handleSeedRandomClick = () => {
                setVariable(randomSeed(), true)
            };
            comp = (
                <div style={{width: "100%", display: "flex"}}>
                    <sp-textfield invalid={state.taskVariablesFlat.value[props.name] ? null : true}
                                  value={state.taskVariablesFlat.value[props.name] ? state.taskVariablesFlat.value[props.name].toString() : ""}
                                  style={{width: "100%"}}
                                  onInput={handleIntInput}>
                        <sp-label slot="label"
                                  className="theme-text">{props.label}
                        </sp-label>
                    </sp-textfield>
                    <sp-action-button onClick={handleSeedRandomClick} style={{marginTop: "25px", width: "25%"}}>
                        <div slot="icon" style="fill: currentColor">
                            <svg viewBox="0 0 36 36" style="width: 36px; height: 36px;">
                                <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18"/>
                                <path className="fill"
                                      d="M16.337,10H15.39a.6075.6075,0,0,0-.581.469A5.7235,5.7235,0,0,1,5.25,13.006l-.346-.3465L6.8815,10.682A.392.392,0,0,0,7,10.4a.4.4,0,0,0-.377-.4H1.25a.25.25,0,0,0-.25.25v5.375A.4.4,0,0,0,1.4,16a.3905.3905,0,0,0,.28-.118l1.8085-1.8085.178.1785a8.09048,8.09048,0,0,0,3.642,2.1655,7.715,7.715,0,0,0,9.4379-5.47434q.04733-.178.0861-.35816A.5.5,0,0,0,16.337,10Z"/>
                                <path className="fill"
                                      d="M16.6,2a.3905.3905,0,0,0-.28.118L14.5095,3.9265l-.178-.1765a8.09048,8.09048,0,0,0-3.642-2.1655A7.715,7.715,0,0,0,1.25269,7.06072q-.04677.17612-.08519.35428A.5.5,0,0,0,1.663,8H2.61a.6075.6075,0,0,0,.581-.469A5.7235,5.7235,0,0,1,12.75,4.994l.346.3465L11.1185,7.318A.392.392,0,0,0,11,7.6a.4.4,0,0,0,.377.4H16.75A.25.25,0,0,0,17,7.75V2.377A.4.4,0,0,0,16.6,2Z"/>
                            </svg>
                        </div>
                    </sp-action-button>
                </div>)
            break;
        case "slider":
            comp = (<sp-slider
                onInput={handleSliderInput}
                min={props.variable.min ? props.variable.min : 0}
                max={props.variable.max ? props.variable.max : 100}
                step={props.variable.step ? props.variable.step : 1}
                value={state.taskVariablesFlat.value[props.name] ? state.taskVariablesFlat.value[props.name] : 0}
                style={{width: "100%", padding: "0px 5px"}}>
                <sp-label slot="label">{props.label}</sp-label>
            </sp-slider>)
            break;
        case "model":
            comp = (<TaskVariableModels models={state.models.value.checkpoints} label={props.label} name={props.name}/>)
            break;
        case "clip":
            comp = (<TaskVariableModels models={state.models.value.clip} label={props.label} name={props.name}/>)
            break;
        case "clipVision":
            comp = (<TaskVariableModels models={state.models.value.clipVision} label={props.label} name={props.name}/>)
            break;
        case "controlNet":
            comp = (<TaskVariableModels models={state.models.value.controlnet} label={props.label} name={props.name}/>)
            break;
        case "diffusers":
            comp = (<TaskVariableModels models={state.models.value.diffusers} label={props.label} name={props.name}/>)
            break;
        case "embeddings":
            comp = (<TaskVariableModels models={state.models.value.embeddings} label={props.label} name={props.name}/>)
            break;
        case "gligen":
            comp = (<TaskVariableModels models={state.models.value.gligen} label={props.label} name={props.name}/>)
            break;
        case "hypernetworks":
            comp = (
                <TaskVariableModels models={state.models.value.hypernetworks} label={props.label} name={props.name}/>)
            break;
        case "lora":
            comp = (<TaskVariableModels models={state.models.value.loras} label={props.label} name={props.name}/>)
            break;
        case "styleModels":
            comp = (<TaskVariableModels models={state.models.value.styleModels} label={props.label} name={props.name}/>)
            break;
        case "upscaleModels":
            comp = (
                <TaskVariableModels models={state.models.value.upscaleModels} label={props.label} name={props.name}/>)
            break;
        case "vae":
            comp = (<TaskVariableModels models={state.models.value.vae} label={props.label} name={props.name}/>)
            break;
        case "combo":
            let comboOptions: Array<string> = [];
            if (props.variable.hasOwnProperty("options"))
                comboOptions = props.variable["options"]
            comp = (<TaskVariableModels models={comboOptions} label={props.label} name={props.name}/>)
            break;
        case "row":
            comp = (
                <div style={{display: "flex", width: "100%"}}>
                    {
                        Object.keys(props.variable).map(key => {
                            return (<TaskVariable
                                variable={props.variable[key]}
                                name={key}
                                label={props.variable[key].label ? props.variable[key].label : key}/>)
                        })
                    }
                </div>
            )
            break
    }

    if (!comp)
        return null;
    return (
        <div style={{
            padding: "0 1px",
            display: "flex",
            width: "100%",
        }}>
            <div style={{
                width: "100%",
                border: "solid 1px transparent",
                borderRadius: "5px",
                padding: "0 1px"
            }}
                 className={invalid ? "theme-border-warning" : ""}>
                {comp}
            </div>
        </div>
    );
}


export interface ITaskVariable {
    type: "row" | "text" | "slider" | "bool" | "textarea" | "number"
    value: any
}
