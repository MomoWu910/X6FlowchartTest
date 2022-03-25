import { Graph, Shape, Addon, Vector, EdgeView, Cell, Node, Edge } from '@antv/x6';
import { insertCss } from 'insert-css';
import { cssConfig, colorConfig, zIndex, registerName, PORTS } from './constants';
import { ImageKey } from './constants/assets';
import _ from 'lodash';

import { overviewConfig } from './flowChartConfigs/overviewConfig';
import { roomGameBeforeConfig } from './flowChartConfigs/roomGameBeforeConfig';

import popupRemaining from '../res/nodeAssets/popupRemaining.png';
import popupReturnGame from '../res/nodeAssets/popupReturnGame.png';
import popupConnectFailed from '../res/nodeAssets/popupConnectFailed.png';
import { gsap } from 'gsap';

const GRAPH_NAME = 'code-graph-container';
const BACK_TO_PREPAGE_BTN_NAME = 'backToPrePage';
const ZOOM_IN_BTN_NAME = 'zoomIn';
const ZOOM_OUT_BTN_NAME = 'zoomOut';
const EDIT_TEXT_BTN_NAME = 'edit';
const CLEAR_BTN_NAME = 'clear';
const DRAW_CONFIG_OVERVIEW = 'drawConfig-overviewConfig';
const DOWNLOAD_BTN_NAME = 'download';
const TOGGLE_GRID_BTN_NAME = 'toggleGrid';

const START_POS_X = 100;
const START_POS_Y = 100;
const EDGE_LENGTH_V = 140;
const EDGE_LENGTH_H = 240;

const TIP_DIALOG_ADJUST_X = 130;
const TIP_DIALOG_ADJUST_Y = 140;

const DEFAULT_RECT_WIDTH = 160;
const DEFAULT_RECT_HEIGHT = 80;
const DEFAULT_FONTSIZE = 12;

const emptyPage = {
    level: 0,
    nodes: []
}

export default class FlowChart {
    public graph: any;
    public nodesArray: any = {};
    public originConfigs: any = {};
    public saveOriginJSON: any = {};
    public editedConfigs: any = {};
    public nowPage: any = {};
    public prePages: any = {};
    public canEditText: boolean = false;
    public tipDialog: any;
    public theme: string = 'dark';

    /**
     * @param canvasId (string) 用於套入canvas的<div>的id
     * @param option (obj, optional) 可調整參數
     * {
     *      @param width (number) 畫布寬，默認容器寬
     *      @param height (number) 畫布高，默認容器高
     *      @param theme (string) 主題，默認 'dark'暗色主題，可以代入 'light'改為亮色主題
     *      @param isGrid (boolean) 是否需要格線，預設開啟
     * }
     */
    constructor(canvasId: string, option: any = {}) {

        this.initContainer(canvasId)
        this.initConfigs([                  // 初始化config檔
            overviewConfig,
            roomGameBeforeConfig
        ]);
        this.initGraph(option);                   // 初始化畫布
        this.initEvent();                   // 初始化鍵盤、滑鼠事件
        this.initGraphNode();               // 初始化各種節點設定

    }

    // #region config畫圖相關
    public drawFromConfig(config: any) {
        if (this.graph.getCellCount() > 0) this.graph.clearCells();
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
    // #endregion

    // #region JSON相關
    // 當前畫布所有節點轉成config格式，並回傳
    public nodesToJSON(nodes: Node[]) {
        let nodesJSON: any[] = [];
        nodes.map((node) => {
            let label = (node.attrs && node.attrs.text && node.attrs.text.text) ? JSON.stringify(node.attrs.text.text) : JSON.stringify('');
            let posX = node.position().x;
            let posY = node.position().y;
            let json = `{
                data: {
                    seat: "${node.data.seat ? node.data.seat : ''}",
                    position: "{ x: ${posX}, y: ${posY} }",
                    name: "${node.data.name ? node.data.name : ''}",
                    changeToFlowChart: "${node.data.changeToFlowChart ? node.data.changeToFlowChart : ''}",
                    size: ${node.data.size ? JSON.stringify(node.data.size) : null},
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

    // #region 功能相關
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

    // 隱藏隔線
    public hideGrid() {
        this.graph.hideGrid();
    }

    // 顯示隔線
    public showGrid() {
        this.graph.showGrid();
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
     *      @param portLabel (object)(optional) 周圍的文字
     *      {
     *          @param portId (string) 要顯示在哪個角，有九個角，ex.'left'左中, 'left_top'左上, 'right_bottom'右下
     *          @param label (string) 文字
     *      }
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

        let newPort = {};
        if (attr && attr.portLabel) {
            newPort = this.getPortLabelsetting(attr.portLabel);
            // console.warn(newPort, attr, attr.portLabel);
        }

        const node = this.graph.addNode({
            x: posX,
            y: posY,
            shape: shape,
            ports: newPort,
            attrs: {
                label: {
                    fontSize: DEFAULT_FONTSIZE,
                }
            },
            data: {
                name: data.name ? data.name : '',
                changeToFlowChart: ''
            }
        });

        // if (data && data.size) {
        //     node.resize(data.size.w, data.size.h);

        //     // 這一段讓節點置中
        //     const adjustX = data.size.w > DEFAULT_RECT_WIDTH ? -(data.size.w - DEFAULT_RECT_WIDTH) / 2 : (data.size.w - DEFAULT_RECT_WIDTH) / 2;
        //     const adjustY = data.size.h > DEFAULT_RECT_HEIGHT ? -(data.size.h - DEFAULT_RECT_HEIGHT) / 2 : (data.size.h - DEFAULT_RECT_HEIGHT) / 2;
        //     node.position(posX + adjustX, posY + adjustY);

        //     node.data.size = data.size;
        // }

        let fontSize = attr.fontSize ? attr.fontSize : DEFAULT_FONTSIZE;
        if (attr && attr.label) {
            const check = this.checkLabel(node.size().width, attr.label, fontSize);

            node.label = check.newLabel;
            fontSize = check.newFontSize;
            node.resize(check.newSize, node.size().height);
            node.data.size = { w: check.newSize, h: node.size().height };

            // 這一段讓節點置中
            const adjustX = check.newSize > DEFAULT_RECT_WIDTH ? -(check.newSize - DEFAULT_RECT_WIDTH) / 2 : (check.newSize - DEFAULT_RECT_WIDTH) / 2;
            const adjustY = node.size().height > DEFAULT_RECT_HEIGHT ? -(node.size().height - DEFAULT_RECT_HEIGHT) / 2 : (node.size().height - DEFAULT_RECT_HEIGHT) / 2;
            node.position(posX + adjustX, posY + adjustY);
        }
        node.attr('label/fontSize', fontSize);

        if (shape === registerName.changeToOtherFlowChart) {
            node.data.changeToFlowChart = data.changeToFlowChart;
        }
        if (data && data.seat) node.data.seat = data.seat;
        if (data && data.tipContent) node.data.tipContent = data.tipContent;

        // console.warn();
        return node;
    }

    // 畫邊
    /**
     * 
     * @param source 從哪個座標{x, y}或節點{cell}或指定節點的連接點{cell, port}
     * @param target 到哪個座標{x, y}或節點{cell}或指定節點的連接點{cell, port}
     * @param direction 方向，水平H 或 垂直V 或 L型(需要給定port)
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
            // 檢查方向，source在上方那就從 bottom->top，在下方就 top->bottom
            // 下方的y比較大
            let checkV = (source.position().y - target.position().y) < 0;
            sourceCheck = { cell: source, port: checkV ? 'bottom' : 'top' };
            targetCheck = { cell: target, port: checkV ? 'top' : 'bottom' };
        }
        if (direction === 'h' || direction === 'H') {
            // 檢查方向，source在左方那就從 right->left，在右方就 left->right
            // 右方的x比較大
            let checkH = (source.position().x - target.position().x) < 0;
            sourceCheck = { cell: source, port: checkH ? 'right' : 'left' };
            targetCheck = { cell: target, port: checkH ? 'left' : 'right' };
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
                sourceSeat: data.sourceSeat ? data.sourceSeat : '',
                targetSeat: data.targetSeat ? data.targetSeat : '',
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

    // 檢查文字長度，如果太長超過節點就縮小字體大小，如果小到小於12還不夠就幫他換行(判斷有無底線)
    public checkLabel(nodeSize: number, label: string, fontSize: number = 12) {
        let newSize = nodeSize;
        let newFontSize = fontSize;
        let newLabel = label;
        let if_ = label.includes('_');
        let split = label.split('');

        // 如果太長超過節點就縮小字體大小
        for (let size = fontSize; size < 12; size--) {
            if (split.length * size < nodeSize) {
                newFontSize = size;
                break;
            }
        }

        // 如果小到小於12還不夠就幫他換行(判斷有無底線)
        // if (split.length * newFontSize > nodeSize) {
        //     if (if_) {
        //         const re = /_/g
        //         newLabel = label.replace(re, '_\n');
        //     }
        // }

        // 幫它放大節點size，保留padding兩個字，0.6是因為單純抓字數乘以大小節點會太大
        if (split.length * newFontSize > newSize) {
            newSize = (split.length * 0.6) * newFontSize;
        }

        return { newSize: newSize, newLabel: newLabel, newFontSize: newFontSize }
    }

    // 節點周圍要顯示文字的話，要重寫port的設置
    /**
     * @param portLabel (Array) 要設定文字的ports陣列
     * [
     *      { portId: 'top_left', label: '2022/03/18 15:03:55 GMT', fill: 'red' }, ...
     * ]
     */
    public getPortLabelsetting(portLabel: any = []) {
        const groups = PORTS.groups;
        let items = PORTS.items;
        items.forEach((item, index) => {
            const label = portLabel.find(e => e.portId === item.id);
            if (label !== undefined) {
                items[index] = {
                    ...items[index],
                    attrs: {
                        text: {
                            ...items[index].attrs.text,
                            text: label.label,
                            fill: label.fill ? label.fill : (this.theme === 'dark' ? '#FFF' : '#000'),
                        },
                    },
                }
            }
        });

        return { groups: groups, items: items }
    }

    // 改變節點port文字
    /**
     * @param cell 節點
     * @param portLabel (Array) 要設定文字的ports陣列
     * [
     *      { portId: 'top_left', label: '2022/03/18 15:03:55 GMT', fill: 'red' }, ...
     * ]
     */
    public setPortsLabel(cell: any = Node, portLabel: any = []) {
        portLabel.forEach(item => {
            cell.setPortProp(item.portId, ['attrs', 'text'], { text: item.label, fill: item.fill })
        });
    }

    // 改變節點的文字、周圍文字
    /**
     * @param cell 節點
     * @param label 該節點本身的文字
     * @param portLabel (Array) 要設定文字的ports陣列
     * [
     *      { portId: 'top_left', label: '2022/03/18 15:03:55 GMT', fill: 'red' }, ...
     * ]
     */
    public setNodeLabel(cell: any = Node, label: string = '', portLabel: any = []) {
        if (cell.label) cell.label = label;
        if (portLabel.length) this.setPortsLabel(cell, portLabel);
    }

    // 清除畫布
    public clearGraph() {
        this.graph.clearCells();
        this.prePages[this.nowPage.level] = this.nowPage.name;
        this.nowPage = emptyPage;
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
    // 初始化容器
    private initContainer(canvasId: string) {
        if (!canvasId) return;
        const container = document.getElementById(canvasId)!;
        const graphContainer = document.createElement('div');
        graphContainer.id = GRAPH_NAME;
        container.appendChild(graphContainer);

        insertCss(cssConfig);
    }

    // 初始化画布
    public initGraph(option: any = {}) {
        this.theme = (option && option.theme) ? option.theme : 'dark';
        const isGrid = (option && option.isGrid !== undefined) ? option.isGrid : true;

        const graph = new Graph({
            container: document.getElementById(GRAPH_NAME)!,                        // 画布的容器
            background: { color: this.theme === 'dark' ? '#2A2A2A' : '#ffffff' },   // 背景
            grid: {                                                                 // 网格
                type: 'doubleMesh',                                                 // 'dot' | 'fixedDot' | 'mesh' | 'doubleMesh'
                visible: isGrid,
                args: [                                                             // doubleMesh 才要分主次
                    {
                        color: this.theme === 'dark' ? '#6e6e6e' : '#aaaaaa',       // 主网格线颜色
                        thickness: 1,                                               // 主网格线宽度
                    },
                    {
                        color: this.theme === 'dark' ? '#6e6e6e' : '#aaaaaa',       // 次网格线颜色
                        thickness: 1,                                               // 次网格线宽度
                        factor: 4,                                                  // 主次网格线间隔
                    },
                ],
            },
            mousewheel: {                                                           // 鼠标滚轮缩放
                enabled: true,
                zoomAtMousePosition: true,                                          // 是否将鼠标位置作为中心缩放
                modifiers: 'ctrl',                                                  // 需要按下修饰键并滚动鼠标滚轮时才触发画布缩放
            },
            connecting: {                                                           // 连线规则
                router: {                                                           // 路由将边的路径点 vertices 做进一步转换处理，并在必要时添加额外的点
                    name: 'normal',                                                 // 智能正交路由，由水平或垂直的正交线段组成，并自动避开路径上的其他节点
                },
                connector: {                                                        // 连接器
                    name: 'normal',                                                 // 圆角连接器，将起点、路由点、终点通过直线按顺序连接，并在线段连接处通过圆弧连接
                },
                anchor: 'center',                                                   // 当连接到节点时，通过 anchor 来指定被连接的节点的锚点
                connectionPoint: 'anchor',                                          // 指定连接点
                allowBlank: false,                                                  // 是否允许连接到画布空白位置的点
                snap: {                                                             // 连线的过程中距离节点或者连接桩radius时会触发自动吸附
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
                enabled: false,
                eventTypes: ['rightMouseDown']                      // 触发画布拖拽的行为
            },
            scroller: true,                                         // 滚动画布
            snapline: true,                                         // 对齐线
            keyboard: true,                                         // 键盘快捷键
            clipboard: true,                                        // 剪切板
            history: true,                                          // 撤销/重做
            autoResize: true
        });

        this.graph = graph;

        if (option && option.width) this.graph.resize(option.width, option.height);
    }

    // 快捷键与事件
    public initEvent() {
        this.graph.on('node:mousedown', ({ cell }) => {
            if (cell && cell.data.changeToFlowChart) this.changeFlowChart(cell.data.changeToFlowChart);
        })

        this.graph.on('node:mouseenter', ({ cell }) => {
            if (this.tipDialog) {
                this.graph.removeNode(this.tipDialog);
                this.tipDialog = null;
            }
            if (cell) {
                // console.log(cell.getAttrs());
                const posX = cell.position().x + TIP_DIALOG_ADJUST_X;
                const posY = cell.position().y + TIP_DIALOG_ADJUST_Y;
                const attr = {
                    label: cell.data.tipContent ? cell.data.tipContent : 'test',
                    fontSize: 15,
                };
                this.tipDialog = this.drawNode(posX, posY, registerName.tipDialog, attr);
                this.setNodeLabel(cell,
                    'My Label',
                    [
                        { portId: 'top_left', label: '2022/03/18 15:03:55 GMT' },
                        { portId: 'bottom_right', label: 'success', fill: 'green' },
                    ]);
            }
        })

        this.graph.on('node:mouseleave', ({ cell }) => {
            if (this.tipDialog) {
                this.graph.removeNode(this.tipDialog);
                this.tipDialog = null;
            }
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
        if (clearBtn) clearBtn.addEventListener('click', () => { this.clearGraph(); });

        let drawConfig_overviewBtn = document.getElementById(DRAW_CONFIG_OVERVIEW);
        if (drawConfig_overviewBtn) drawConfig_overviewBtn.addEventListener('click', () => {
            if (overviewConfig) this.drawFromConfig(overviewConfig);
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

        let toggleGridBtn = document.getElementById(TOGGLE_GRID_BTN_NAME);
        if (toggleGridBtn) toggleGridBtn.addEventListener('click', () => {
            if (this.graph.grid.grid) {
                if (this.graph.grid.grid.visible) this.hideGrid();
                else this.showGrid();
            }
        });

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
                ports: { ...PORTS },
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
                ports: { ...PORTS },
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
                ports: { ...PORTS },
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
                ports: { ...PORTS },
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
                ports: { ...PORTS },
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
                ports: { ...PORTS },
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
                ports: { ...PORTS },
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
                ports: { ...PORTS },
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
                imageUrl: popupRemaining.src ? popupRemaining.src : ImageKey.POPUP_REMAINING,
                attrs: {
                    body: {
                        strokeWidth: 0,
                    },
                    text: {
                        fontSize: DEFAULT_FONTSIZE,
                        fill: '#ffffff',
                    },
                },
                ports: { ...PORTS },
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
                imageUrl: popupReturnGame.src ? popupReturnGame.src : ImageKey.POPUP_RETURN_GAME,
                attrs: {
                    body: {
                        strokeWidth: 0,
                    },
                    text: {
                        fontSize: DEFAULT_FONTSIZE,
                        fill: '#ffffff',
                    },
                },
                ports: { ...PORTS },
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
                imageUrl: popupConnectFailed.src ? popupConnectFailed.src : ImageKey.POPUP_CONNECT_FAILED,
                attrs: {
                    body: {
                        strokeWidth: 0,
                    },
                    text: {
                        fontSize: DEFAULT_FONTSIZE,
                        fill: '#ffffff',
                    },
                },
                ports: { ...PORTS },
                zIndex: zIndex.NODE,
            },
            true,
        );

        // 一般線
        Graph.registerEdge(
            registerName.normalEdge,
            {
                inherit: 'edge',
                router: {
                    name: 'normal',
                },
                attrs: {
                    line: {
                        stroke: this.theme === 'dark' ? '#ffffff' : '#000000',
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

        // 轉一次彎L型線
        Graph.registerEdge(
            registerName.lEdge,
            {
                inherit: 'edge',
                router: {
                    name: 'manhattan',
                },
                attrs: {
                    line: {
                        stroke: this.theme === 'dark' ? '#ffffff' : '#000000',
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