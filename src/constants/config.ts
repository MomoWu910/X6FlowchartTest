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
    TIP: 3,
}

/**
 * @param tipDialog 提示框(白匡、黑底、圓角方形)
 * @param startOrEnd 最開頭跟最結尾的(綠底、圓角方形)
 * @param changeToOtherFlowChart 切換到別張流程圖(深藍底、圓角方形)
 * @param stopFlowChart 結尾以外的結尾(灰底、圓角方形)
 * @param process 過程(淺藍底、方角方形)
 * @param yesOrNo 叉路點(橘底、菱形)
 * @param yesOrNo_API API相關的叉路點(紅底、菱形)
 * @param yesOrNo_success 最順利的那一條流程上面的叉路點(綠底、菱形)
 * @param popupRemaining 維護中彈窗(圖片)
 * @param popupReturnGame 回到當前遊戲彈窗(圖片)
 * @param popupConnectFailed 網絡連接失敗彈窗(圖片)
 * 
 * @param normalEdge 一般直線，不轉彎
 * @param lEdge 轉一次彎直線
 */
export const registerName = {
    tipDialog: 'tipDialog-rect',
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


/**
 * 節點周圍的連接粧(? 的設定檔，預設節點的四周各有三個port，共12個
 * items裡的物件的group對應到groups裡的項目，如果items中有多項，那就是平分在那個邊
 * {
 *      groups
 *      {
 *          top: {
 *              position: 'top',
 *          },
 *          ...
 *      },
 *      items
 *      [
 *          {
 *              id: 'top_left', // 自己的名字
 *              group: 'top', // 對應groups的名字
 *              label: { // port上的文字設定
 *                   position: {
 *                       name: 'outside', 位于节点外围
 *                       args: {
 *                           offset: 5 从节点中心到标签位置的方向上的偏移量。
 *                       }
 *                   },
 *               },
 *               attrs: {
 *                   text: {
 *                       text: '', port上的文字
 *                       fill: '#FFF', port上的文字顏色
 *                   },
 *               }
 *          },
 *          ...
 *      ]
 * }
 */
export const PORTS = {
    groups: {
        top: {
            position: 'top',
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
        right: {
            position: 'right',
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
        bottom: {
            position: 'bottom',
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
        left: {
            position: 'left',
            attrs: {
                circle: {
                    r: 4,
                    magnet: true,
                    stroke: '#5F95FF',
                    strokeWidth: 1,
                    fill: '#fff',
                    style: {
                        visibility: 'hidden',
                    },
                },
            },
        },
    },
    items: [
        {
            id: 'top_left',
            group: 'top',
            label: {
                position: {
                    name: 'outside',
                    args: {
                        offset: 5
                    }
                },
            },
            attrs: {
                text: {
                    text: '',
                    fill: '#FFF',
                },
            }
        },
        {
            id: 'top',
            group: 'top',
            label: {
                position: {
                    name: 'outside',
                    args: {
                        offset: 5
                    }
                },
            },
            attrs: {
                text: {
                    text: '',
                    fill: '#FFF',
                },
            }
        },
        {
            id: 'top_right',
            group: 'top',
            label: {
                position: {
                    name: 'outside',
                    args: {
                        offset: 5
                    }
                },
            },
            attrs: {
                text: {
                    text: '',
                    fill: '#FFF',
                },
            }
        },
        {
            id: 'right_top',
            group: 'right',
            label: {
                position: {
                    name: 'outside',
                    args: {
                        offset: 5
                    }
                },
            },
            attrs: {
                text: {
                    text: '',
                    fill: '#FFF',
                },
            }
        },
        {
            id: 'right',
            group: 'right',
            label: {
                position: {
                    name: 'outside',
                    args: {
                        offset: 5
                    }
                },
            },
            attrs: {
                text: {
                    text: '',
                    fill: '#FFF',
                },
            }
        },
        {
            id: 'right_bottom',
            group: 'right',
            label: {
                position: {
                    name: 'outside',
                    args: {
                        offset: 5
                    }
                },
            },
            attrs: {
                text: {
                    text: '',
                    fill: '#FFF',
                },
            }
        },
        {
            id: 'bottom_left',
            group: 'bottom',
            label: {
                position: {
                    name: 'outside',
                    args: {
                        offset: 5
                    }
                },
            },
            attrs: {
                text: {
                    text: '',
                    fill: '#FFF',
                },
            }
        },
        {
            id: 'bottom',
            group: 'bottom',
            label: {
                position: {
                    name: 'outside',
                    args: {
                        offset: 5
                    }
                },
            },
            attrs: {
                text: {
                    text: '',
                    fill: '#FFF',
                },
            }
        },
        {
            id: 'bottom_right',
            group: 'bottom',
            label: {
                position: {
                    name: 'outside',
                    args: {
                        offset: 5
                    }
                },
            },
            attrs: {
                text: {
                    text: '',
                    fill: '#FFF',
                },
            }
        },
        {
            id: 'left_top',
            group: 'left',
            label: {
                position: {
                    name: 'outside',
                    args: {
                        offset: 5
                    }
                },
            },
            attrs: {
                text: {
                    text: '',
                    fill: '#FFF',
                },
            }
        },
        {
            id: 'left',
            group: 'left',
            label: {
                position: {
                    name: 'outside',
                    args: {
                        offset: 5
                    }
                },
            },
            attrs: {
                text: {
                    text: '',
                    fill: '#FFF',
                },
            }
        },
        {
            id: 'left_bottom',
            group: 'left',
            label: {
                position: {
                    name: 'outside',
                    args: {
                        offset: 5
                    }
                },
            },
            attrs: {
                text: {
                    text: '',
                    fill: '#FFF',
                },
            }
        },
    ],
};