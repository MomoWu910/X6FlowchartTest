import { Graph, Shape, Addon, Vector, EdgeView, Cell } from '@antv/x6';
import { insertCss } from 'insert-css';
import { cssConfig, colorConfig, zIndex, registerName } from './constants/config';

/* html css 相關樣式建立
*   graphContainer: 畫板
*/
const GRAPH_NAME = 'code-graph-container';
const preWork = () => {
    // 这里协助演示的代码，在实际项目中根据实际情况进行调整
    const container = document.getElementById('container')!;
    const graphContainer = document.createElement('div');
    graphContainer.id = GRAPH_NAME;
    container.appendChild(graphContainer);

    insertCss(cssConfig);
}

const START_POS_X = 100;
const START_POS_Y = 100;
const EDGE_LENGTH_V = 140;
const EDGE_LENGTH_H = 140;

export default class Demo {
    public graph: any;

    constructor() {
        preWork();                          // 設定css樣式
        this.initGraph();                   // 初始化畫布
        // this.initEvent();                   // 初始化鍵盤、滑鼠事件
        this.initGraphNode();               // 初始化各種節點設定

        this.draw();
    }

    // 畫圖
    public draw() {
        const startLobby = this.drawNode(START_POS_X, START_POS_Y, registerName.startOrEnd, { label: `从商户平台\n点击大厅` });
        const downloadLobbyLoading = this.drawNode(START_POS_X, START_POS_Y + EDGE_LENGTH_V, registerName.process, { label: `下载大厅loading页` });
        const downloadLoadingPage = this.drawNode(START_POS_X, START_POS_Y + EDGE_LENGTH_V * 2, registerName.process, { label: `载入loading页` });
        const waitingLoading = this.drawNode(START_POS_X - 30, START_POS_Y + EDGE_LENGTH_V * 3, registerName.process, {
            size: { w: 180, h: 90 },
            label: `载入完成后\n\n背后初始化游戏\n显示文案:\n"正在登陆游戏，请稍候"`
        });
        const initEndEnterLobby = this.drawNode(START_POS_X, START_POS_Y + EDGE_LENGTH_V * 4 + 15, registerName.startOrEnd, { label: `初始化游戏完成后\n关loading页\n进大厅` });


        this.drawEdge(startLobby, downloadLobbyLoading, 'v');
        this.drawEdge(downloadLobbyLoading, downloadLoadingPage, 'v');
        this.drawEdge(downloadLoadingPage, waitingLoading, 'v');
        this.drawEdge(waitingLoading, initEndEnterLobby, 'v');

        this.graph.centerContent();

        this.graph.on('signal', (cell: Cell) => {
            if (cell.isEdge()) {
                const view = this.graph.findViewByCell(cell) as EdgeView
                if (view) {
                    const token = Vector.create('circle', { r: 6, fill: '#feb662' })
                    const target = cell.getTargetCell()
                    setTimeout(() => {
                        view.sendToken(token.node, 1000, () => {
                            if (target) {
                                this.graph.trigger('signal', target)
                            }
                        })
                    }, 300)
                }
            } else {
                this.flash(cell)
                const edges = this.graph.model.getConnectedEdges(cell, {
                    outgoing: true,
                })
                edges.forEach((edge) => this.graph.trigger('signal', edge))
            }
        })

        let manual = false;

        const trigger = () => {
            this.graph.trigger('signal', startLobby)
            if (!manual) {
                setTimeout(trigger, 6000)
            }
        }

        trigger();

    }


    public flash(cell: Cell) {
        const cellView = this.graph.findViewByCell(cell)
        if (cellView) {
            cellView.highlight()
            setTimeout(() => cellView.unhighlight(), 300)
        }
    }

    // #region 畫圖相關
    // 畫節點
    /**
     * 
     * @param posX 座標x
     * @param posY 座標y
     * @param shape 形狀, 預設圓角矩形
     * @param option {
     *      可自定義項目
     *      label: 文字, 需注意換行要加 \n
     *      fontSize: 文字大小
     *      ...其他功能後續補充
     * }
     */
    public drawNode(posX: number = 0, posY: number = 0, shape: string = registerName.process, option: any = {}) {
        const node = this.graph.addNode({
            x: posX,
            y: posY,
            shape: shape,
            attrs: {
                label: {
                    text: '',
                    fontSize: 10,
                }
            }
        });

        if (option && option.label) node.attr('label/text', option.label);
        if (option && option.fontSize) node.attr('label/fontSize', option.fontSize);
        if (option && option.size) node.resize(option.size.w, option.size.h);

        return node;
    }

    // 畫邊
    /**
     * 
     * @param source 從哪個座標{x, y}或節點{cell}或指定節點的連接點{cell, port}
     * @param target 到哪個座標{x, y}或節點{cell}或指定節點的連接點{cell, port}
     * @param direction 方向，流程圖大部分不是上到下(v)就是左到右(h)，預設上到下
     * @param shape 哪種類型的邊，預設白色直線單箭頭
     * @param option 其他參數調整，目前沒有
     */
    public drawEdge(source: any = { x: 0, y: 0 }, target: any = { x: 0, y: 0 }, direction: string = 'v', shape: string = registerName.normalEdge, option: any = {}) {
        let sourceCheck, targetCheck;
        if (direction === 'v' || direction === 'V') {
            sourceCheck = { cell: source, port: 'bottom' };
            targetCheck = { cell: target, port: 'top' };
        }
        if (direction === 'h' || direction === 'H') {
            sourceCheck = { cell: source, port: 'right' };
            targetCheck = { cell: target, port: 'left' };
        }

        this.graph.addEdge({
            shape: shape,
            source: sourceCheck,
            target: targetCheck
        });
    }
    // #endregion

    // #region 初始化相關
    // 初始化画布
    public initGraph() {
        const graph = new Graph({
            container: document.getElementById(GRAPH_NAME)!, // 画布的容器
            background: { color: '#2A2A2A' },                       // 背景
            grid: {                                                 // 网格
                type: 'doubleMesh',                                 // 'dot' | 'fixedDot' | 'mesh' | 'doubleMesh'
                visible: true,
                args: [                                             // doubleMesh 才要分主次
                    {
                        color: '#6e6e6e',                           // 主网格线颜色
                        thickness: 1,                               // 主网格线宽度
                    },
                    {
                        color: '#6e6e6e',                           // 次网格线颜色
                        thickness: 1,                               // 次网格线宽度
                        factor: 4,                                  // 主次网格线间隔
                    },
                ],
            },
            mousewheel: {                                           // 鼠标滚轮缩放
                enabled: true,
                zoomAtMousePosition: true,                          // 是否将鼠标位置作为中心缩放
                modifiers: 'ctrl',                                  // 需要按下修饰键并滚动鼠标滚轮时才触发画布缩放
            },
            connecting: {                                           // 连线规则
                router: {                                           // 路由将边的路径点 vertices 做进一步转换处理，并在必要时添加额外的点
                    name: 'normal',                              // 智能正交路由，由水平或垂直的正交线段组成，并自动避开路径上的其他节点
                },
                connector: {                                        // 连接器
                    name: 'normal',                                // 圆角连接器，将起点、路由点、终点通过直线按顺序连接，并在线段连接处通过圆弧连接
                },
                anchor: 'center',                                   // 当连接到节点时，通过 anchor 来指定被连接的节点的锚点
                connectionPoint: 'anchor',                          // 指定连接点
                allowBlank: false,                                  // 是否允许连接到画布空白位置的点
                snap: {                                             // 连线的过程中距离节点或者连接桩radius时会触发自动吸附
                    radius: 20,
                },
                validateConnection({ targetMagnet }) {              // 在移动边的时候判断连接是否有效，如果返回 false，当鼠标放开的时候，不会连接到当前元素，否则会连接到当前元素。
                    return !!targetMagnet
                },
            },
            interacting: {
                nodeMovable: false,                                 // 节点是否可以被移动
                edgeMovable: false,                                 // 边是否可以被移动
            },
            highlighting: {                                         // 高亮选项
                magnetAdsorbed: {                                   // 连线过程中，自动吸附到链接桩时被使用
                    name: 'stroke',
                    args: {
                        attrs: {
                            fill: '#5F95FF',
                            stroke: '#5F95FF',
                        },
                    },
                },
            },
            resizing: false,                                         // 缩放节点
            rotating: false,                                        // 旋转节点
            panning: {                                              // 画布是否可以拖动
                enabled: true,
                eventTypes: ['rightMouseDown']                      // 触发画布拖拽的行为
            },
            scroller: true,                                         // 滚动画布
            snapline: true,                                         // 对齐线
            keyboard: true,                                         // 键盘快捷键
            clipboard: true,                                        // 剪切板
            history: true,                                          // 撤销/重做
        });

        this.graph = graph;
    }

    // 快捷键与事件
    public initEvent() {
        // copy cut paste
        // this.graph.bindKey(['meta+c', 'ctrl+c'], () => {
        //     const cells = this.graph.getSelectedCells()
        //     if (cells.length) {
        //         this.graph.copy(cells)
        //     }
        //     return false
        // })
        // this.graph.bindKey(['meta+x', 'ctrl+x'], () => {
        //     const cells = this.graph.getSelectedCells()
        //     if (cells.length) {
        //         this.graph.cut(cells)
        //     }
        //     return false
        // })
        // this.graph.bindKey(['meta+v', 'ctrl+v'], () => {
        //     if (!this.graph.isClipboardEmpty()) {
        //         const cells = this.graph.paste({ offset: 32 })
        //         this.graph.cleanSelection()
        //         this.graph.select(cells)
        //     }
        //     return false
        // })

        //undo redo
        // this.graph.bindKey(['meta+z', 'ctrl+z'], () => {
        //     if (this.graph.history.canUndo()) {
        //         this.graph.history.undo()
        //     }
        //     return false
        // })
        // this.graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
        //     if (this.graph.history.canRedo()) {
        //         this.graph.history.redo()
        //     }
        //     return false
        // })

        // select all
        // this.graph.bindKey(['meta+a', 'ctrl+a'], () => {
        //     const nodes = this.graph.getNodes()
        //     if (nodes) {
        //         this.graph.select(nodes)
        //     }
        // })

        //delete
        // this.graph.bindKey('backspace', () => {
        //     const cells = this.graph.getSelectedCells()
        //     if (cells.length) {
        //         this.graph.removeCells(cells)
        //     }
        // })

        // 控制连接桩显示/隐藏
        // const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
        //     for (let i = 0, len = ports.length; i < len; i = i + 1) {
        //         ports[i].style.visibility = show ? 'visible' : 'hidden'
        //     }
        // }
        // this.graph.on('node:mouseenter', () => {
        //     const container = document.getElementById(GRAPH_NAME)!
        //     const ports = container.querySelectorAll(
        //         '.x6-port-body',
        //     ) as NodeListOf<SVGElement>
        //     showPorts(ports, true)
        // })
        // this.graph.on('node:mouseleave', () => {
        //     const container = document.getElementById(GRAPH_NAME)!
        //     const ports = container.querySelectorAll(
        //         '.x6-port-body',
        //     ) as NodeListOf<SVGElement>
        //     showPorts(ports, false)
        // })

        // this.graph.on('cell:dblclick', ({ cell, e }) => {
        //     const isNode = cell.isNode()
        //     const name = cell.isNode() ? 'node-editor' : 'edge-editor'
        //     cell.removeTool(name)
        //     cell.addTools({
        //         name,
        //         args: {
        //             event: e,
        //             attrs: {
        //                 backgroundColor: isNode ? '#EFF4FF' : '#FFF',
        //             },
        //         },
        //     })
        // })
    }

    // 初始化图形定義
    /**
     * 自定義節點
     * port: 上下左右四個連接點
     * 圖形包含矩形、圓形、菱形
     * 之後用法 ex.
     * graph.addNode({
            x: 100,
            y: 60,
            shape: 'custom-rect',
            text: 'My Custom Rect',
        });
     */
    public initGraphNode() {
        const ports = {
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
                    id: 'top',
                    group: 'top',
                },
                {
                    id: 'right',
                    group: 'right',
                },
                {
                    id: 'bottom',
                    group: 'bottom',
                },
                {
                    id: 'left',
                    group: 'left',
                },
            ],
        };

        Graph.registerNode(
            registerName.startOrEnd,
            {
                inherit: 'rect',
                width: 120,
                height: 60,
                attrs: {
                    body: {
                        rx: 12,
                        ry: 12,
                        strokeWidth: 0,
                        stroke: '#5F95FF',
                        fill: colorConfig.START_END_GREEN,
                    },
                    text: {
                        fontSize: 12,
                        fill: '#ffffff',
                    },
                },
                ports: { ...ports },
                zIndex: zIndex.NODE
            },
            true,
        );

        Graph.registerNode(
            registerName.process,
            {
                inherit: 'rect',
                width: 120,
                height: 60,
                attrs: {
                    body: {
                        strokeWidth: 0,
                        stroke: '#5F95FF',
                        fill: colorConfig.PROCESS_BLUE,
                    },
                    text: {
                        fontSize: 12,
                        fill: '#ffffff',
                    },
                },
                ports: { ...ports },
                zIndex: zIndex.NODE
            },
            true,
        );

        Graph.registerNode(
            'custom-polygon',
            {
                inherit: 'polygon',
                width: 65,
                height: 35,
                attrs: {
                    body: {
                        strokeWidth: 1,
                        stroke: '#5F95FF',
                        fill: '#EFF4FF',
                    },
                    text: {
                        fontSize: 12,
                        fill: '#262626',
                    },
                },
                ports: { ...ports },
            },
            true,
        );

        Graph.registerEdge(
            registerName.normalEdge,
            {
                inherit: 'edge',
                router: {
                    name: 'normal',
                },
                attrs: {
                    line: {
                        stroke: '#ffffff',
                        strokeWidth: 2,
                        targetMarker: {
                            name: 'block',
                            width: 12,
                            height: 8,
                        },
                    },
                },
                zIndex: zIndex.EDGE
            }
        );
    }
    // #endregion
}
