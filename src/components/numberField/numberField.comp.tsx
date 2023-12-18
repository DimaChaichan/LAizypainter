import {CSSProperties, useEffect, useRef} from "react";
import {isNumberInvalid} from "../../utils.tsx";
import Mexp from "math-expression-evaluator";

export function NumberField(props: {
    type?: "float" | "int",
    value?: number,
    step?: number,
    min?: number,
    max?: number,
    onInput?: (value: string | undefined) => void
    label?: string
    style?: CSSProperties;
}) {
    const input = useRef<HTMLInputElement>(null);
    const type = props.type ? props.type : "float";
    const increaseDecreaseNumber = (method: '+' | '-') => {
        if (input.current &&
            input.current.value !== undefined &&
            input.current.value !== null) {
            const step = props.step ? props.type !== "int" ? props.step : 1 : 1;
            const mexp = new Mexp();
            input.current.value =
                // @ts-ignore
                mexp.eval(`${input.current.value} ${method} ${step}`).toString();
            updateValue(input.current.value);
        }
    }

    const checkMinMax = (value: number | undefined) => {
        if (value === undefined)
            return value;
        if (props.min && value < props.min)
            return props.type === "int" ? Math.round(props.min) : props.min;
        if (props.max && value > props.max)
            return props.type === "int" ? Math.round(props.max) : props.max;
        if(value === Infinity)
            return Number.MAX_SAFE_INTEGER;
        if(value === -Infinity)
            return Number.MIN_SAFE_INTEGER;
        return value
    }

    const updateValue = (value: string | undefined) => {
        if (value !== undefined && value !== null) {
            let newVal: any = parseFloat(value.replace(",", "."))
            newVal = checkMinMax(newVal);
            if (!isNumberInvalid(newVal)) {
                if (props.type === "int")
                    newVal = Math.round(newVal);
                newVal = newVal.toString()
            } else
                newVal = undefined;
            props.onInput?.(newVal);
        } else
            props.onInput?.(undefined);
    }

    const handleNumberInput = (event: any) => {
        let newVal = event.target.value;
        const lastChar = newVal.slice(-1)
        if (lastChar === "-")
            return
        if (type == "float" &&
            (lastChar === "," || lastChar === "."))
            return
        updateValue(newVal);
    };

    const handleOnKeyUpInput = (event: any) => {
        if (input.current) {
            if (event.key === "ArrowUp")
                increaseDecreaseNumber("+")
            if (event.key === "ArrowDown")
                increaseDecreaseNumber("-")
        }
    }

    useEffect(() => {
        input.current?.addEventListener("keydown", handleOnKeyUpInput);
        return () => {
            input.current?.removeEventListener("keydown", handleOnKeyUpInput);
        };
    },)

    props.value = checkMinMax(props.value);
    if (props.value && isNumberInvalid(props.value))
        updateValue(undefined);
    return (<div
        style={{
            ...props.style,
            display: "flex",
        }}>
        <sp-textfield
            ref={input}
            value={props.value !== undefined && props.value !== null ? props.value.toString() : ""}
            onInput={handleNumberInput}
            style={{
                width: "100%"
            }}>
            {props.label ?
                <sp-label slot="label"
                          className="theme-text">{props.label}
                </sp-label> :
                null}
        </sp-textfield>
        <div style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: "30px",
            height: "33px",
            marginTop: "24px",
            marginRight: "3px"
        }}>
            <sp-action-button onClick={() => increaseDecreaseNumber("+")}>
                <div slot="icon" className="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18"
                         style={{fill: "currentColor"}}>
                        <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18"/>
                        <path className="fill"
                              d="M14,10.99a1,1,0,0,1-1.7055.7055l-3.289-3.286-3.289,3.286a1,1,0,0,1-1.437-1.3865l.0245-.0245L8.3,6.2925a1,1,0,0,1,1.4125,0L13.707,10.284A.9945.9945,0,0,1,14,10.99Z"/>
                    </svg>
                </div>
            </sp-action-button>
            <sp-action-button onClick={() => increaseDecreaseNumber("-")}>
                <div slot="icon" className="icon">
                    <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18"
                         width="18" style={{fill: "currentColor"}}>
                        <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18"/>
                        <path className="fill"
                              d="M4,7.01a1,1,0,0,1,1.7055-.7055l3.289,3.286,3.289-3.286a1,1,0,0,1,1.437,1.3865l-.0245.0245L9.7,11.7075a1,1,0,0,1-1.4125,0L4.293,7.716A.9945.9945,0,0,1,4,7.01Z"/>
                    </svg>
                </div>
            </sp-action-button>
        </div>
    </div>)
}
