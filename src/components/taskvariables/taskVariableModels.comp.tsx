import {useContext, useEffect, useRef} from "react";
import {AppState} from "../../main.tsx";
import {MutableRef} from "preact/hooks";

export function TaskVariableModels(props: { models: Array<string>, name: string, label: string }) {
    const state = useContext(AppState);
    let valid = true;
    const menuModels: MutableRef<any> = useRef(null);
    const handleOnChangesMenuCombo = (event: any) => {
        event.target.parentElement.removeAttribute('invalid')
        state.taskVariablesFlat.value[props.name] = event.target.value;
        state.rerunTask();
    }
    const valueExistInMenu = () => {
        if (!props.models.some(model => model === state.taskVariablesFlat.value[props.name])) {
            // state.taskVariablesFlat.value[props.name] = undefined;
            return false;
        }
        return true;
    }
    if (!valueExistInMenu())
        valid = false;

    useEffect(() => {
        menuModels.current?.addEventListener("change", handleOnChangesMenuCombo);
        return () => {
            menuModels.current?.removeEventListener("change", handleOnChangesMenuCombo);
        };
    })
    return (
        <sp-picker
            invalid={valid ? null : true}
            style={{width: "100%"}}>
            <sp-menu slot="options" ref={menuModels}>
                {props.models.map(model =>
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
}