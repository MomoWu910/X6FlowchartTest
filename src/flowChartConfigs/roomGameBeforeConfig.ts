import { registerName } from '../constants/config';

const DEFAULT_RECT_WIDTH = 120;
const DEFAULT_RECT_HEIGHT = 60;
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
export const roomGameBeforeConfig = {
    name: 'roomGameBeforeConfig',
    level: 2,
    version: "0.0.1",
    nodes: [
        // #region 1
        {
            data: {
                seat: "1_1",
                name: "downloadLoadingPage",
            },
            shape: registerName.process,
            attr: {
                label: "载入loading页",
            }
        },
        {
            data: {
                seat: "1_2",
                name: "ifAPISend",
            },
            shape: registerName.yesOrNo_success,
            attr: {
                label: "是否发送成功\n(本机网路正常)",
            }
        },
        {
            data: {
                seat: "1_4",
                name: "ifAPIReqIn30Sec",
            },
            shape: registerName.yesOrNo_success,
            attr: {
                label: "30秒内是否\n收到API回应",
            }
        },
        {
            data: {
                seat: "1_6",
                name: "ifTokenInvalid",
            },
            shape: registerName.yesOrNo_success,
            attr: {
                label: "是否token失效\n(-201)",
            }
        },
        {
            data: {
                seat: "1_7",
                name: "closeLoadingEnterRoomList",
            },
            shape: registerName.process,
            attr: {
                label: "收掉loading页\n进入选房页",
            }
        },
        {
            data: {
                seat: "1_8",
                name: "changeToChooseRoomFlowChart",
            },
            shape: registerName.changeToOtherFlowChart,
            attr: {
                label: "点击游戏房间",
            }
        },
        // #endregion
        // #region 2
        {
            data: {
                seat: "2_2",
                name: "connectFailed",
                size: { w: DEFAULT_RECT_WIDTH + 30, h: DEFAULT_RECT_HEIGHT }
            },
            shape: registerName.process,
            attr: {
                label: "loading下方文案\n网络连接失败，请稍后再试"
            }
        },
        {
            data: {
                seat: "2_4",
                name: "connectFailed",
                size: { w: DEFAULT_RECT_WIDTH + 30, h: DEFAULT_RECT_HEIGHT }
            },
            shape: registerName.process,
            attr: {
                label: "loading下方文案\n网络连接失败，请稍后再试"
            }
        },
        {
            data: {
                seat: "2_6",
                name: "connectFailed",
                size: { w: DEFAULT_RECT_WIDTH + 30, h: DEFAULT_RECT_HEIGHT }
            },
            shape: registerName.process,
            attr: {
                label: "loading下方文案\n网络连接失败，请稍后再试"
            }
        },
        // #endregion
        // #region 3
        {
            data: {
                seat: "3_2",
                name: "ifPopupResourceLoaded",
            },
            shape: registerName.yesOrNo,
            attr: {
                label: "弹窗资源是否load完",
            }
        },
        {
            data: {
                seat: "3_3",
                name: "stopInLoadingPage",
            },
            shape: registerName.stopFlowChart,
            attr: {
                label: "不做其他处理，停在\nloading页",
            }
        },
        {
            data: {
                seat: "3_4",
                name: "ifPopupResourceLoaded",
            },
            shape: registerName.yesOrNo,
            attr: {
                label: "弹窗资源是否load完",
            }
        },
        {
            data: {
                seat: "3_5",
                name: "stopInLoadingPage",
            },
            shape: registerName.stopFlowChart,
            attr: {
                label: "不做其他处理，停在\nloading页",
            }
        },
        {
            data: {
                seat: "3_6",
                name: "ifPopupResourceLoaded",
            },
            shape: registerName.yesOrNo,
            attr: {
                label: "弹窗资源是否load完",
            }
        },
        {
            data: {
                seat: "3_7",
                name: "stopInLoadingPage",
            },
            shape: registerName.stopFlowChart,
            attr: {
                label: "不做其他处理，停在\nloading页",
            }
        },
        // #endregion
        // #region 4
        {
            data: {
                seat: "4_2",
                name: "popupConnectFailed",
                size: { w: DEFAULT_POPUP_WIDTH, h: DEFAULT_POPUP_HEIGHT }
            },
            shape: registerName.popupConnectFailed,
            attr: {
            }
        },
        {
            data: {
                seat: "4_4",
                name: "popupConnectFailed",
                size: { w: DEFAULT_POPUP_WIDTH, h: DEFAULT_POPUP_HEIGHT }
            },
            shape: registerName.popupConnectFailed,
            attr: {
            }
        },
        {
            data: {
                seat: "4_6",
                name: "popupConnectFailed",
                size: { w: DEFAULT_POPUP_WIDTH, h: DEFAULT_POPUP_HEIGHT }
            },
            shape: registerName.popupConnectFailed,
            attr: {
            }
        },
        // #endregion
        // #region 5
        {
            data: {
                seat: "5_3",
                name: "notOneGameBackLobby",
                size: { w: DEFAULT_RECT_WIDTH + 30, h: DEFAULT_RECT_HEIGHT }
            },
            shape: registerName.stopFlowChart,
            attr: {
                label: "非单一游戏: 返回大厅\n单一游戏: 黑遮罩+弹窗文案"
            }
        },
        {
            data: {
                seat: "5_6",
                name: "maskAndToast",
                size: { w: DEFAULT_RECT_WIDTH + 50, h: DEFAULT_RECT_HEIGHT }
            },
            shape: registerName.stopFlowChart,
            attr: {
                label: "黑遮罩+toast\n“当前连接已过期，请重新登录”"
            }
        },
        // #endregion
    ],
    vFlows: [
        ["1_1", "1_2_Y", "1_4_Y", "1_6_N", "1_7", "1_8"],
        ["3_2_N", "3_3"], ["3_4_N", "3_5"], ["3_6_N", "3_7"],
    ],
    hFlows: [
        ["1_2_N", "2_2", "3_2_Y", "4_2"],
        ["1_4_N", "2_4", "3_4_Y", "4_4"],
        ["1_6_N", "2_6", "3_6_Y", "4_6", "5_6"],
    ],
    lFlows: [
        ["4_2", "5_3", "right", "left_top"],
        ["4_4", "5_3", "right", "left_bottom"],
    ]
}