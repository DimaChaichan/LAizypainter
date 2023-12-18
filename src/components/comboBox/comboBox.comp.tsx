import {MutableRef} from "preact/hooks";
import {useRef, useState} from "react";

export function ComboBox(props: {
    options: Array<string>,
    minMenuWidth?: number,
    value?: string,
    label?: string
    onChange?: (option: string) => void,
}) {
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
    const checkValue = (value: string | undefined) => {
        if (!value)
            return value;
        return props.options.find(option => option === value)
    }

    const [value, setValue] = useState<string | undefined>(checkValue(props.value));
    const [query, setQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [menuWidth, setMenuWidth] = useState(getMenuWidth());

    const handleOnclickOpenCloseBtn = () => {
        if (searchFieldRef.current) {
            setQuery("");
        }
        setMenuWidth(getMenuWidth());
        popoverRef.current?.setAttribute("open", "true");
    };
    const handleOnClickMenuItem = (index: number) => {
        popoverRef.current?.removeAttribute("open");
        setSelectedIndex(index)
        setValue(props.options[index])
        props.onChange?.(props.options[index]);
    };
    const handleOnInputSearch = (event: any) => {
        setQuery(event.target.value);
    };

    return (
        <>
            <div>
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
                                            if (option.includes(query))
                                                return (<sp-menu-item
                                                    selected={selectedIndex !== -1 && selectedIndex === index ? true : null}
                                                    className="auto-menu-item"
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
                                      className="theme-text">{props.label}</sp-label>
                            <div className="theme-border theme-background-textfield"
                                 style={{height: "32px"}}
                                 onClick={handleOnclickOpenCloseBtn}>
                                <sp-body style={{paddingLeft: "10px", paddingTop: "2px", fontSize: "14px"}}
                                         size="M" className="theme-text">{value}</sp-body>
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
        </>
    )
}
