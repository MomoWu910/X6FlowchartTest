// #region cssConfig
export const cssConfig =
    `
#container {
    display: flex;
    border: 1px solid #dfe3e8;
}
#stencil {
    width: 180px;
    height: 100%;
    position: relative;
    border-right: 1px solid #dfe3e8;
}
#graph-container {
    width: calc(100% - 180px);
    height: 100%;
}
#code-graph-container {
    width: 100%;
    height: 100%;
}
.x6-widget-stencil  {
    background-color: #666;
}
.x6-widget-stencil-title {
    color: #fff;
    background-color: #555;
}
.x6-widget-stencil-title:hover {
    color: #eee;
}
.x6-widget-stencil-group-title {
    color: #fff !important;
    background-color: #555 !important;
}
.x6-widget-stencil-group-title:hover {
    color: #eee !important;
}
.x6-widget-transform {
    margin: -1px 0 0 -1px;
    padding: 0px;
    border: 1px solid #239edd;
}
.x6-widget-transform > div {
    border: 1px solid #239edd;
}
.x6-widget-transform > div:hover {
    background-color: #3dafe4;
}
.x6-widget-transform-active-handle {
    background-color: #3dafe4;
}
.x6-widget-transform-resize {
    border-radius: 0;
}
.x6-widget-selection-inner {
    border: 1px solid #239edd;
}
.x6-widget-selection-box {
    opacity: 0;
}
`;
// #endregion

export const colorConfig = {
    START_END_GREEN: '#008a00',
    PROCESS_BLUE: '#1BA1E2',
}

export const zIndex = {
    BACKGROUND_NODE: 1,
    NODE: 2,
    EDGE: 2,
}

export const registerName = {
    // node
    startOrEnd: 'startOrEnd',
    process: 'process-rect',

    // edge
    normalEdge: 'normal-edge',
}