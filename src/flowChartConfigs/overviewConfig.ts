import { registerName } from '../constants';

const DEFAULT_POPUP_WIDTH = 150;
const DEFAULT_POPUP_HEIGHT = 90;
/**
 * 基本格式
 * @param name (string) config名稱，與export的命名一致，並且用於initconfig
 * @param level (number) 用於流程圖跳轉後返回，值越大越下層，ex. level2返回回level1
 * @param version (string) 版號，儲存時會自動增加一版
 * nodes: [
 * ...
 * {
 *      @param data 可自定義之與X6無關資料
 *      {
 *          @param seat (string) ex. 1_2 會轉換為 (START_POS_X, START_POS_Y + EDGE_LENGTH_V)
 *          @param name (string) 節點名稱
 *          @param changeToFlowChart (string) 此節點會轉換去哪個流程圖，需注意節點shape類型要為 registerName.changeToOtherFlowChart
 *          @param size (object) 如果要調整該節點大小，傳入 { w: xx, h: xx } 的格式 
 *          @param tipContent (string) 滑鼠hover時的tip要顯示的文字
 *      }
 *      @param shape (string) 節點形式，引用 registerName 裡的設定，同時也需要對應到 initGraphNode 中註冊的自定義形式
 *      @param attr (obj) 可自定義之參數，包含但不限於以下
 *      {
 *          @param label (string) 節點上要顯示的文字
 *      }
 * },
 * ...
 * ],
 * vFlows: [ 畫垂直邊，陣列放入上到下，如果需要加入“是”、“否”的文字就在source節點加上 _Y or _N
 *      ["1_1", "1_2_Y", "1_3_N", "1_4", "1_5"],
 * ],
 * hFlows: [ 畫水平邊，陣列放入左到右，如果需要加入“是”、“否”的文字就在source節點加上 _Y or _N
 *      ["4_3_Y", "5_3", "6_3"],
 * ],
 * lFlows: [ 畫L型邊，陣列放入[起點, 迄點, 起點port, 迄點port], 如果需要加入“是”、“否”的文字就在source節點加上 _Y or _N
 *      ["4_6_N", "5_7", "right", "top"],
 * ]
 */
export const overviewConfig = {
    name: 'overviewConfig',
    level: 1,
    version: "0.0.1",
    nodes: [
        // #region 1
        {
            data: {
                seat: "1_1",
                name: "startLobby"
            },
            shape: registerName.startOrEnd,
            attr: {
                label: "从商户平台\n点击大厅",
            }
        },
        {
            data: {
                seat: "1_2",
                name: "downloadLobbyLoading"
            },
            shape: registerName.process,
            attr: {
                label: "下载大厅loading页",
            }
        },
        {
            data: {
                seat: "1_3",
                name: "downloadLoadingPage"
            },
            shape: registerName.process,
            attr: {
                label: "载入loading页",
            }
        },
        {
            data: {
                seat: "1_4",
                name: "waitingLoading",
                size: { w: 180, h: 90 },
            },
            shape: registerName.process,
            attr: {
                label: "载入完成后\n\n背后初始化游戏\n显示文案:\n'正在登陆游戏，请稍候'",
            }
        },
        {
            data: {
                seat: "1_5",
                name: "initEndEnterLobby"
            },
            shape: registerName.startOrEnd,
            attr: {
                label: "初始化游戏完成后\n关loading页\n进大厅",
            }
        },
        // #endregion
        // #region 2
        {
            data: {
                seat: "2_1",
                name: "hotChangeGame"
            },
            shape: registerName.startOrEnd,
            attr: {
                label: "火热点击游戏跳转",
            }
        },
        {
            data: {
                seat: "2_2",
                name: "connecting"
            },
            shape: registerName.process,
            attr: {
                label: "连接中",
            }
        },
        // #endregion
        // #region 3
        {
            data: {
                seat: "3_1",
                name: "enterGameFrom156"
            },
            shape: registerName.startOrEnd,
            attr: {
                label: "从商户平台\n点击游戏",
            }
        },
        // #endregion
        // #region 4
        {
            data: {
                seat: "4_1",
                name: "enterGameFromLobby"
            },
            shape: registerName.startOrEnd,
            attr: {
                label: "从大厅中点击游戏",
            }
        },
        {
            data: {
                seat: "4_2",
                name: "connecting"
            },
            shape: registerName.process,
            attr: {
                label: "连接中",
            }
        },
        {
            data: {
                seat: "4_3",
                name: "ifAPIRemaining"
            },
            shape: registerName.yesOrNo_API,
            attr: {
                label: "API\n是否维护中",
            }
        },
        {
            data: {
                seat: "4_4",
                name: "ifInOtherGame"
            },
            shape: registerName.yesOrNo_API,
            attr: {
                label: "API\n是否在其他游戏",
            }
        },
        {
            data: {
                seat: "4_5",
                name: "downloadLobbyLoading"
            },
            shape: registerName.process,
            attr: {
                label: "下载大厅loading页",
            }
        },
        {
            data: {
                seat: "4_6",
                name: "ifRoomGame"
            },
            shape: registerName.yesOrNo,
            attr: {
                label: "是否有选房页",
            }
        },
        {
            data: {
                seat: "4_7",
                name: "changeToRoomGameFlowChart",
                changeToFlowChart: "roomGameBeforeConfig",
                tipContent: "点击即可切换至 选房游戏流程 "
            },
            shape: registerName.changeToOtherFlowChart,
            attr: {
                label: "选房游戏流程"
            }
        },
        // #endregion
        // #region 5
        {
            data: {
                seat: "5_1",
                name: "directConnectByURL"
            },
            shape: registerName.startOrEnd,
            attr: {
                label: "透过网址直连",
            }
        },
        {
            data: {
                seat: "5_2",
                name: "changeToNoRoomGameFlowChart"
            },
            shape: registerName.changeToOtherFlowChart,
            attr: {
                label: "非选房游戏流程",
            }
        },
        {
            data: {
                seat: "5_3",
                name: "popupRemaining",
                size: { w: DEFAULT_POPUP_WIDTH, h: DEFAULT_POPUP_HEIGHT },
            },
            shape: registerName.popupRemaining,
            attr: {
            }
        },
        {
            data: {
                seat: "5_4",
                name: "popupReturnGame",
                size: { w: DEFAULT_POPUP_WIDTH, h: DEFAULT_POPUP_HEIGHT },
            },
            shape: registerName.popupReturnGame,
            attr: {
            }
        },
        {
            data: {
                seat: "5_7",
                name: "changeToNoRoomGameFlowChart"
            },
            shape: registerName.changeToOtherFlowChart,
            attr: {
                label: "非选房游戏流程",
            }
        },
        // #endregion
        // #region 6
        {
            data: {
                seat: "6_3",
                name: "stopInLobby"
            },
            shape: registerName.stopFlowChart,
            attr: {
                label: "停在大厅",
            }
        },
        // #endregion
    ],
    vFlows: [
        ["1_1", "1_2", "1_3", "1_4", "1_5"],
        ["2_1", "2_2"],
        ["4_1", "4_2", "4_3_N", "4_4_N", "4_5", "4_6_Y", "4_7"],
        ["5_1", "5_2"],
    ],
    hFlows: [
        ["4_3_Y", "5_3", "6_3"],
        ["4_4_Y", "5_4"],
    ],
    lFlows: [
        ["2_2", "4_5", "bottom", "left_bottom"],
        ["3_1", "4_5", "bottom", "left_top"],
        ["4_6_N", "5_7", "right", "top"],
    ]
}