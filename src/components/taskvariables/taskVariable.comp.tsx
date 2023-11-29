import {useContext, useEffect, useRef} from "react";
import {MutableRef} from "preact/hooks";
import {AppState} from "../../main.tsx";
import {randomSeed} from "../../utils.tsx";

export function TaskVariable(props: { variable: ITaskVariable | any, name: string, label: string }) {
    const state = useContext(AppState);

    let comp = null;
    let valid = true;
    const serVariable = (value: any, rerun: boolean, timer?: number) => {
        state.taskVariablesFlat.value[props.name] = value;
        if (rerun)
            state.rerunTask(timer);
    }
    const valueExistInMenu = (menu: Array<string>) => {
        if (!menu.some(model => model === state.taskVariablesFlat.value[props.name])) {
            state.taskVariablesFlat.value[props.name] = undefined;
            return false;
        }
        return true;
    }

    const handleCheckboxChange = (event: any) => {
        serVariable(event.target.checked, true);
    };
    const handleTextInput = (event: any) => {
        serVariable(event.target.value, true, 3000);
    };
    const handleOnChangesMenuCombo = (event: any) => {
        event.target.parentElement.removeAttribute('invalid')
        serVariable(event.target.value, true);
    }
    const handleNumberInput = (event: any) => {
        let newVal = event.target.value;
        newVal = parseFloat(newVal.replace(",", "."))

        if (!newVal) {
            event.target.setAttribute('invalid', true)
        } else {
            event.target.removeAttribute('invalid')
        }

        state.reRenderTaskVariables();
        serVariable(newVal, true, 2500);
    };

    const handleSliderInput = (event: any) => {
        serVariable(event.target.value, true, 1000);
    };

    switch (props.variable.type) {
        case "bool":
            if (typeof state.taskVariablesFlat.value[props.name] !== "boolean") {
                state.taskVariablesFlat.value[props.name] = false;
            }
            comp = (<sp-checkbox
                checked={state.taskVariablesFlat.value[props.name] ? state.taskVariablesFlat.value[props.name] : false}
                onChange={handleCheckboxChange}
                style={{width: "100%"}}>
                {props.label}
            </sp-checkbox>)
            break;
        case "text":
            comp = (<sp-textfield
                value={state.taskVariablesFlat.value[props.name] ? state.taskVariablesFlat.value[props.name].toString() : ""}
                onInput={handleTextInput}
                style={{width: "100%"}}>
                <sp-label slot="label"
                          className="theme-text">{props.label}
                </sp-label>
            </sp-textfield>)
            break;
        case "textarea":
            comp = (<sp-textarea className="theme-border"
                                 onInput={handleTextInput}
                                 value={state.taskVariablesFlat.value[props.name] ? state.taskVariablesFlat.value[props.name].toString() : ""}
                                 style={{width: "100%"}}>
                <sp-label slot="label"
                          className="theme-text">{props.label}
                </sp-label>
            </sp-textarea>)
            break;
        case "int":
            comp = (<sp-textfield className="theme-border"
                                  invalid={state.taskVariablesFlat.value[props.name] ? null : true}
                                  value={state.taskVariablesFlat.value[props.name] ? state.taskVariablesFlat.value[props.name].toString() : ""}
                                  style={{width: "100%"}}
                                  onInput={handleNumberInput}>
                <sp-label slot="label"
                          className="theme-text">{props.label}
                </sp-label>
            </sp-textfield>)
            break;
        case "number":
            comp = (<sp-textfield type="number" className="theme-border"
                                  invalid={state.taskVariablesFlat.value[props.name] ? null : true}
                                  value={state.taskVariablesFlat.value[props.name] ? state.taskVariablesFlat.value[props.name].toString() : ""}
                                  onInput={handleNumberInput}
                                  style={{width: "100%"}}>
                <sp-label slot="label"
                          className="theme-text">{props.label}
                </sp-label>
            </sp-textfield>)
            break;
        case "seed":
            if (state.taskVariablesFlat.value[props.name] === "random")
                state.taskVariablesFlat.value[props.name] = randomSeed();
            const handleSeedRandomClick = () => {
                state.taskVariablesFlat.value[props.name] = randomSeed();
                state.reRenderTaskVariables();
                state.rerunTask();
            };
            comp = (
                <div style={{width: "100%", display: "flex"}}>
                    <sp-textfield className="theme-border"
                                  invalid={state.taskVariablesFlat.value[props.name] ? null : true}
                                  value={state.taskVariablesFlat.value[props.name] ? state.taskVariablesFlat.value[props.name].toString() : ""}
                                  style={{width: "100%"}}
                                  onInput={handleNumberInput}>
                        <sp-label slot="label"
                                  className="theme-text">{props.label}
                        </sp-label>
                    </sp-textfield>
                    <sp-action-button onClick={handleSeedRandomClick} style={{marginTop: "25px"}}>
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
            const menuModels: MutableRef<any> = useRef(null);
            if (!valueExistInMenu(state.models.value))
                valid = false;

            useEffect(() => {
                menuModels.current?.addEventListener("change", handleOnChangesMenuCombo);
                return () => {
                    menuModels.current?.removeEventListener("change", handleOnChangesMenuCombo);
                };
            },)
            comp = (<sp-picker
                invalid={valid ? null : true}
                style={{width: "100%"}}>
                <sp-menu slot="options" ref={menuModels}>
                    {state.models.value.map(model =>
                        <sp-menu-item
                            value={model}
                            selected={state.taskVariablesFlat.value[props.name] && model === state.taskVariablesFlat.value[props.name] ?
                                true : null}>
                            {model}
                        </sp-menu-item>
                    )}
                </sp-menu>
                <sp-label slot="label">{props.label}</sp-label>
            </sp-picker>)
            break;
        case "lora":
            const menuLoras: MutableRef<any> = useRef(null);
            if (!valueExistInMenu(state.loras.value))
                valid = false;

            useEffect(() => {
                menuLoras.current?.addEventListener("change", handleOnChangesMenuCombo);
                return () => {
                    menuLoras.current?.removeEventListener("change", handleOnChangesMenuCombo);
                };
            },)
            comp = (<sp-picker
                invalid={valid ? null : true}
                style={{width: "100%"}}>
                <sp-menu slot="options" ref={menuLoras}>
                    {state.loras.value.map(lora =>
                        <sp-menu-item
                            value={lora}
                            selected={state.taskVariablesFlat.value[props.name] && lora === state.taskVariablesFlat.value[props.name] ?
                                true : null}>
                            {lora}
                        </sp-menu-item>
                    )}
                </sp-menu>
                <sp-label slot="label">{props.label}</sp-label>
            </sp-picker>)
            break;
        case "controlNet":
            const menuControlNet: MutableRef<any> = useRef(null);
            if (!valueExistInMenu(state.controlNetModels.value))
                valid = false;

            useEffect(() => {
                menuControlNet.current?.addEventListener("change", handleOnChangesMenuCombo);
                return () => {
                    menuControlNet.current?.removeEventListener("change", handleOnChangesMenuCombo);
                };
            },)
            comp = (<sp-picker
                invalid={valid ? null : true}
                style={{width: "100%"}}>
                <sp-menu slot="options" ref={menuControlNet}>
                    {state.controlNetModels.value.map(model =>
                        <sp-menu-item
                            value={model}
                            selected={state.taskVariablesFlat.value[props.name] && model === state.taskVariablesFlat.value[props.name] ?
                                true : null}>
                            {model}
                        </sp-menu-item>
                    )}
                </sp-menu>
                <sp-label slot="label">{props.label}</sp-label>
            </sp-picker>)
            break;
        case "combo":
            const menuCombo: MutableRef<any> = useRef(null);
            let comboOptions: Array<string> = [];
            if (props.variable.hasOwnProperty("options"))
                comboOptions = props.variable["options"]
            if (!valueExistInMenu(comboOptions))
                valid = false;

            useEffect(() => {
                menuCombo.current?.addEventListener("change", handleOnChangesMenuCombo);
                return () => {
                    menuCombo.current?.removeEventListener("change", handleOnChangesMenuCombo);
                };
            })
            comp = (<sp-picker
                invalid={valid ? null : true}
                style={{width: "100%"}}>
                <sp-menu slot="options" ref={menuCombo}>
                    {comboOptions.map(model =>
                        <sp-menu-item
                            value={model}
                            selected={state.taskVariablesFlat.value[props.name] && model === state.taskVariablesFlat.value[props.name] ?
                                true : null}>
                            {model}
                        </sp-menu-item>
                    )}
                </sp-menu>
                <sp-label slot="label">{props.label}</sp-label>
            </sp-picker>)
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
    return comp;
}

export interface ITaskVariable {
    type: "row" | "text" | "slider" | "bool" | "textarea" | "number"
    value: any
}