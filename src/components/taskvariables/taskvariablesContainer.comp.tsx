import {useContext} from "react";
import {TaskVariable} from "./taskVariable.comp.tsx";
import {AppState} from "../../main.tsx";
import CollapseContainer from "../collapseContainer/collapseContainer.comp.tsx";

export function TaskvariablesContainer() {
    const state = useContext(AppState);
    let advancedOptions = Object.keys(state.taskVariables.value).map(key => {
        const variable = state.taskVariables.value[key];
        variable.key = key;
        return variable.hasOwnProperty('advanced') && variable['advanced'] ? variable : undefined
    })
    advancedOptions = advancedOptions.filter(variable => {
        return variable !== undefined
    });
    return (
        <div style={{
            padding: "5px"
        }}>
            {state.taskVariables.value ?
                <>
                    <CollapseContainer
                        expand={true}
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
                                    label={"Advanced Options"}
                                    noAutoSave={true}
                                    selected={false}>
                                    <div style={{
                                        overflow: "hidden",
                                        margin: "3px"
                                    }}>
                                        {
                                            advancedOptions.map(variable => {
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