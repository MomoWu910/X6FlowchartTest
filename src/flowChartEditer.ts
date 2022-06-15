import { Graph, Node, Edge, Shape, Addon } from '@antv/x6';
import { insertCss } from 'insert-css';
import { cssConfig, colorConfig, zIndex, registerName, PORTS } from './constants';

// const editerDemoConfig = require('./jsonFiles/editerDemoConfig.json');
const editerDemoConfig = require('./jsonFiles/overviewConfig.json');
// const editerDemoConfig = require('./jsonFiles/roomGameBeforeConfig.json');

const fs = require('fs');
import _ from 'lodash';

import popupRemaining from '../res/nodeAssets/popupRemaining.png';
import popupReturnGame from '../res/nodeAssets/popupReturnGame.png';
import popupConnectFailed from '../res/nodeAssets/popupConnectFailed.png';
import { ImageKey } from './constants/assets';
import { franc } from 'franc';

const CONTAINER_NAME = 'editer-container';
const STENCIL_NAME = 'stencil';
const GRAPH_NAME = 'graph-container';

const UNDO_BTN_NAME_EDITER = 'undoEditer';
const REDO_BTN_NAME_EDITER = 'redoEditer';
const ZOOMIN_BTN_NAME_EDITER = 'zoomInEditer';
const ZOOMOUT_BTN_NAME_EDITER = 'zoomOutEditer';
const SAVE_BTN_NAME_EDITER = 'saveEditer';
const LOAD_BTN_NAME_EDITER = 'loadEditer';
const CLEAR_BTN_NAME_EDITER = 'clearEditer';

const DEFAULT_RECT_WIDTH = 160;
const DEFAULT_RECT_HEIGHT = 80;
const DEFAULT_FONTSIZE = 12;

const DEFAULT_CHANGE_COLOR_DELAY = 0.5;

/* html css 相關樣式建立
*   stencilContainer: 左側面板
*   graphContainer: 右側畫板
*/
const preWork = (canvasId: string) => {
    // 这里协助演示的代码，在实际项目中根据实际情况进行调整
    const container = document.getElementById(canvasId)!;
    const stencilContainer = document.createElement('div');
    stencilContainer.id = STENCIL_NAME;
    const graphContainer = document.createElement('div');
    graphContainer.id = GRAPH_NAME;
    container.appendChild(stencilContainer);
    container.appendChild(graphContainer);

    insertCss(cssConfig);
}

export default class FlowChartEditer {
    public graph: any;
    public stencil: any;

    public undoBtn: any = null;
    public redoBtn: any = null;
    public zoomInBtn: any = null;
    public zoomOutBtn: any = null;
    public saveBtn: any = null;
    public loadBtn: any = null;
    public clearBtn: any = null;

    public delayTime_changefColor = DEFAULT_CHANGE_COLOR_DELAY;
    public editing: boolean = false;

    constructor(canvasId: string) {
        preWork(canvasId);                          // 設定css樣式
        this.initGraph();                           // 初始化畫布
        this.initStencil();                         // 初始化左側面板
        this.initGraphNode();                       // 初始化各種節點設定
        this.initGraphEdge();                       // 初始化各種邊設定
        this.initStencilRectNode();                 // 建立面板上方形元件節點
        this.initStencilPolygonNode();              // 建立面板上菱形元件節點
        this.initStencilSpecialNode();              // 建立面板上自定義圖片節點

        this.initToolBar(canvasId);                 // 初始化上一頁按鈕

        this.initKeyBoardEvent();                   // 初始化鍵盤事件
        this.initCellEvent();                       // 初始化物件事件  
        this.initToolBarEvent();                    // 初始化工具列按鈕事件
    }

    // #region 存檔JSON相關
    // 當前畫布所有節點轉成config格式，並回傳
    public nodesToJSON(nodes: Node[]) {
        let nodesJSON: any[] = [];
        nodes.map((node) => {
            // console.log(node);
            let label = (node.attrs && node.attrs.text && node.attrs.text.text) ? JSON.stringify(node.attrs.text.text) : JSON.stringify('');
            let posX = node.position().x;
            let posY = node.position().y;
            let json =
                `
        {
            "data": {
                "seat": "${(node.data && node.data.seat) ? node.data.seat : ''}",
                "position": { "x": ${posX}, "y": ${posY} },
                "id": "${node.id}",
                "name": "${(node.data && node.data.name) ? node.data.name : ''}",
                "changeToFlowChart": "${(node.data && node.data.changeToFlowChart) ? node.data.changeToFlowChart : ''}",
                "size": ${(node.data && node.data.size) ? JSON.stringify(node.data.size) : null},
                "tipContent": "${(node.data && node.data.tipContent) ? node.data.tipContent : ''}"
            },
            "shape": "${node.shape}",
            "attr": {
                "label": ${label}
            }
        }`;
            nodesJSON.push(json);
        })

        return nodesJSON;
    }

    // 當前畫布所有邊轉成config格式，並回傳
    public edgesToJSON(edges: Edge[]) {
        let edgesJSON: any[] = [];

        edges.map((edge) => {
            const direction = (edge.data && edge.data.direction) ? edge.data.direction : 'edit';
            let json =
                `
        {
            "shape": "${edge.shape}",
            "source": ${JSON.stringify(edge.source)},
            "target": ${JSON.stringify(edge.target)},
            "data": {
                "label": "${(edge.labels[0] && edge.labels[0].attrs) ? edge.labels[0].attrs.label.text : ''}",
                "direction": "${direction}"
            }
        }`;
            edgesJSON.push(json);
        });

        return edgesJSON;
    }

    // 根據編輯過的畫布撰寫一個新版config
    public getNewVersionConfig() {
        const nodes = this.graph.getNodes();
        const edges = this.graph.getEdges();
        const nodesJSON = this.nodesToJSON(nodes);
        const edgesJSON = this.edgesToJSON(edges);

        const newConfig =
            `{ 
    "nodes": [${nodesJSON}
    ],
    "edges": [${edgesJSON}
    ] 
}`;
        return newConfig;
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

    // #region 讀檔JSON相關
    public drawFromConfig(config: any = {}) {
        if (!config) {
            console.warn('no config!');
            return;
        }

        // console.log(config);
        if (this.graph.getCellCount() > 0) this.graph.clearCells();

        const nodes = config.nodes;
        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i];
            const posX = node.data.position.x;
            const posY = node.data.position.y;
            this.drawNode(posX, posY, node.shape, node.attr, node.data);
        }

        const edges = config.edges;
        for (let i = 0; i < edges.length; i++) {
            const edge = edges[i];
            const source = edge.source;
            const target = edge.target;
            const direction = (edge.data && edge.data.direction) ? edge.data.direction : 'edit';

            this.drawEdge(source, target, direction, edge.shape, { label: edge.data.label });
        }

        this.graph.cleanHistory();

    }

    // 讀取指定路徑的文件
    private readFile(path: string = '') {
        try {
            let data = fs.readFileSync(path, 'utf8');
            let final = JSON.parse(data);

            return final;
        }
        catch (error) {
            console.error(error);
        }
    }
    // #endregion

    // #region 畫圖相關
    public drawNode(posX: number = 0, posY: number = 0, shape: string = registerName.process, attr: any = {}, data: any = {}) {

        // 如果有要顯示文字在port，先調整port設定檔
        let newPort = {};
        if (attr && attr.portLabels) {
            newPort = this.getPortLabelsSetting(attr.portLabels);
        }

        const node = this.graph.addNode({
            x: posX,
            y: posY,
            shape: shape,
            ports: newPort,
            id: (data && data.id) ? data.id : '',
            attrs: {
                label: {
                    fontSize: DEFAULT_FONTSIZE,
                }
            },
            data: {
                name: (data && data.name) ? data.name : '',
                changeToFlowChart: '',
                tipDialog: null,
                tipParent: (data && data.tipParent) ? data.tipParent : null,
                colorSets: (data && data.colorSets) ? data.colorSets : {},
                tipColorSets: (data && data.tipColorSets) ? data.tipColorSets : {}
            }
        });

        let fontSize = (attr && attr.fontSize) ? attr.fontSize : DEFAULT_FONTSIZE;
        if (attr && attr.label) {
            const check = this.checkLabelIfTooLong(node.size(), attr.label, fontSize);

            node.label = check.newLabel;
            fontSize = check.newFontSize;
            node.resize(check.newSize.width, check.newSize.height);
            node.data.size = { w: check.newSize.width, h: check.newSize.height };
            if (data && data.colorSets && Object.keys(data.colorSets).length === 0) node.data.colorSets = check.colorSets;
        }
        node.attr('label/fontSize', fontSize);
        if (attr && attr.fill) node.attr('label/fill', attr.fill);

        if (shape === registerName.changeToOtherFlowChart) node.data.changeToFlowChart = data.changeToFlowChart;
        if (data && data.seat) node.data.seat = data.seat;
        if (data && data.tipContent) node.data.tipContent = data.tipContent;

        if (data && data.colorSets) {
            if (node.data.colorSets && Object.keys(node.data.colorSets).length > 0) {
                let colorSets: Array<any> = [];
                const settings = Object.keys(node.data.colorSets).map((key, index) => {
                    const set = { index: index, fill: node.data.colorSets[key] };
                    colorSets.push(set);
                });
                this.setNodeLabelColor(node, colorSets);
            }
        }

        if (data && data.id) node.id = data.id;

        // console.log('node', node, node.id);
        return node;
    }

    public drawEdge(source: any = { x: 0, y: 0 }, target: any = { x: 0, y: 0 }, direction: string = 'v', shape: string = registerName.normalEdge, data: any = {}) {
        let sourceCheck, targetCheck;
        let sourceX = 0, sourceY = 0, targetX = 0, targetY = 0;

        // 如果 source.cell or target.cell 是id的話就不進入座標判斷
        if (typeof source.cell !== "string") {
            sourceX = source.cell ? source.cell.position().x : (source.position() ? source.position().x : source.x);
            sourceY = source.cell ? source.cell.position().y : (source.position() ? source.position().y : source.y);
        }
        if (typeof target.cell !== "string") {
            targetX = target.cell ? target.cell.position().x : (target.position() ? target.position().x : target.x);
            targetY = target.cell ? target.cell.position().y : (target.position() ? target.position().y : target.y);
        }

        if (direction === 'v' || direction === 'V') {
            // 檢查方向，source在上方那就從 bottom->top，在下方就 top->bottom
            // 下方的y比較大
            let checkV = (sourceY - targetY) < 0;
            sourceCheck = { cell: source.cell ? source.cell : source, port: source.cell && source.port ? source.port : (checkV ? 'bottom' : 'top') };
            targetCheck = { cell: target.cell ? target.cell : target, port: target.cell && target.port ? target.port : (checkV ? 'top' : 'bottom') };
        }
        else if (direction === 'h' || direction === 'H') {
            // 檢查方向，source在左方那就從 right->left，在右方就 left->right
            // 右方的x比較大
            let checkH = (sourceX - targetX) < 0;
            sourceCheck = { cell: source.cell ? source.cell : source, port: source.cell && source.port ? source.port : (checkH ? 'right' : 'left') };
            targetCheck = { cell: target.cell ? target.cell : target, port: target.cell && target.port ? target.port : (checkH ? 'left' : 'right') };
        }
        else {
            sourceCheck = { cell: source.cell, port: source.port };
            targetCheck = { cell: target.cell, port: target.port };
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
                sourcePort: sourceCheck.port,
                targetPort: targetCheck.port,
            }
        });

        if (data && data.label) {
            if (data.label === 'n' || data.label === 'N') edge.appendLabel('否');
            else if (data.label === 'y' || data.label === 'Y') edge.appendLabel('是');
            else edge.appendLabel(data.label);

            edge.data = {
                ...edge.data,
                label: data.label
            };
        }

        // console.log('edge', edge);

        return edge;
    }

    // 檢查文字長度，如果太長超過節點就縮小字體大小，如果小到小於12還不夠就幫他換行(判斷有無底線)
    private checkLabelIfTooLong(nodeSize: any, label: string, fontSize: number = DEFAULT_FONTSIZE) {
        let newSizeW = nodeSize.width;
        let newSizeH = nodeSize.height;
        let newFontSize = fontSize;
        let newLabel = label;
        let ifn = label.includes('\n');
        let withoutN = ifn ? label.split('\n') : [label];
        let longest = ifn ? withoutN.sort((a, b) => b.length - a.length)[0] : label;
        let split = longest.split('');
        let ifCMN = franc(longest) == 'cmn';
        let minFontSize = ifCMN ? 14 : 12;
        let fontSizeAdjust = ifCMN ? 1.1 : 0.6;

        // 如果太長超過節點就縮小字體大小
        if (fontSize < minFontSize) newFontSize = minFontSize;
        for (let size = newFontSize; size < minFontSize; size--) {
            if (split.length * size < nodeSize) {
                newFontSize = size;
                break;
            }
        }

        if (ifn) {
            // 幫它放大節點高度，保留padding兩個字，1.1是因為單純抓字數乘以大小節點會太小
            if (withoutN.length * newFontSize > newSizeH) {
                newSizeH = (withoutN.length * 1.1) * newFontSize;
            }
        }

        let colorSets = {};
        withoutN.forEach((line, index) => {
            colorSets[index] = 'white';
        })

        // 幫它放大節點寬度，保留padding兩個字，0.6是因為單純抓字數乘以大小節點會太大
        if (split.length * newFontSize > newSizeW) {
            newSizeW = (split.length * fontSizeAdjust) * newFontSize;
        }

        return { newSize: { width: newSizeW, height: newSizeH }, newLabel: newLabel, newFontSize: newFontSize, colorSets: colorSets }
    }

    // 節點周圍要顯示文字的話，要重寫port的設置
    private getPortLabelsSetting(portLabels: any = []) {
        const groups = PORTS.groups;
        let items = PORTS.items;
        items.forEach((item, index) => {
            const label = portLabels.find(e => e.portId === item.id);
            if (label !== undefined) {
                items[index] = {
                    ...items[index],
                    attrs: {
                        text: {
                            ...items[index].attrs.text,
                            text: label.label,
                            fill: label.fill ? label.fill : '#FFF',
                        },
                    },
                }
            }
        });

        return { groups: groups, items: items }
    }

    // 改變節點port文字
    public setPortsLabel(cell: any = Node, portLabels: any = []) {
        portLabels.forEach(item => {
            cell.setPortProp(item.portId, ['attrs', 'text'], { text: item.label, fill: item.fill })
        });
    }

    // 改變節點的文字
    public setNodeLabel(cell: any = Node, label: string = '') {
        if (cell.label) cell.label = label;
    }

    // 改變節點內文字顏色
    public setNodeLabelColor(cell: any = Node, settings: Array<any> = []) {
        gsap.delayedCall(this.delayTime_changefColor, () => {
            let a = this.graph.findViewByCell(cell);
            let allTspan = a.find('tspan');

            settings.forEach(setting => {
                let withoutEmptyTspan = allTspan.filter(tspan => tspan.textContent !== '-');
                if (!withoutEmptyTspan[setting.index]) console.error('no this line!');
                else {
                    withoutEmptyTspan[setting.index].setAttribute('fill', setting.fill);
                    if (cell.data.tipParent) cell.data.tipParent.data.tipColorSets[setting.index] = setting.fill;
                    cell.data.colorSets[setting.index] = setting.fill;
                }
            });
        });
    }

    // 清除畫布
    public clearGraph() {
        this.graph.clearCells();
    }
    // #endregion

    // #region 上排功能相關

    // zoom in
    public zoomIn(value: number = 0.1) {
        this.graph.zoom(value);
    }

    // zoom out
    public zoomOut(value: number = -0.1) {
        this.graph.zoom(value);
    }

    // 初始化畫布左上返回上一頁按鈕
    public initToolBar(canvasId: string) {
        if (!canvasId) return;
        const editContainer = document.getElementById(canvasId)!;

        const toolbar = document.createElement('div');
        toolbar.id = 'toolbar';
        toolbar.style.backgroundColor = 'white';
        editContainer.appendChild(toolbar);

        this.undoBtn = this.createBtn('上一步', UNDO_BTN_NAME_EDITER, toolbar);
        this.redoBtn = this.createBtn('下一步', REDO_BTN_NAME_EDITER, toolbar);
        this.zoomInBtn = this.createBtn('放大', ZOOMIN_BTN_NAME_EDITER, toolbar);
        this.zoomOutBtn = this.createBtn('縮小', ZOOMOUT_BTN_NAME_EDITER, toolbar);
        this.saveBtn = this.createBtn('存檔', SAVE_BTN_NAME_EDITER, toolbar);
        this.loadBtn = this.createBtn('讀檔', LOAD_BTN_NAME_EDITER, toolbar);
        this.clearBtn = this.createBtn('清除', CLEAR_BTN_NAME_EDITER, toolbar);
    }

    // 建立按鈕
    private createBtn(textContent: string = '', id: string = 'noNameBtn', parent: any = null) {
        const btn = document.createElement('button');
        btn.id = id;
        btn.textContent = textContent;
        if (parent) parent.appendChild(btn);

        return btn;
    }
    // #endregion

    // #region 初始化画布
    public initGraph() {
        const graph = new Graph({
            container: document.getElementById(GRAPH_NAME)!, // 画布的容器
            background: { color: '#2A2A2A' },                       // 背景
            grid: {                                                 // 网格
                type: 'doubleMesh',                                 // 'dot' | 'fixedDot' | 'mesh' | 'doubleMesh'
                visible: false,
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
                minScale: 0.5,
                maxScale: 3,
            },
            connecting: {                                           // 连线规则
                router: {                                           // 路由将边的路径点 vertices 做进一步转换处理，并在必要时添加额外的点
                    name: 'manhattan',
                },
                connector: {                                        // 连接器
                    name: 'normal',                                // 圆角连接器，将起点、路由点、终点通过直线按顺序连接，并在线段连接处通过圆弧连接
                    args: {
                        // radius: 8,                                  // 倒角半径
                    },
                },
                anchor: 'center',                                   // 当连接到节点时，通过 anchor 来指定被连接的节点的锚点
                connectionPoint: 'anchor',                          // 指定连接点
                allowBlank: false,                                  // 是否允许连接到画布空白位置的点
                snap: {                                             // 连线的过程中距离节点或者连接桩radius时会触发自动吸附
                    radius: 20,
                },
                createEdge() {
                    return new Shape.Edge({
                        shape: registerName.connectorEdge,
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
                            label: {
                                text: '',
                                fontSize: DEFAULT_FONTSIZE,
                            }
                        },
                    })
                },
                validateConnection({ targetMagnet }) {              // 在移动边的时候判断连接是否有效，如果返回 false，当鼠标放开的时候，不会连接到当前元素，否则会连接到当前元素。
                    return !!targetMagnet
                }
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
            resizing: true,                                         // 缩放节点
            rotating: false,                                        // 旋转节点
            selecting: {                                            // 点选/框选
                enabled: true,
                rubberband: true,                                   // 是否启用框选
                showNodeSelectionBox: true,                         // 是否显示节点的选择框
                showEdgeSelectionBox: true                          // 是否显示边的选择框
            },
            panning: {                                              // 画布是否可以拖动
                enabled: true,
                eventTypes: ['rightMouseDown']                      // 触发画布拖拽的行为
            },
            scroller: true,                                         // 滚动画布
            snapline: true,                                         // 对齐线
            keyboard: true,                                         // 键盘快捷键
            clipboard: true,                                        // 剪切板
            history: {
                enabled: true,
            },
        });

        this.graph = graph;
    }
    // #endregion

    // #region 初始化左側面板設定
    public initStencil() {
        const stencil = new Addon.Stencil({
            title: '流程图元件',
            target: this.graph,                                     // 目标画布
            stencilGraphWidth: 400,
            stencilGraphHeight: 400,
            collapsable: true,                                      // 是否显示全局折叠/展开按钮
            groups: [
                {
                    title: '方形元件',
                    name: 'group1',
                },
                {
                    title: '菱形元件',
                    name: 'group2',
                    graphHeight: 300,
                },
                {
                    title: '自定義圖片元件',
                    name: 'group3',
                    graphHeight: 300,
                }
            ],
            layoutOptions: {                                        // 布局选项
                columns: 1,
                columnWidth: DEFAULT_RECT_WIDTH + 10,
                rowHeight: DEFAULT_RECT_HEIGHT + 10,
                resizeToFit: true,
            },
            getDropNode(node) {
                let clone = node.clone();
                clone.attr('text/text', '');
                return clone;
            }
        })
        document.getElementById(STENCIL_NAME)!.appendChild(stencil.container);
        this.stencil = stencil;
    }
    // #endregion

    // #region 初始化左側面板上元件
    // 方形元件節點
    public initStencilRectNode() {
        const r1 = this.graph.createNode({
            shape: registerName.startOrEnd,
            label: '主線開頭或結尾',
        });
        const r2 = this.graph.createNode({
            shape: registerName.changeToOtherFlowChart,
            label: '切換到別張流程圖',
        });
        const r3 = this.graph.createNode({
            shape: registerName.stopFlowChart,
            label: '支線結尾',
        });
        const r4 = this.graph.createNode({
            shape: registerName.process,
            label: '過程',
        });
        this.stencil.load([r1, r2, r3, r4], 'group1');
    }

    // 菱形元件節點
    public initStencilPolygonNode() {
        const r1 = this.graph.createNode({
            shape: registerName.yesOrNo,
            label: '叉路點',
        });
        const r2 = this.graph.createNode({
            shape: registerName.yesOrNo_API,
            label: 'API相關的叉路點',
        });
        const r3 = this.graph.createNode({
            shape: registerName.yesOrNo_success,
            label: '順利的流程上面的叉路點',
        });
        this.stencil.load([r1, r2, r3], 'group2');
    }

    // 自定義圖片元件節點
    public initStencilSpecialNode() {
        const r1 = this.graph.createNode({
            shape: registerName.popupRemaining,
            // label: '数据',
        });
        const r2 = this.graph.createNode({
            shape: registerName.popupReturnGame,
            // label: '连接',
        });
        const r3 = this.graph.createNode({
            shape: registerName.popupConnectFailed,
            // label: '连接',
        });
        this.stencil.load([r1, r2, r3], 'group3');
    }
    // #endregion

    // #region 快捷键与事件
    public initKeyBoardEvent() {
        // copy cut paste
        this.graph.bindKey(['meta+c', 'ctrl+c'], () => {
            const cells = this.graph.getSelectedCells()
            if (cells.length) {
                this.graph.copy(cells)
            }
            return false
        })
        this.graph.bindKey(['meta+x', 'ctrl+x'], () => {
            const cells = this.graph.getSelectedCells()
            if (cells.length) {
                this.graph.cut(cells)
            }
            return false
        })
        this.graph.bindKey(['meta+v', 'ctrl+v'], () => {
            if (!this.graph.isClipboardEmpty()) {
                const cells = this.graph.paste({ offset: 32 })
                this.graph.cleanSelection()
                this.graph.select(cells)
            }
            return false
        })

        //undo redo
        this.graph.bindKey(['meta+z', 'ctrl+z'], () => {
            if (this.graph.history.canUndo()) {
                this.graph.history.undo()
            }
            return false
        })
        this.graph.bindKey(['meta+shift+z', 'ctrl+shift+z'], () => {
            if (this.graph.history.canRedo()) {
                this.graph.history.redo()
            }
            return false
        })

        // select all
        this.graph.bindKey(['meta+a', 'ctrl+a'], () => {
            const nodes = this.graph.getNodes()
            if (nodes) {
                this.graph.select(nodes)
            }
        })

        //delete
        this.graph.bindKey('backspace', () => {
            const cells = this.graph.getSelectedCells()
            if (cells.length) {
                this.graph.removeCells(cells)
            }
        })
    }

    public initCellEvent() {
        // 控制连接桩显示/隐藏
        const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
            for (let i = 0, len = ports.length; i < len; i = i + 1) {
                ports[i].style.visibility = show ? 'visible' : 'hidden'
            }
        }
        this.graph.on('node:mouseenter', () => {
            const container = document.getElementById(GRAPH_NAME)!
            const ports = container.querySelectorAll(
                '.x6-port-body',
            ) as NodeListOf<SVGElement>
            showPorts(ports, true)
        })
        this.graph.on('node:mouseleave', () => {
            const container = document.getElementById(GRAPH_NAME)!
            const ports = container.querySelectorAll(
                '.x6-port-body',
            ) as NodeListOf<SVGElement>
            showPorts(ports, false)
        })

        this.graph.on('cell:dblclick', ({ cell, e }) => {

            // 因為addTools的動作也會算在歷史紀錄裡，造成undo的時候表現不對所以這邊先關記錄功能
            this.graph.disableHistory();
            const isNode = cell.isNode();
            this.graph.unselect(cell); // 如果雙擊之後還是選取狀態的話，編輯文字時按刪除鍵會把整個cell刪掉，所以先取消選取狀態
            const name = cell.isNode() ? 'node-editor' : 'edge-editor';
            cell.removeTool(name);
            cell.addTools({
                name,
                args: {
                    event: e,
                    attrs: {
                        backgroundColor: isNode ? '#EFF4FF' : '#FFF',
                    },
                },
            });
            this.editing = true;
            if (!this.graph.isHistoryEnabled() && !isNode) this.graph.enableHistory();
        });

        // 節點編輯文字後的回調
        this.graph.on('cell:change:attrs', ({ cell, current }) => {
            if (cell.hasTool('node-editor') && this.editing) {
                this.graph.disableHistory();
                cell.removeTool('node-editor');
                if (!this.graph.isHistoryEnabled()) this.graph.enableHistory();

                this.editing = false;
                cell.attr('label/text', current.text.text);
            }
        });

        // 邊編輯文字後的回調
        this.graph.on('edge:change:labels', ({ cell }) => {
            if (cell.hasTool('edge-editor') && this.editing) {
                this.graph.disableHistory();
                cell.removeTool('edge-editor');
                if (!this.graph.isHistoryEnabled()) this.graph.enableHistory();
                this.editing = false;
            }
        });

        this.graph.on('cell:change:tools', ({ cell }) => {
            if (!this.graph.isHistoryEnabled() && !cell.hasTool('node-editor')) this.graph.enableHistory();
        });

        this.graph.on('blank:click', () => {
            if (this.editing) this.editing = false;
        });
    }

    public initToolBarEvent() {
        if (this.undoBtn) this.undoBtn.addEventListener('click', () => {
            if (this.graph.history.canUndo()) this.graph.history.undo();
        });

        if (this.redoBtn) this.redoBtn.addEventListener('click', () => {
            if (this.graph.history.canRedo()) this.graph.history.redo();
        });

        if (this.zoomInBtn) this.zoomInBtn.addEventListener('click', () => { this.zoomIn(); });

        if (this.zoomOutBtn) this.zoomOutBtn.addEventListener('click', () => { this.zoomOut(); });

        if (this.saveBtn) this.saveBtn.addEventListener('click', () => {
            let downConfig = this.getNewVersionConfig();
            // console.log(downConfig);
            this.download('editerDemoConfig' + '.json', downConfig);
        });

        if (this.loadBtn) this.loadBtn.addEventListener('click', () => {
            if (editerDemoConfig) this.drawFromConfig(editerDemoConfig);
        });

        if (this.clearBtn) this.clearBtn.addEventListener('click', () => { this.clearGraph(); });
    }
    // #endregion

    // #region 初始化图形
    // 初始化图形定義
    /**
     * 自定義節點
     */
    public initGraphNode() {

        if (!Node.registry.exist(registerName.tipDialog)) {
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
        }

        if (!Node.registry.exist(registerName.startOrEnd)) {
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
        }

        if (!Node.registry.exist(registerName.changeToOtherFlowChart)) {
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
        }

        if (!Node.registry.exist(registerName.stopFlowChart)) {
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
        }

        if (!Node.registry.exist(registerName.process)) {
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
        }

        if (!Node.registry.exist(registerName.yesOrNo_API)) {
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
        }

        if (!Node.registry.exist(registerName.yesOrNo)) {
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
        }

        if (!Node.registry.exist(registerName.yesOrNo_success)) {
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
        }

        if (!Node.registry.exist(registerName.popupRemaining)) {
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
        }

        if (!Node.registry.exist(registerName.popupReturnGame)) {
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
        }

        if (!Node.registry.exist(registerName.popupConnectFailed)) {
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
        }
    }

    /**
     * 自定義邊
     */
    public initGraphEdge() {
        if (!Edge.registry.exist(registerName.normalEdge)) {
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

        if (!Edge.registry.exist(registerName.lEdge)) {
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

        if (!Edge.registry.exist(registerName.cRightEdge)) {
            // 轉兩次彎ㄈ型線，右彎
            Graph.registerEdge(
                registerName.cRightEdge,
                {
                    inherit: 'edge',
                    router: {
                        name: 'oneSide',
                        args: { side: 'right' },
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

        if (!Edge.registry.exist(registerName.cLeftEdge)) {
            // 轉兩次彎ㄈ型線，左彎
            Graph.registerEdge(
                registerName.cLeftEdge,
                {
                    inherit: 'edge',
                    router: {
                        name: 'oneSide',
                        args: { side: 'left' },
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

        if (!Edge.registry.exist(registerName.cTopEdge)) {
            // 轉兩次彎ㄈ型線，上彎
            Graph.registerEdge(
                registerName.cTopEdge,
                {
                    inherit: 'edge',
                    router: {
                        name: 'oneSide',
                        args: { side: 'top' },
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

        if (!Edge.registry.exist(registerName.cBottomEdge)) {
            // 轉兩次彎ㄈ型線，下彎
            Graph.registerEdge(
                registerName.cBottomEdge,
                {
                    inherit: 'edge',
                    router: {
                        name: 'oneSide',
                        args: { side: 'bottom' },
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

        if (!Edge.registry.exist(registerName.zEdge)) {
            // 轉兩次彎Z型線
            Graph.registerEdge(
                registerName.zEdge,
                {
                    inherit: 'edge',
                    router: {
                        name: 'er',
                    },
                    arg: {
                        offset: 'center'
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

        if (!Edge.registry.exist(registerName.connectorEdge)) {
            // 編輯器節點連接時的的線
            Graph.registerEdge(
                registerName.connectorEdge,
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
    }
    // #endregion

}
