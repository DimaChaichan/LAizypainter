import "./comboBox.style.scss"
import {MutableRef} from "preact/hooks";
import {CSSProperties, forwardRef, useEffect, useImperativeHandle, useRef, useState} from "react";

function ComboBox(props: {
    options: Array<ComboBoxItem | ComboBoxDividerItem | string | "divider">,
    minMenuWidth?: number,
    value?: string,
    label?: string,
    labelIcon?: any,
    onChange?: (option: any, index?: number) => void,
    onOpen?: () => void,
    style?: CSSProperties,
}, ref: any,) {
    const containerRef: MutableRef<any> = useRef(null);
    const searchFieldRef: MutableRef<any> = useRef(null);
    const popoverRef: MutableRef<any> = useRef(null);

    const getMenuWidth = () => {
        if (containerRef.current) {
            let width = containerRef.current.offsetWidth;
            if (props.minMenuWidth && width < props.minMenuWidth)
                width = props.minMenuWidth;
            return `${width}px`
        }
        return "100%"
    }
    const checkValue = (value: ComboBoxItem | ComboBoxDividerItem | string | undefined) => {
        if (!value)
            return value;
        return props.options.find(option => option === value)
    }
    const checkValueIndex = (value: ComboBoxItem | ComboBoxDividerItem | string | undefined) => {
        if (!value)
            return 0;
        return props.options.findIndex(option => option === value)
    }
    const [value, setValue] =
        useState<ComboBoxItem | ComboBoxDividerItem | string | undefined>(checkValue(props.value));
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(checkValueIndex(props.value));
    const [hoverIndex, setHoverIndex] = useState(-1);
    const [menuWidth, setMenuWidth] = useState(getMenuWidth());

    useImperativeHandle(ref, () => {
        return {
            setLabel(value: any) {
                setValue(value)
            },
        };
    }, [value]);

    const checkCanOptionSelect = (option: ComboBoxItem | ComboBoxDividerItem | string) => {
        if (typeof option === "object"
            && option.hasOwnProperty("label")
            && option.hasOwnProperty("value")
            && (option as ComboBoxItem).label.toLowerCase().includes(query.toLowerCase()))
            return true
        else if (typeof option === "string" && option.toLowerCase().includes(query.toLowerCase()))
            return true
        else
            return false
    }

    const handleOnKeyDownInput = (event: any) => {
        if (searchFieldRef.current) {
            if (event.key === "ArrowUp") {
                for (let i = hoverIndex - 1; i >= 0; i--) {
                    const option = props.options[i];
                    if (checkCanOptionSelect(option)) {
                        setHoverIndex(i)
                        break;
                    }
                }
            }
            if (event.key === "ArrowDown") {
                for (let i = hoverIndex + 1; i < props.options.length; i++) {
                    const option = props.options[i];
                    if (checkCanOptionSelect(option)) {
                        setHoverIndex(i);
                        break;
                    }
                }
            }
            if (event.key === "Enter" && hoverIndex >= 0) {
                handleOnClickMenuItem(hoverIndex);
            }
        }
    }

    useEffect(() => {
        searchFieldRef.current?.addEventListener("keydown", handleOnKeyDownInput);
        return () => {
            searchFieldRef.current?.removeEventListener("keydown", handleOnKeyDownInput);
        };
    },)

    const handleOnclickOpenCloseBtn = () => {
        if (searchFieldRef.current) {
            setQuery("");
        }
        setHoverIndex(-1);
        setMenuWidth(getMenuWidth());
        popoverRef.current?.setAttribute("open", "true");
        props.onOpen?.();
    };
    const handleOnClickMenuItem = (index: number) => {
        popoverRef.current?.removeAttribute("open");
        setSelectedIndex(index)

        const optionIndex = props.options[index];
        setValue(optionIndex)
        if (typeof optionIndex === "object" && optionIndex.hasOwnProperty("value"))
            props.onChange?.((optionIndex as { value: string, label: string }).value, index);
        if (typeof optionIndex === "string")
            props.onChange?.(optionIndex, index);
    };
    const handleOnInputSearch = (event: any) => {
        setHoverIndex(-1);
        setQuery(event.target.value);
    };
    return (
        <div ref={ref} style={props.style}>
            <div ref={containerRef} style={{width: "100%", minHeight: "33px"}}>

                <sp-overlay style={{
                    transform: "translateY(15px)",
                    height: "0"
                }}>
                    <sp-popover
                        ref={popoverRef}
                        placement="auto"
                        alignment="auto"
                        slot="click"

                        appearance="none">
                        <sp-textfield ref={searchFieldRef}
                                      type="search"
                                      placeholder="Search..."
                                      style={{paddingLeft: '2px', width: '100%'}}
                                      value={query}
                                      onInput={handleOnInputSearch}
                        />
                        <div
                            style={{
                                width: menuWidth,
                                maxHeight: "300px",
                                overflow: "auto"
                            }}>
                            <div className={"auto-menu"}>
                                {
                                    props.options.map((option, index) => {
                                        if (option === "divider")
                                            return (<>
                                                <sp-menu-divider></sp-menu-divider>
                                            </>)
                                        else if (typeof option === "object"
                                            && option.hasOwnProperty("label")
                                            && !option.hasOwnProperty("value")) {
                                            return (<>
                                                <sp-label style={{paddingLeft: '5px'}} size="S"
                                                          slot="description">{option.label}
                                                </sp-label>
                                                <sp-menu-divider></sp-menu-divider>
                                            </>)
                                        } else if (typeof option === "object"
                                            && option.hasOwnProperty("label")
                                            && option.hasOwnProperty("value")
                                            && (option as ComboBoxItem).label.toLowerCase().includes(query.toLowerCase()))
                                            return (<sp-menu-item
                                                selected={selectedIndex !== -1 && selectedIndex === index ? true : null}
                                                className={`auto-menu-item ${hoverIndex === index ? 'selected' : ''}`}
                                                onClick={() => handleOnClickMenuItem(index)}
                                            > {option.label}
                                            </sp-menu-item>)
                                        else if (typeof option === "string" &&
                                            option.toLowerCase().includes(query.toLowerCase()))
                                            return (<sp-menu-item
                                                selected={selectedIndex !== -1 && selectedIndex === index ? true : null}
                                                className={`auto-menu-item ${hoverIndex === index ? 'selected' : ''}`}
                                                onClick={() => handleOnClickMenuItem(index)}
                                            > {option}

                                            </sp-menu-item>)
                                        else
                                            return null;
                                    })
                                }
                            </div>
                        </div>
                    </sp-popover>
                    <div slot="trigger"></div>
                </sp-overlay>

                <div style={{
                    display: "flex",
                    height: "56px"
                }}>
                    <div style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%"
                    }}>
                        <sp-label slot="label"
                                  className="theme-text">{props.labelIcon}{props.label}</sp-label>
                        <div className="theme-border theme-background-textfield"
                             style={{height: "32px"}}
                             onClick={handleOnclickOpenCloseBtn}>
                            <sp-body style={{
                                paddingLeft: "10px",
                                paddingTop: "2px",
                                fontSize: "14px",
                                overflow: "hidden",
                                whiteSpace: "nowrap",
                                textOverflow: "ellipsis"
                            }}
                                     size="M" className="theme-text">
                                {typeof value === "object"
                                && value.hasOwnProperty("label") ?
                                    (value as ComboBoxItem).label : value}
                            </sp-body>
                        </div>
                    </div>
                    <sp-action-button
                        style={{
                            marginTop: "24px"
                        }}
                        onClick={handleOnclickOpenCloseBtn}>
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
            </div>
        </div>
    )
}

export type ComboBoxItem = { value: any, label: string }
export type ComboBoxDividerItem = { label: string }
export default forwardRef(ComboBox);
