import {useContext} from "react";
import {TaskVariable} from "./taskVariable.comp.tsx";
import {AppState} from "../../main.tsx";
import CollapseContainer from "../collapseContainer/collapseContainer.comp.tsx";

export function TaskvariablesContainer() {
    const state = useContext(AppState);

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
                                    return (<TaskVariable
                                        name={key}
                                        variable={state.taskVariables.value[key]}
                                        label={state.taskVariables.value[key].label ? state.taskVariables.value[key].label : key}/>)
                                })
                            }
                        </>
                    </CollapseContainer>
                </>
                :
                null
            }
        </div>)
}