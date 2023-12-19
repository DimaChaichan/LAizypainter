import {useContext} from "react";
import {TaskVariable} from "./taskVariable.comp.tsx";
import {AppState} from "../../main.tsx";
import CollapseContainer from "../collapseContainer/collapseContainer.comp.tsx";
import {flatTaskConfig} from "../../utils.tsx";

export function TaskvariablesContainer() {
    const state = useContext(AppState);
    const taskValid = state.taskValid;
    let advancedOptions = [];
    if (state.taskVariables.value && state.taskVariables.value.hasOwnProperty("advanced")) {
        advancedOptions = Object.keys(state.taskVariables.value["advanced"]).map(key => {
            const variable = state.taskVariables.value["advanced"][key];
            variable.key = key;
            return variable;
        })
        advancedOptions = advancedOptions.filter((variable: any) => {
            return variable !== undefined
        });
    }
    let advancedOptionsFlat: any = {};
    for (let i = 0; i < advancedOptions.length; i++) {
        flatTaskConfig(advancedOptions[i].key, advancedOptions[i], advancedOptionsFlat)
    }
    const validateAdvancedOptions = () => {
        if (!advancedOptionsFlat)
            return true;
        const keys = Object.keys(advancedOptionsFlat);

        for (let i = 0; i < keys.length; i++) {
            const variable = state.taskVariablesFlat.value[keys[i]].value;
            if (variable === undefined ||
                variable === null ||
                (typeof variable === "number" && isNaN(variable))) {
                return false;
            }
        }
        return true;
    }
    return (
        <div style={{
            padding: "5px"
        }}>
            {state.taskVariables.value ?
                <>
                    <CollapseContainer
                        style={{overflow: "hidden"}}
                        expand={true}
                        invalid={!taskValid.value}
                        label={"Options"}
                        selected={false}>
                        <>
                            {
                                Object.keys(state.taskVariables.value).map(key => {
                                    const variable = state.taskVariables.value[key];
                                    if (variable.hasOwnProperty('advanced') && variable['advanced'])
                                        return null
                                    return (<TaskVariable
                                        name={key}
                                        variable={variable}
                                        label={variable.label ? variable.label : key}/>)
                                })
                            }
                            {advancedOptions.length > 0 ?
                                <CollapseContainer
                                    style={{
                                        marginTop: "5px"
                                    }}
                                    expand={false}
                                    invalid={!taskValid.value && !validateAdvancedOptions()}
                                    label={"Advanced Options"}
                                    noAutoSave={true}
                                    selected={false}>
                                    <div style={{
                                        overflow: "hidden",
                                        margin: "3px"
                                    }}>
                                        {
                                            advancedOptions.map((variable: any) => {
                                                if (!variable)
                                                    return
                                                return (<TaskVariable
                                                    name={variable.key}
                                                    variable={variable}
                                                    label={variable.label ? variable.label : variable.key}/>)
                                            })
                                        }
                                    </div>
                                </CollapseContainer>
                                :
                                null}
                        </>
                    </CollapseContainer>
                </>
                :
                null
            }
        </div>)
}
