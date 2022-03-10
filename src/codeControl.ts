import { Graph, Shape, Addon, Vector, EdgeView, Cell, Node, Edge } from '@antv/x6';
import { insertCss } from 'insert-css';
import { cssConfig, colorConfig, zIndex, registerName } from './constants/config';
import { gsap } from "gsap";
import { overviewConfig } from './flowChartConfigs/overviewConfig';
import { roomGameBeforeConfig } from './flowChartConfigs/roomGameBeforeConfig';
import { overviewConfig_n } from './flowChartConfigs/overviewConfig_n';
import { ImageKey } from './constants/assets';
import _ from 'lodash';

/* html css 相關樣式建立
*   graphContainer: 畫板
*/
const GRAPH_NAME = 'code-graph-container';
const BACK_TO_PREPAGE_BTN_NAME = 'backToPrePage';
const ZOOM_IN_BTN_NAME = 'zoomIn';
const ZOOM_OUT_BTN_NAME = 'zoomOut';
const EDIT_TEXT_BTN_NAME = 'edit';
const CLEAR_BTN_NAME = 'clear';
const DOWNLOAD_BTN_NAME = 'download';
// const READ_FILE = 'readFile';
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

const TIP_DIALOG_ADJUST_X = 90;
const TIP_DIALOG_ADJUST_Y = 90;

const DEFAULT_RECT_WIDTH = 120;
const DEFAULT_RECT_HEIGHT = 60;
const DEFAULT_FONTSIZE = 12;

const emptyPage = {
    level: 0,
    nodes: []
}

export default class CodeControl {
    public graph: any;
    public nodesArray: any = {};
    public originConfigs: any = {};
    public saveOriginJSON: any = {};
    public editedConfigs: any = {};
    public nowPage: any = {};
    public prePages: any = {};
    public canEditText: boolean = false;
    public tipDialog: any;

    constructor() {
        preWork();                          // 設定css樣式
        this.initConfigs([                  // 初始化config檔
            overviewConfig,
            roomGameBeforeConfig,
            overviewConfig_n
        ]);
        this.initGraph();                   // 初始化畫布
        this.initEvent();                   // 初始化鍵盤、滑鼠事件
        this.initGraphNode();               // 初始化各種節點設定

        this.drawFromConfig(overviewConfig);
    }

    public drawFromConfig(config: any) {
        this.nowPage = config;

        const nodes = config.nodes;
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const posX = node.data.seat.split("_")[0] * EDGE_LENGTH_H + START_POS_X;
            const posY = node.data.seat.split("_")[1] * EDGE_LENGTH_V + START_POS_Y;
            this.nodesArray[node.data.seat] = this.drawNode(posX, posY, node.shape, node.attr, node.data);
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
                    this.drawEdge(source, target, 'v', registerName.normalEdge, { label: checkYesOrNo, sourceSeat: flow[j], targetSeat: flow[j + 1] });
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
                    this.drawEdge(source, target, 'h', registerName.normalEdge, { label: checkYesOrNo, sourceSeat: flow[j], targetSeat: flow[j + 1] });
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
                this.drawEdge(source, target, 'l', registerName.lEdge, { label: checkYesOrNo, sourceSeat: flow[0], targetSeat: flow[1], sourcePort: flow[2], targetPort: flow[3] });
            }
        }

        this.graph.centerContent();
        if (!this.saveOriginJSON[this.nowPage.name]) this.saveOriginJSON[this.nowPage.name] = this.graph.toJSON();
    }

    // 轉場
    public changeFlowChart(configName: string) {
        this.graph.clearCells();

        // 暫存本頁名稱於及當前level，用於返回本頁
        this.prePages[this.nowPage.level] = this.nowPage.name;

        // 暫存本頁
        this.editedConfigs[this.nowPage.name] = this.nowPage;

        this.drawFromConfig(this.editedConfigs[configName]);
    }

    // #region JSON相關
    // 當前畫布所有節點轉成config格式，並回傳
    public nodesToJSON(nodes: Node[]) {
        let nodesJSON: any[] = [];
        nodes.map((node) => {
            let label = (node.attrs && node.attrs.text && node.attrs.text.text) ? JSON.stringify(node.attrs.text.text) : JSON.stringify('');
            let json = `{
                data: {
                    seat: "${node.data.seat}",
                    name: "${node.data.name}",
                    changeToFlowChart: "${node.data.changeToFlowChart ? node.data.changeToFlowChart : ''}",
                    size: ${node.data.size ? JSON.stringify(node.data.size) : null}
                    tipContent: "${node.data.tipContent ? node.data.tipContent : ''}"
                },
                shape: "${node.shape}",
                attr: {
                    label: ${label}
                }
            }`;
            nodesJSON.push(json);
        })
        return nodesJSON;
    }

    // 當前畫布所有邊轉成config格式，並回傳
    public edgesToJSON(edges: Edge[]) {
        let edgesJSON: any = {};
        let vFlows: any[] = [], vFlow: any[] = [];
        let hFlows: any[] = [], hFlow: any[] = [];
        let lFlows: any[] = [], lFlow: any[] = [];

        edges.map((edge, index) => {
            const direction = edge.data.direction;

            // 先暫定這樣寫，風險在於edges萬一不是按照我的畫線順序排序的話就會出錯
            // 先檢查是否已經換行或換列，是的話就push整個array給flows，並清空
            // 接著如果沒有起點座標就push，有的話就檢查終點座標沒有就push
            if (direction === 'v' || direction === 'V') {
                if (vFlow.length > 0) {
                    let nowSeat = vFlow[vFlow.length - 1].split('_')[0];
                    let nextSeat = edge.data.sourceSeat.split('_')[0];
                    if (nowSeat !== nextSeat) {
                        vFlows.push(vFlow);
                        vFlow = [];
                    }
                }

                if (vFlow.find(e => e === edge.data.sourceSeat) === undefined) vFlow.push(edge.data.sourceSeat);
                if (vFlow.find(e => e === edge.data.targetSeat) === undefined) vFlow.push(edge.data.targetSeat);
            }

            if (direction === 'h' || direction === 'H') {
                if (hFlow.length > 0) {
                    let nowSeat = hFlow[hFlow.length - 1].split('_')[1];
                    let nextSeat = edge.data.sourceSeat.split('_')[1];
                    if (nowSeat !== nextSeat) {
                        hFlows.push(hFlow);
                        hFlow = [];
                    }
                }

                if (hFlow.find(e => e === edge.data.sourceSeat) === undefined) hFlow.push(edge.data.sourceSeat);
                if (hFlow.find(e => e === edge.data.targetSeat) === undefined) hFlow.push(edge.data.targetSeat);
            }

            if (direction === 'l' || direction === 'L') {
                lFlow = [edge.data.sourceSeat, edge.data.targetSeat, edge.data.sourcePort, edge.data.targetPort];
                lFlows.push(lFlow);
                lFlow = [];
            }

            if (index === edges.length - 1) {
                if (vFlow) vFlows.push(vFlow);
                if (hFlow) hFlows.push(hFlow);
            }

        });

        edgesJSON = { vFlows: vFlows, hFlows: hFlows, lFlows: lFlows };
        return edgesJSON;
    }

    // 根據編輯過的畫布撰寫一個新版config
    public getNewVersionConfig() {
        const nodes = this.graph.getNodes();
        const edges = this.graph.getEdges();
        const nodesJSON = this.nodesToJSON(nodes);
        const edgesJSON = this.edgesToJSON(edges);

        // 版號都先幫他加一版
        const newVersion = `${this.nowPage.version.split('.')[0]}.${this.nowPage.version.split('.')[1]}.${Number(this.nowPage.version.split('.')[2]) + 1}`;

        const newConfig = `
        export const ${this.nowPage.name} = {
            name: "${this.nowPage.name}",
            level: ${this.nowPage.level},
            version: "${this.checkIfEdited() ? newVersion : this.nowPage.version}",
            nodes: [${nodesJSON}],
            vFlows: ${JSON.stringify(edgesJSON.vFlows)},
            hFlows: ${JSON.stringify(edgesJSON.hFlows)},
            lFlows: ${JSON.stringify(edgesJSON.lFlows)},
        }`
        return newConfig;
    }

    // 檢查是否編輯過
    public checkIfEdited() {
        const editedJSON = this.graph.toJSON();
        const originJSON = this.saveOriginJSON[this.nowPage.name];
        console.log(editedJSON, originJSON, _.isEqual(editedJSON, originJSON));
        return !_.isEqual(editedJSON, originJSON);
    }
    // #endregion

    // #region 左側按鈕功能
    // 返回上一張流程圖
    public backToPrePage() {
        const nowLevel = this.nowPage.level;
        if (!this.prePages[nowLevel - 1]) {
            console.warn('no pre page!');
            return;
        }
        this.graph.clearCells();

        // 清空當前level
        this.prePages[this.nowPage.level] = '';

        // 暫存本頁
        this.editedConfigs[this.nowPage.name] = this.nowPage;
        this.drawFromConfig(this.editedConfigs[this.prePages[nowLevel - 1]]);
    }

    // zoom in
    public zoomIn() {
        this.graph.zoom(0.1);
    }

    // zoom out
    public zoomOut() {
        this.graph.zoom(-0.1);
    }
    // #endregion

    // #region 畫圖相關
    // 畫節點
    /**
     * 
     * @param posX 座標x
     * @param posY 座標y
     * @param shape 形狀, 預設圓角矩形
     * @param attr X6相關參數
     * {
     *      @param label (string)(optional) 文字, 需注意換行要加 \n
     *      ...其他功能後續補充
     * }
     * @param data X6以外自定義參數
     * {
     *      @param seat (string) 節點對應座標
     *      @param name (string) 節點名稱
     *      @param size (obj)(optional) 如果要調整該節點大小，傳入 { w: xx, h: xx } 的格式 
     *      @param changeToFlowChart (string)(optional) 此節點會轉換去哪個流程圖，需注意節點shape類型要為 registerName.changeToOtherFlowChart
     *      fontSize: 文字大小
     *      ...其他功能後續補充
     * }
     */
    public drawNode(posX: number = 0, posY: number = 0, shape: string = registerName.process, attr: any = {}, data: any = {}) {
        const node = this.graph.addNode({
            x: posX,
            y: posY,
            shape: shape,
            attrs: {
                label: {
                    fontSize: DEFAULT_FONTSIZE,
                }
            },
            data: {
                name: data.name,
                changeToFlowChart: ''
            }
        });

        if (attr && attr.label) node.label = attr.label;
        if (attr && attr.fontSize) node.attr('label/fontSize', attr.fontSize);
        if (shape === registerName.changeToOtherFlowChart) {
            node.data.changeToFlowChart = data.changeToFlowChart;
        }
        if (data && data.size) {
            node.resize(data.size.w, data.size.h);
            const adjustX = data.size.w > DEFAULT_RECT_WIDTH ? -(data.size.w - DEFAULT_RECT_WIDTH) / 2 : (data.size.w - DEFAULT_RECT_WIDTH) / 2;
            const adjustY = data.size.h > DEFAULT_RECT_HEIGHT ? -(data.size.h - DEFAULT_RECT_HEIGHT) / 2 : (data.size.h - DEFAULT_RECT_HEIGHT) / 2;
            node.position(posX + adjustX, posY + adjustY);
            node.data.size = data.size;
        }
        if (data && data.seat) node.data.seat = data.seat;
        if (data && data.tipContent) node.data.tipContent = data.tipContent;

        return node;
    }

    // 畫邊
    /**
     * 
     * @param source 從哪個座標{x, y}或節點{cell}或指定節點的連接點{cell, port}
     * @param target 到哪個座標{x, y}或節點{cell}或指定節點的連接點{cell, port}
     * @param direction 方向，流程圖大部分不是上到下(v)就是左到右(h)，預設上到下
     * @param shape 哪種類型的邊，預設白色直線單箭頭
     * @param data 自定義參數
     * {
     *      @param label (string)(optional) 邊上顯示文字，通常是“是”、“否”
     *      @param sourceSeat (string) 起點座標
     *      @param targetSeat (string) 終點座標
     *      @param sourcePort (string) 起點port
     *      @param targetPort (string) 終點port
     * }
     */
    public drawEdge(source: any = { x: 0, y: 0 }, target: any = { x: 0, y: 0 }, direction: string = 'v', shape: string = registerName.normalEdge, data: any = {}) {
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
            },
            data: {
                direction: direction,
                sourceSeat: data.sourceSeat,
                targetSeat: data.targetSeat,
                sourcePort: data.sourcePort ? data.sourcePort : '',
                targetPort: data.targetPort ? data.targetPort : '',
            }
        });

        if (data && data.label) {
            if (data.label === 'n' || data.label === 'N') edge.appendLabel('否');
            if (data.label === 'y' || data.label === 'Y') edge.appendLabel('是');

            edge.data = {
                label: data.label
            };
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
            if (cell && cell.data.changeToFlowChart) this.changeFlowChart(cell.data.changeToFlowChart);
        })

        this.graph.on('node:mouseenter', ({ cell }) => {
            // console.log(cell)
            const posX = cell.data.seat.split("_")[0] * EDGE_LENGTH_H + START_POS_X + TIP_DIALOG_ADJUST_X;
            const posY = cell.data.seat.split("_")[1] * EDGE_LENGTH_V + START_POS_Y + TIP_DIALOG_ADJUST_Y;
            const attr = {
                label: cell.data.tipContent ? cell.data.tipContent : 'test'
            };
            this.tipDialog = this.drawNode(posX, posY, registerName.tipDialog, attr);
        })

        this.graph.on('node:mouseleave', ({ cell }) => {
            this.graph.removeNode(this.tipDialog);
        })

        this.graph.on('cell:dblclick', ({ cell, e }) => {
            if (!this.canEditText) return;
            const name = cell.isNode() ? 'node-editor' : 'edge-editor';
            cell.removeTool(name);
            cell.addTools({
                name,
                args: {
                    event: e,
                },
            });
        })

        let backBtn = document.getElementById(BACK_TO_PREPAGE_BTN_NAME);
        if (backBtn) backBtn.addEventListener('click', () => { this.backToPrePage(); });

        let zoomInBtn = document.getElementById(ZOOM_IN_BTN_NAME);
        if (zoomInBtn) zoomInBtn.addEventListener('click', () => { this.zoomIn(); });
        let zoomOutBtn = document.getElementById(ZOOM_OUT_BTN_NAME);
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => { this.zoomOut(); });

        let clearBtn = document.getElementById(CLEAR_BTN_NAME);
        if (clearBtn) clearBtn.addEventListener('click', () => {
            this.graph.clearCells();
            this.prePages[this.nowPage.level] = this.nowPage.name;
            this.nowPage = emptyPage;
        });

        let downloadBtn = document.getElementById(DOWNLOAD_BTN_NAME);
        if (downloadBtn) {
            downloadBtn.addEventListener('click', () => {
                if (this.nowPage.level === 0) {
                    console.warn('nothing to download!');
                    return;
                }

                let downConfig = this.getNewVersionConfig();
                this.download(this.nowPage.name + '.ts', downConfig);
            });
        }

        let editTextBtn = document.getElementById(EDIT_TEXT_BTN_NAME);
        if (editTextBtn) {
            editTextBtn.addEventListener('click', () => {
                this.canEditText = !this.canEditText;
                const onOff = this.canEditText ? 'on' : 'off';
                if (editTextBtn) editTextBtn.innerText = 'edit ' + onOff;
            });
        }

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

        // tip，圓角矩形，黑，白匡
        Graph.registerNode(
            registerName.tipDialog,
            {
                inherit: 'rect',
                width: DEFAULT_RECT_WIDTH * 2,
                height: DEFAULT_RECT_HEIGHT * 2,
                attrs: {
                    body: {
                        rx: 15,
                        ry: 15,
                        strokeWidth: 2,
                        stroke: '#cccccc',
                        fill: '#000000',
                    },
                    text: {
                        fontSize: DEFAULT_FONTSIZE,
                        fill: '#ffffff',
                    },
                },
                ports: { ...ports },
                zIndex: zIndex.TIP,
            },
            true,
        );

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
                        fill: colorConfig.YN_RED,
                    },
                    text: {
                        fontSize: DEFAULT_FONTSIZE,
                        fill: '#262626',
                    },
                },
                ports: { ...ports },
                zIndex: zIndex.NODE,
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
                        fill: colorConfig.YN_ORANGE,
                    },
                    text: {
                        fontSize: DEFAULT_FONTSIZE,
                        fill: '#262626',
                    },
                },
                ports: { ...ports },
                zIndex: zIndex.NODE,
            },
            true,
        );

        // 正常流程分岔路，菱形，綠
        Graph.registerNode(
            registerName.yesOrNo_success,
            {
                inherit: 'polygon',
                width: DEFAULT_RECT_WIDTH,
                height: DEFAULT_RECT_HEIGHT,
                attrs: {
                    body: {
                        refPoints: '0,10 10,0 20,10 10,20',
                        strokeWidth: 0,
                        stroke: '#5F95FF',
                        fill: colorConfig.YN_GREEN,
                    },
                    text: {
                        fontSize: DEFAULT_FONTSIZE,
                        fill: '#262626',
                    },
                },
                ports: { ...ports },
                zIndex: zIndex.NODE,
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

        // 彈窗“网络连接失败，请稍后再试”
        Graph.registerNode(
            registerName.popupConnectFailed,
            {
                inherit: 'image',
                width: DEFAULT_RECT_WIDTH,
                height: DEFAULT_RECT_HEIGHT,
                imageUrl: ImageKey.POPUP_CONNECT_FAILED,
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

    // 初始化config檔
    public initConfigs(configs: Array<any> = []) {
        configs.forEach(config => {
            this.originConfigs[config.name] = JSON.parse(JSON.stringify(config));
            this.editedConfigs[config.name] = JSON.parse(JSON.stringify(config));
        });
    }

    public download(filename, text) {
        var pom = document.createElement('a');
        pom.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(text));
        pom.setAttribute('download', filename);

        if (document.createEvent) {
            var event = document.createEvent('MouseEvents');
            event.initEvent('click', true, true);
            pom.dispatchEvent(event);
        }
        else {
            pom.click();
        }
    }
    // #endregion
}
