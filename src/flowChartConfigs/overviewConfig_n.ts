
export const overviewConfig_n = {
    name: "overviewConfig",
    level: 1,
    version: "0.0.2",
    nodes: [{
        data: {
            seat: "1_1",
            name: "startLobby",
            changeToFlowChart: "",
            size: null
        },
        shape: "startOrEnd-rect",
        attr: {
            label: "从商户平台\n点击大厅"
        }
    }, {
        data: {
            seat: "1_2",
            name: "downloadLobbyLoading",
            changeToFlowChart: "",
            size: null
        },
        shape: "process-rect",
        attr: {
            label: "下载大厅loading页"
        }
    }, {
        data: {
            seat: "1_3",
            name: "downloadLoadingPage",
            changeToFlowChart: "",
            size: null
        },
        shape: "process-rect",
        attr: {
            label: "载入loading页"
        }
    }, {
        data: {
            seat: "1_4",
            name: "waitingLoading",
            changeToFlowChart: "",
            size: { "w": 180, "h": 90 }
        },
        shape: "process-rect",
        attr: {
            label: "载入完成后\n\n背后初始化游戏\n显示文案:\n'正在登陆游戏，请稍候'"
        }
    }, {
        data: {
            seat: "1_5",
            name: "initEndEnterLobby",
            changeToFlowChart: "",
            size: null
        },
        shape: "startOrEnd-rect",
        attr: {
            label: "初始化游戏完成后\n关loading页\n进大厅"
        }
    }, {
        data: {
            seat: "2_1",
            name: "hotChangeGame",
            changeToFlowChart: "",
            size: null
        },
        shape: "startOrEnd-rect",
        attr: {
            label: "火热点击游戏跳转"
        }
    }, {
        data: {
            seat: "2_2",
            name: "connecting",
            changeToFlowChart: "",
            size: null
        },
        shape: "process-rect",
        attr: {
            label: "连接中"
        }
    }, {
        data: {
            seat: "3_1",
            name: "enterGameFrom156",
            changeToFlowChart: "",
            size: null
        },
        shape: "startOrEnd-rect",
        attr: {
            label: "从商户平台\n点击游戏"
        }
    }, {
        data: {
            seat: "4_1",
            name: "enterGameFromLobby",
            changeToFlowChart: "",
            size: null
        },
        shape: "startOrEnd-rect",
        attr: {
            label: "从大厅中点击游戏"
        }
    }, {
        data: {
            seat: "4_2",
            name: "connecting",
            changeToFlowChart: "",
            size: null
        },
        shape: "process-rect",
        attr: {
            label: "连接中"
        }
    }, {
        data: {
            seat: "4_3",
            name: "ifAPIRemaining",
            changeToFlowChart: "",
            size: null
        },
        shape: "yesOrNo_API-polygon",
        attr: {
            label: "API\n是否维护中"
        }
    }, {
        data: {
            seat: "4_4",
            name: "ifInOtherGame",
            changeToFlowChart: "",
            size: null
        },
        shape: "yesOrNo_API-polygon",
        attr: {
            label: "API\n是否在其他游戏"
        }
    }, {
        data: {
            seat: "4_5",
            name: "downloadLobbyLoading",
            changeToFlowChart: "",
            size: null
        },
        shape: "process-rect",
        attr: {
            label: "下载大厅loading页"
        }
    }, {
        data: {
            seat: "4_6",
            name: "ifRoomGame",
            changeToFlowChart: "",
            size: null
        },
        shape: "yesOrNo-polygon",
        attr: {
            label: "是否有选房页"
        }
    }, {
        data: {
            seat: "4_7",
            name: "changeToRoomGameFlowChart",
            changeToFlowChart: "roomGameBeforeConfig",
            size: null
        },
        shape: "changeToOtherFlowChart-rect",
        attr: {
            label: "选房游戏流程"
        }
    }, {
        data: {
            seat: "5_1",
            name: "directConnectByURL",
            changeToFlowChart: "",
            size: null
        },
        shape: "startOrEnd-rect",
        attr: {
            label: "透过网址直连"
        }
    }, {
        data: {
            seat: "5_2",
            name: "changeToNoRoomGameFlowChart",
            changeToFlowChart: "",
            size: null
        },
        shape: "changeToOtherFlowChart-rect",
        attr: {
            label: "非选房游戏流程"
        }
    }, {
        data: {
            seat: "5_3",
            name: "popupRemaining",
            changeToFlowChart: "",
            size: { "w": 150, "h": 90 }
        },
        shape: "popupRemaining-image",
        attr: {
            label: ""
        }
    }, {
        data: {
            seat: "5_4",
            name: "popupReturnGame",
            changeToFlowChart: "",
            size: { "w": 150, "h": 90 }
        },
        shape: "popupReturnGame-image",
        attr: {
            label: ""
        }
    }, {
        data: {
            seat: "5_7",
            name: "changeToNoRoomGameFlowChart",
            changeToFlowChart: "",
            size: null
        },
        shape: "changeToOtherFlowChart-rect",
        attr: {
            label: "非选房游戏流程"
        }
    }, {
        data: {
            seat: "6_3",
            name: "stopInLobby",
            changeToFlowChart: "",
            size: null
        },
        shape: "stopFlowChart-rect",
        attr: {
            label: "停在大厅"
        }
    }],
    vFlows: [["1_1", "1_2", "1_3", "1_4", "1_5"], ["2_1", "2_2"], ["4_1", "4_2", "4_3_N", "4_4_N", "4_5", "4_6_Y", "4_7"], ["5_1", "5_2"]],
    hFlows: [["4_3_Y", "5_3", "6_3"], ["4_4_Y", "5_4"]],
    lFlows: [["2_2", "4_5", "bottom", "left_bottom"], ["3_1", "4_5", "bottom", "left_top"], ["4_6_N", "5_7", "right", "top"]],
}