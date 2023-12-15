import {useContext, useState} from "react";
import {AppState} from "../../main.tsx";
import {randomSeed} from "../../utils.tsx";
import {TaskVariableModels} from "./taskVariableModels.comp.tsx";
import {NumberField} from "../numberField/numberField.comp.tsx";
import {SeedField} from "../seedInput/seedInput.comp.tsx";

export function TaskVariable(props: {
    variable: ITaskVariable | any,
    name: string,
    label: string,
}) {
    const state = useContext(AppState);
    let value = state.taskVariablesFlat.value[props.name];
    const [invalid, setInvalid] = useState(false);

    let comp = null;
    const setVariable = (newValue: any, rerun: boolean, timer?: number) => {
        state.taskVariablesFlat.value[props.name] = newValue;
        if (rerun)
            state.rerunTask(timer);
        state.saveTaskVariablesLocal()
    }

    const handleCheckboxChange = (event: any) => {
        setVariable(event.target.checked, true);
    };
    const handleTextInput = (event: any) => {
        if (props.variable.required) {
            setInvalid(!event.target.value);
            state.validTask();
        }
        setVariable(event.target.value, true, 3000);
    };
    const handleNumberInput = (changeValue: string | undefined) => {
        setInvalid(!changeValue);
        state.validTask();
        setVariable(changeValue, true, 2500);
        state.reRenderTaskVariables();
    };

    const handleSliderInput = (event: any) => {
        setVariable(event.target.value, true, 1000);
    };

    const handleSeedRandomClick = () => {
        setVariable(randomSeed().toString(), true);
        setInvalid(false);
        state.validTask();
        state.reRenderTaskVariables();
    };

    switch (props.variable.type) {
        case "bool":
            if (typeof value !== "boolean") {
                value = false;
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
            if (value === "random") {
                state.taskVariablesFlat.value[props.name] = randomSeed().toString();
                value = state.taskVariablesFlat.value[props.name];
            }
            comp = (
                <SeedField
                    max={props.variable?.max}
                    label={props.label}
                    style={{width: "100%"}}
                    value={value}
                    onInput={handleNumberInput}
                    onRandomClick={handleSeedRandomClick}/>)
            break;
        case "slider":
            comp = (<sp-slider
                onInput={handleSliderInput}
                min={props.variable.min ? props.variable.min : 0}
                max={props.variable.max ? props.variable.max : 100}
                step={props.variable.step ? props.variable.step : 1}
                value={value ? value : 0}
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
    console.log(state.taskVariablesFlat.value)
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
                padding: "0 1px 1px 1px"
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
