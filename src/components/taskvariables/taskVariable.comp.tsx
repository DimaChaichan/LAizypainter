import {useContext, useState} from "react";
import {AppState} from "../../main.tsx";
import {randomSeed} from "../../utils.tsx";
import {NumberField} from "../numberField/numberField.comp.tsx";
import {SeedField} from "../seedInput/seedInput.comp.tsx";
import {ComboBox} from "../comboBox/comboBox.comp.tsx";

export function TaskVariable(props: {
    variable: ITaskVariable | any,
    name: string,
    label: string,
}) {
    let comp = null;
    const state = useContext(AppState);
    let value = state.taskVariablesFlat.value[props.name];

    const [invalid, setInvalid] = useState(false);

    // #######################################################
    // Helper

    const setVariable = (newValue: any, rerun: boolean, timer?: number) => {
        state.setTaskVariable(props.name, newValue)
        if (rerun)
            state.rerunTask(timer);
        state.saveTaskVariablesLocal()
    }

    const checkComboMenuValue = (options: Array<string>, value: string) => {
        const option = options.some(option => option === value);
        if (!option) {
            state.taskVariablesFlat.value[props.name].value = undefined;
            setInvalid(true);
        }
    }

    // #######################################################
    // Events

    const handleCheckboxChange = (event: any) => {
        setVariable(event.target.checked, true);
    };
    const handleTextInput = (event: any) => {
        setVariable(event.target.value, true, 3000);
        if (props.variable.required) {
            setInvalid(!event.target.value);
        }
    };
    const handleOnChangeComboBox = (option: string) => {
        setVariable(option, true);
        setInvalid(option === "");
    };

    const handleNumberInput = (changeValue: string | undefined) => {
        setVariable(changeValue, true, 2500);
        setInvalid(!changeValue);
    };

    const handleSliderInput = (event: any) => {
        setVariable(event.target.value, true, 1000);
    };

    const handleSeedRandomClick = () => {
        setVariable(randomSeed().toString(), true);
        setInvalid(false);
    };

    switch (props.variable.type) {
        case "bool":
            if (typeof value.value !== "boolean") {
                value.value = false;
            }
            comp = (<sp-checkbox
                checked={value ? value.value : false}
                onChange={handleCheckboxChange}
                style={{width: "100%"}}>
                {props.label}
            </sp-checkbox>)
            break;
        case "text":
            comp = (<sp-textfield
                value={value ? value.value.toString() : ""}
                onInput={handleTextInput}
                style={{width: "100%"}}>
                <sp-label slot="label"
                          className="theme-text">{props.label}
                </sp-label>
            </sp-textfield>)
            break;
        case "textarea":
            comp = (<sp-textarea onInput={handleTextInput}
                                 value={value ? value.value.toString() : ""}
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
                    value={value.value}
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
                    value={value.value}
                    onInput={handleNumberInput}/>)
            break;
        case "seed":
            if (value.value === "random") {
                state.taskVariablesFlat.value[props.name].value = randomSeed().toString();
                value.value = state.taskVariablesFlat.value[props.name].value;
            }
            comp = (
                <SeedField
                    max={props.variable?.max}
                    label={props.label}
                    style={{width: "100%"}}
                    value={value.value}
                    onInput={handleNumberInput}
                    onRandomClick={handleSeedRandomClick}/>)
            break;
        case "slider":
            comp = (<sp-slider
                onInput={handleSliderInput}
                min={props.variable.min ? props.variable.min : 0}
                max={props.variable.max ? props.variable.max : 100}
                step={props.variable.step ? props.variable.step : 1}
                value={value ? value.value : 0}
                style={{width: "100%", padding: "0px 5px"}}>
                <sp-label slot="label">{props.label}</sp-label>
            </sp-slider>)
            break;
        case "model":
            checkComboMenuValue(state.models.value.checkpoints, value.value)
            comp = (<ComboBox options={state.models.value.checkpoints}
                              onChange={handleOnChangeComboBox}
                              label={props.label}
                              value={value.value}
                              minMenuWidth={300}/>)
            break;
        case "clip":
            checkComboMenuValue(state.models.value.clip, value.value)
            comp = (<ComboBox options={state.models.value.clip}
                              onChange={handleOnChangeComboBox}
                              label={props.label}
                              value={value.value}
                              minMenuWidth={300}/>)
            break;
        case "clipVision":
            checkComboMenuValue(state.models.value.clipVision, value.value);
            comp = (<ComboBox options={state.models.value.clipVision}
                              onChange={handleOnChangeComboBox}
                              label={props.label}
                              value={value.value}
                              minMenuWidth={300}/>)
            break;
        case "controlNet":
            checkComboMenuValue(state.models.value.controlnet, value.value);
            comp = (<ComboBox options={state.models.value.controlnet}
                              onChange={handleOnChangeComboBox}
                              label={props.label}
                              value={value.value}
                              minMenuWidth={300}/>)
            break;
        case "diffusers":
            checkComboMenuValue(state.models.value.diffusers, value.value);
            comp = (<ComboBox options={state.models.value.diffusers}
                              onChange={handleOnChangeComboBox}
                              label={props.label}
                              value={value.value}
                              minMenuWidth={300}/>)
            break;
        case "embeddings":
            checkComboMenuValue(state.models.value.embeddings, value.value);
            comp = (<ComboBox options={state.models.value.embeddings}
                              onChange={handleOnChangeComboBox}
                              label={props.label}
                              value={value.value}
                              minMenuWidth={300}/>)
            break;
        case "gligen":
            checkComboMenuValue(state.models.value.gligen, value.value);
            comp = (<ComboBox options={state.models.value.gligen}
                              onChange={handleOnChangeComboBox}
                              label={props.label}
                              value={value.value}
                              minMenuWidth={300}/>)
            break;
        case "hypernetworks":
            checkComboMenuValue(state.models.value.hypernetworks, value.value);
            comp = (<ComboBox options={state.models.value.hypernetworks}
                              onChange={handleOnChangeComboBox}
                              label={props.label}
                              value={value.value}
                              minMenuWidth={300}/>)
            break;
        case "lora":
            checkComboMenuValue(state.models.value.loras, value.value);
            comp = (<ComboBox options={state.models.value.loras}
                              onChange={handleOnChangeComboBox}
                              label={props.label}
                              value={value.value}
                              minMenuWidth={300}/>)
            break;
        case "styleModels":
            checkComboMenuValue(state.models.value.styleModels, value.value);
            comp = (<ComboBox options={state.models.value.styleModels}
                              onChange={handleOnChangeComboBox}
                              label={props.label}
                              value={value.value}
                              minMenuWidth={300}/>)
            break;
        case "upscaleModels":
            checkComboMenuValue(state.models.value.upscaleModels, value.value);
            comp = (<ComboBox options={state.models.value.upscaleModels}
                              onChange={handleOnChangeComboBox}
                              label={props.label}
                              value={value.value}
                              minMenuWidth={300}/>)
            break;
        case "vae":
            checkComboMenuValue(state.models.value.vae, value.value);
            comp = (<ComboBox options={state.models.value.vae}
                              onChange={handleOnChangeComboBox}
                              label={props.label}
                              value={value.value}
                              minMenuWidth={300}/>)
            break;
        case "combo":
            let comboOptions: Array<string> = [];
            if (props.variable.hasOwnProperty("options"))
                comboOptions = props.variable["options"]
            checkComboMenuValue(comboOptions, value.value);
            comp = (<ComboBox options={comboOptions}
                              onChange={handleOnChangeComboBox}
                              label={props.label}
                              value={value.value}
                              minMenuWidth={300}/>)
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
