import { Graph, Shape, Addon, Vector, EdgeView, Cell, Node, Edge } from '@antv/x6';
import { insertCss } from 'insert-css';
import { cssConfig, colorConfig, zIndex, registerName } from './constants/config';
import { gsap } from "gsap";
import { testConfig } from './flowChartConfigs/testConfig';
import { ImageKey } from './constants/assets';

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
const EDGE_LENGTH_H = 200;

const DEFAULT_RECT_WIDTH = 120;
const DEFAULT_RECT_HEIGHT = 60;
const DEFAULT_FONTSIZE = 12;

export default class Demo {
    public graph: any;
    public nodesArray: any = {};

    constructor() {
        preWork();                          // 設定css樣式
        this.initGraph();                   // 初始化畫布
        this.initEvent();                   // 初始化鍵盤、滑鼠事件
        this.initGraphNode();               // 初始化各種節點設定

        // this.draw();
        this.drawFromConfig(testConfig);
    }

    public drawFromConfig(config: any) {
        const nodes = config.nodes;

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const posX = node.seat.split("_")[0] * EDGE_LENGTH_H + START_POS_X;
            const posY = node.seat.split("_")[1] * EDGE_LENGTH_V + START_POS_Y;
            let attr = node.attr;
            this.nodesArray[node.seat] = this.drawNode(posX, posY, node.shape, attr);
        }

        const vFlows = config.vFlows;
        if (vFlows) {
            for (let i = 0; i < vFlows.length; i++) {
                const flow = vFlows[i];
                for (let j = 0; j < flow.length - 1; j++) {

                    let source = this.nodesArray[flow[j]];
                    let checkYesOrNo = '';
                    if (flow[j].split("_")[2]) {
                        checkYesOrNo = flow[j].split("_")[2];
                        source = this.nodesArray[`${flow[j].split("_")[0]}_${flow[j].split("_")[1]}`];
                    }

                    let target = this.nodesArray[flow[j + 1]];
                    if (flow[j + 1].split("_")[2]) {
                        target = this.nodesArray[`${flow[j + 1].split("_")[0]}_${flow[j + 1].split("_")[1]}`];
                    }
                    this.drawEdge(source, target, 'v', registerName.normalEdge, { label: checkYesOrNo });
                }
            }
        }

        const hFlows = config.hFlows;
        if (hFlows) {
            for (let i = 0; i < hFlows.length; i++) {
                const flow = hFlows[i];
                for (let j = 0; j < flow.length - 1; j++) {

                    let source = this.nodesArray[flow[j]];
                    let checkYesOrNo = '';
                    if (flow[j].split("_")[2]) {
                        checkYesOrNo = flow[j].split("_")[2];
                        source = this.nodesArray[`${flow[j].split("_")[0]}_${flow[j].split("_")[1]}`];
                    }

                    let target = this.nodesArray[flow[j + 1]];
                    if (flow[j + 1].split("_")[2]) {
                        target = this.nodesArray[`${flow[j + 1].split("_")[0]}_${flow[j + 1].split("_")[1]}`];
                    }
                    this.drawEdge(source, target, 'h', registerName.normalEdge, { label: checkYesOrNo });
                }
            }
        }

        const lFlows = config.lFlows;
        if (lFlows) {
            for (let i = 0; i < lFlows.length; i++) {
                const flow = lFlows[i];
                let checkYesOrNo = '';
                let source = { source: this.nodesArray[flow[0]], port: flow[2] };
                if (flow[0].split("_")[2]) {
                    checkYesOrNo = flow[0].split("_")[2];
                    source = { source: this.nodesArray[`${flow[0].split("_")[0]}_${flow[0].split("_")[1]}`], port: flow[2] };
                }

                const target = { target: this.nodesArray[flow[1]], port: flow[3] };
                this.drawEdge(source, target, 'l', registerName.lEdge, { label: checkYesOrNo });
            }
        }

        this.graph.centerContent();
    }

    // 畫圖
    public draw() {

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
                    fontSize: DEFAULT_FONTSIZE,
                }
            }
        });

        if (option && option.label) node.attr('label/text', option.label);
        if (option && option.fontSize) node.attr('label/fontSize', option.fontSize);
        if (option && option.size) {
            node.resize(option.size.w, option.size.h);
            const adjustX = option.size.w > DEFAULT_RECT_WIDTH ? -(option.size.w - DEFAULT_RECT_WIDTH) / 2 : (option.size.w - DEFAULT_RECT_WIDTH) / 2;
            const adjustY = option.size.h > DEFAULT_RECT_HEIGHT ? -(option.size.h - DEFAULT_RECT_HEIGHT) / 2 : (option.size.h - DEFAULT_RECT_HEIGHT) / 2;
            node.position(posX + adjustX, posY + adjustY);
        }

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
        if (direction === 'l' || direction === 'L') {
            sourceCheck = { cell: source.source, port: source.port };
            targetCheck = { cell: target.target, port: target.port };
        }

        const edge = this.graph.addEdge({
            shape: shape,
            source: sourceCheck,
            target: targetCheck,
            attrs: {
                label: {
                    text: '',
                    fontSize: DEFAULT_FONTSIZE,
                }
            }
        });

        if (option && option.label) {
            if (option.label === 'n' || option.label === 'N') edge.appendLabel('否');
            if (option.label === 'y' || option.label === 'Y') edge.appendLabel('是');
        }
    }
    // #endregion

    // #region 動畫相關
    public flash(cell: Cell) {
        const cellView = this.graph.findViewByCell(cell);
        if (cellView) cellView.highlight();
    }

    public unFlash(cell: Cell) {
        const cellView = this.graph.findViewByCell(cell);
        if (cellView) cellView.unhighlight();
    }

    public startNodeAnimate(nowNode: Node) {
        this.flash(nowNode);

        const edges = this.graph.model.getConnectedEdges(nowNode, {
            outgoing: true,
        });
        gsap.delayedCall(1, () => {
            this.unFlash(nowNode);

            edges.forEach((edge) => {
                this.startEdgeAnimate(edge);
            });
        });
    }

    public startEdgeAnimate(nowEdge: Edge) {
        const view = this.graph.findViewByCell(nowEdge) as EdgeView;
        if (view) {
            const target = nowEdge.getTargetCell() as Node;
            // 判斷是邊的話就建立球，沿著邊前進
            const callback = () => {
                if (target) {
                    this.startNodeAnimate(target);
                }
            }
            const token = Vector.create('circle', { r: 6, fill: '#feb662' });

            view.sendToken(token.node, 1000, callback);
        }
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

        this.graph.on('node:mousedown', ({ cell }) => {
            this.startNodeAnimate(cell);
        })
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
                    id: 'top_left',
                    group: 'top',
                },
                {
                    id: 'top',
                    group: 'top',
                },
                {
                    id: 'top_right',
                    group: 'top',
                },
                {
                    id: 'right_top',
                    group: 'right',
                },
                {
                    id: 'right',
                    group: 'right',
                },
                {
                    id: 'right_bottom',
                    group: 'right',
                },
                {
                    id: 'bottom_left',
                    group: 'bottom',
                },
                {
                    id: 'bottom',
                    group: 'bottom',
                },
                {
                    id: 'bottom_right',
                    group: 'bottom',
                },
                {
                    id: 'left_top',
                    group: 'left',
                },
                {
                    id: 'left',
                    group: 'left',
                },
                {
                    id: 'left_bottom',
                    group: 'left',
                },
            ],
        };

        // 開始或結束，圓角矩形，綠
        Graph.registerNode(
            registerName.startOrEnd,
            {
                inherit: 'rect',
                width: DEFAULT_RECT_WIDTH,
                height: DEFAULT_RECT_HEIGHT,
                attrs: {
                    body: {
                        rx: 12,
                        ry: 12,
                        strokeWidth: 0,
                        stroke: '#5F95FF',
                        fill: colorConfig.START_END_GREEN,
                    },
                    text: {
                        fontSize: DEFAULT_FONTSIZE,
                        fill: '#ffffff',
                    },
                },
                ports: { ...ports },
                zIndex: zIndex.NODE,
            },
            true,
        );

        // 切換其他流程圖，圓角矩形，藍
        Graph.registerNode(
            registerName.changeToOtherFlowChart,
            {
                inherit: 'rect',
                width: DEFAULT_RECT_WIDTH,
                height: DEFAULT_RECT_HEIGHT,
                attrs: {
                    body: {
                        rx: 12,
                        ry: 12,
                        strokeWidth: 0,
                        stroke: '#5F95FF',
                        fill: colorConfig.START_END_BLUE,
                    },
                    text: {
                        fontSize: DEFAULT_FONTSIZE,
                        fill: '#ffffff',
                    },
                },
                ports: { ...ports },
                zIndex: zIndex.NODE,
            },
            true,
        );

        // 暫停流程，圓角矩形，灰
        Graph.registerNode(
            registerName.stopFlowChart,
            {
                inherit: 'rect',
                width: DEFAULT_RECT_WIDTH,
                height: DEFAULT_RECT_HEIGHT,
                attrs: {
                    body: {
                        rx: 12,
                        ry: 12,
                        strokeWidth: 0,
                        stroke: '#5F95FF',
                        fill: colorConfig.STOP_GRAY,
                    },
                    text: {
                        fontSize: DEFAULT_FONTSIZE,
                        fill: '#ffffff',
                    },
                },
                ports: { ...ports },
                zIndex: zIndex.NODE,
            },
            true,
        );

        // 過程，矩形，藍
        Graph.registerNode(
            registerName.process,
            {
                inherit: 'rect',
                width: DEFAULT_RECT_WIDTH,
                height: DEFAULT_RECT_HEIGHT,
                attrs: {
                    body: {
                        strokeWidth: 0,
                        stroke: '#5F95FF',
                        fill: colorConfig.PROCESS_BLUE,
                    },
                    text: {
                        fontSize: DEFAULT_FONTSIZE,
                        fill: '#ffffff',
                    },
                },
                ports: { ...ports },
                zIndex: zIndex.NODE,
            },
            true,
        );

        // API分岔路，菱形，紅
        Graph.registerNode(
            registerName.yesOrNo_API,
            {
                inherit: 'polygon',
                width: DEFAULT_RECT_WIDTH,
                height: DEFAULT_RECT_HEIGHT,
                attrs: {
                    body: {
                        refPoints: '0,10 10,0 20,10 10,20',
                        strokeWidth: 0,
                        stroke: '#5F95FF',
                        fill: '#FFCCCC',
                    },
                    text: {
                        fontSize: DEFAULT_FONTSIZE,
                        fill: '#262626',
                    },
                },
                ports: { ...ports },
            },
            true,
        );

        // 一般分岔路，菱形，橘
        Graph.registerNode(
            registerName.yesOrNo,
            {
                inherit: 'polygon',
                width: DEFAULT_RECT_WIDTH,
                height: DEFAULT_RECT_HEIGHT,
                attrs: {
                    body: {
                        refPoints: '0,10 10,0 20,10 10,20',
                        strokeWidth: 0,
                        stroke: '#5F95FF',
                        fill: '#FAD7AC',
                    },
                    text: {
                        fontSize: DEFAULT_FONTSIZE,
                        fill: '#262626',
                    },
                },
                ports: { ...ports },
            },
            true,
        );

        // 彈窗“維護中”
        Graph.registerNode(
            registerName.popupRemaining,
            {
                inherit: 'image',
                width: DEFAULT_RECT_WIDTH,
                height: DEFAULT_RECT_HEIGHT,
                imageUrl: ImageKey.POPUP_REMAINING,
                attrs: {
                    body: {
                        strokeWidth: 0,
                    },
                    text: {
                        fontSize: DEFAULT_FONTSIZE,
                        fill: '#ffffff',
                    },
                },
                ports: { ...ports },
                zIndex: zIndex.NODE,
            },
            true,
        );

        // 彈窗“回到遊戲”
        Graph.registerNode(
            registerName.popupReturnGame,
            {
                inherit: 'image',
                width: DEFAULT_RECT_WIDTH,
                height: DEFAULT_RECT_HEIGHT,
                imageUrl: ImageKey.POPUP_RETURN_GAME,
                attrs: {
                    body: {
                        strokeWidth: 0,
                    },
                    text: {
                        fontSize: DEFAULT_FONTSIZE,
                        fill: '#ffffff',
                    },
                },
                ports: { ...ports },
                zIndex: zIndex.NODE,
            },
            true,
        );

        // 一般白線
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
                            width: DEFAULT_FONTSIZE,
                            height: 8,
                        },
                    },
                },
                zIndex: zIndex.EDGE
            }
        );

        // 轉一次彎L型白線
        Graph.registerEdge(
            registerName.lEdge,
            {
                inherit: 'edge',
                router: {
                    name: 'manhattan',
                },
                attrs: {
                    line: {
                        stroke: '#ffffff',
                        strokeWidth: 2,
                        targetMarker: {
                            name: 'block',
                            width: DEFAULT_FONTSIZE,
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
