import './collapseContainer.style.scss';
import {createElement, CSSProperties, useState} from "react";
import JSX = createElement.JSX;

/**
 * Collapse Container
 * @param props
 * @constructor
 */
function CollapseContainer(props: {
    style?: CSSProperties;
    className?: string;
    selectedBackground?: boolean,
    label: string,
    expand: boolean,
    selected: boolean,
    children: JSX.Element,
    disableHeaderClick?: boolean,
    actions?: JSX.Element,
    onClick?: (event: any) => void
    onMouseDown?: (event: any) => void
    onHeaderMouseDown?: (event: any) => void
    onContextMenu?: (event: any) => void
    onExpand?: (event: any) => void
}) {
    const [expand, setExpand] = useState(props.expand);
    const onClick = function (event: any) {
        if (!props.disableHeaderClick) {
            setExpand(!expand);
            if (props.onExpand) props.onExpand(!expand);
        }
        if (props.onClick) props.onClick(event);
    }
    const expandClick = function () {
        setExpand(!expand);
        if (props.onExpand) props.onExpand(!expand);
    }
    return (
        <div
            className={`collapse-container ${props.className} ` + (props.selectedBackground ? "collapse-container-selected-bg" : "")}
            onContextMenu={props.onContextMenu}
            onMouseDown={props.onMouseDown}
            style={props.style}>
            <div
                className={"row collapse-container-header " + (props.selected ? "collapse-container-header-selected" : "")}
                onClick={onClick}
                onMouseDown={props.onHeaderMouseDown}>
                {expand ?
                    <sp-action-button quiet
                                      onMouseDown={(event: any) => {
                                          event.stopPropagation();
                                      }}
                                      onClick={props.disableHeaderClick ? expandClick : null}>
                        <div slot="icon" className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18" width="18"
                                 style={{fill: "currentColor"}}>
                                <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18"/>
                                <path className="fill"
                                      d="M14,10.99a1,1,0,0,1-1.7055.7055l-3.289-3.286-3.289,3.286a1,1,0,0,1-1.437-1.3865l.0245-.0245L8.3,6.2925a1,1,0,0,1,1.4125,0L13.707,10.284A.9945.9945,0,0,1,14,10.99Z"/>
                            </svg>
                        </div>
                    </sp-action-button> :
                    <sp-action-button quiet
                                      onMouseDown={(event: any) => {
                                          event.stopPropagation();
                                      }}
                                      onClick={props.disableHeaderClick ? expandClick : null}>
                        <div slot="icon" className="icon">
                            <svg xmlns="http://www.w3.org/2000/svg" height="18" viewBox="0 0 18 18"
                                 width="18" style={{fill: "currentColor"}}>
                                <rect id="Canvas" fill="#ff13dc" opacity="0" width="18" height="18"/>
                                <path className="fill"
                                      d="M4,7.01a1,1,0,0,1,1.7055-.7055l3.289,3.286,3.289-3.286a1,1,0,0,1,1.437,1.3865l-.0245.0245L9.7,11.7075a1,1,0,0,1-1.4125,0L4.293,7.716A.9945.9945,0,0,1,4,7.01Z"/>
                            </svg>
                        </div>
                    </sp-action-button>}
                <sp-label className="collapse-container-header-label">{props.label}</sp-label>
                {props.actions}
            </div>
            <div className={"collapse-container-children " + (!expand ? "collapse-container-children-close" : "")}>
                {props.children}
            </div>
        </div>
    )
}

export default CollapseContainer;