// #region cssConfig
export const cssConfig =
    `
#code-graph-container {
    width: 100%;
    height: 100%;
}
.x6-tooltip {
    border: 1px solid #e2e2e2;
    border-radius: 4px;
    font-size: 12px;
    color: #545454;
    background-color: rgba(255, 255, 255, 0.9);
    padding: 10px 8px;
    box-shadow: rgb(174, 174, 174) 0px 0px 10px;
}
`;
// #endregion

export const colorConfig = {
    START_END_GREEN: '#008a00',
    START_END_BLUE: '#0050EF',
    STOP_GRAY: '#647687',
    PROCESS_BLUE: '#1BA1E2',
    YN_RED: '#FFCCCC',
    YN_ORANGE: '#FAD7AC',
    YN_GREEN: '#D5E8D4',
}

export const zIndex = {
    BACKGROUND_NODE: 1,
    NODE: 2,
    EDGE: 2,
}

export const registerName = {
    // node
    startOrEnd: 'startOrEnd-rect',
    changeToOtherFlowChart: 'changeToOtherFlowChart-rect',
    stopFlowChart: 'stopFlowChart-rect',
    process: 'process-rect',
    yesOrNo: 'yesOrNo-polygon',
    yesOrNo_API: 'yesOrNo_API-polygon',
    yesOrNo_success: 'yesOrNo_success-polygon',
    popupRemaining: 'popupRemaining-image',
    popupReturnGame: 'popupReturnGame-image',
    popupConnectFailed: 'popupConnectFailed-image',

    defaultRect: 'rect',
    defaultCircle: 'circle',

    // edge
    normalEdge: 'normal-edge',
    lEdge: 'lEdge',
}