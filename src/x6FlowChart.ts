import { Graph, Registry, Shape, Addon, Vector, EdgeView, Cell, Node, Edge } from '@antv/x6';
import { insertCss } from 'insert-css';
import { cssConfig, containerCSSConfig, colorConfig, zIndex, registerName, PORTS } from './constants';
import { ImageKey } from './constants/assets';
import _ from 'lodash';

import { overviewConfig } from './flowChartConfigs/overviewConfig';
import { roomGameBeforeConfig } from './flowChartConfigs/roomGameBeforeConfig';

import popupRemaining from '../res/nodeAssets/popupRemaining.png';
import popupReturnGame from '../res/nodeAssets/popupReturnGame.png';
import popupConnectFailed from '../res/nodeAssets/popupConnectFailed.png';
import { gsap } from 'gsap';
import { franc } from 'franc';

const GRAPH_NAME = 'code-graph-container';
const BACK_TO_PREPAGE_BTN_NAME = 'backToPrePage';
const BACK_TO_PREPAGE_BTN_NAME_LEFTER = 'backToPrePageLefter';
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

const DEFAULT_CHANGE_COLOR_DELAY = 0.5;
const TIP_TEXT_DELAYTIME = 1 / 2;
const isTest = false;

export default class FlowChart {
    public graph: any;
    public nodesArray: any = {};
    public originConfigs: any = {};
    public saveOriginJSON: any = {};
    public editedConfigs: any = {};
    public nowPage: any = {};
    public prePages: any = {};
    public canEditText: boolean = false;
    public tipDialog: any = null;
    public theme: string = 'dark';
    public timeline: any = null;
    public isNeedAnimate: boolean = false;
    public nowMouseOnNode: any = null;
    public delayTime_changefColor = DEFAULT_CHANGE_COLOR_DELAY;
    public isEditMode: boolean = false;
    public backBtn: any = null;

    private canvasId: string = '';
    private cssConfig: string = '';

    /**
     * @param canvasId (string) ????????????canvas???<div>???id
     * @param option (obj, optional) ???????????????
     * {
     *      @param width (number) ???????????????????????????
     *      @param height (number) ???????????????????????????
     *      @param theme (string) ??????????????? 'dark'??????????????????????????? 'light'??????????????????
     *      @param isGrid (boolean) ?????????????????????????????????
     * }
     */
    constructor(canvasId: string, option: any = {}) {

        this.initContainer(canvasId);
        this.initConfigs([                  // ?????????config???
            overviewConfig,
            roomGameBeforeConfig
        ]);
        this.initGraph(option);                   // ???????????????
        this.initEvent();                   // ??????????????????????????????
        this.initGraphNode();               // ???????????????????????????
        this.initGraphEdge();               // ????????????????????????

        this.initBackBtn(canvasId);                 // ????????????????????????
        this.setBackBtnVisible(false);              // ????????????

    }

    // #region config????????????
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
                let source = { cell: this.nodesArray[flow[0]], port: flow[2] };
                if (flow[0].split("_")[2]) {
                    checkYesOrNo = flow[0].split("_")[2];
                    source = { cell: this.nodesArray[`${flow[0].split("_")[0]}_${flow[0].split("_")[1]}`], port: flow[2] };
                }

                const target = { cell: this.nodesArray[flow[1]], port: flow[3] };
                this.drawEdge(source, target, 'l', registerName.lEdge, { label: checkYesOrNo, sourceSeat: flow[0], targetSeat: flow[1], sourcePort: flow[2], targetPort: flow[3] });
            }
        }

        this.graph.centerContent();
        if (!this.saveOriginJSON[this.nowPage.name]) this.saveOriginJSON[this.nowPage.name] = this.graph.toJSON();
    }

    // ??????
    public changeFlowChart(configName: string) {
        this.graph.clearCells();

        // ??????????????????????????????level?????????????????????
        this.prePages[this.nowPage.level] = this.nowPage.name;

        // ????????????
        this.editedConfigs[this.nowPage.name] = this.nowPage;

        this.drawFromConfig(this.editedConfigs[configName]);
    }

    // ????????????????????????
    public backToPrePage() {
        const nowLevel = this.nowPage.level;
        if (!this.prePages[nowLevel - 1]) {
            console.warn('no pre page!');
            return;
        }
        this.graph.clearCells();

        // ????????????level
        this.prePages[this.nowPage.level] = '';

        // ????????????
        this.editedConfigs[this.nowPage.name] = this.nowPage;
        this.drawFromConfig(this.editedConfigs[this.prePages[nowLevel - 1]]);
    }
    // #endregion

    // #region JSON??????
    // ??????????????????????????????config??????????????????
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

    // ???????????????????????????config??????????????????
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

    // ??????????????????????????????????????????config
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

    // ?????????????????????
    public checkIfEdited() {
        const editedJSON = this.graph.toJSON();
        const originJSON = this.saveOriginJSON[this.nowPage.name];
        console.log(editedJSON, originJSON, _.isEqual(editedJSON, originJSON));
        return !_.isEqual(editedJSON, originJSON);
    }
    // #endregion

    // #region ????????????

    // zoom in
    public zoomIn(value: number = 0.1) {
        this.graph.zoom(value);
    }

    // zoom out
    public zoomOut(value: number = -0.1) {
        this.graph.zoom(value);
    }

    // ????????????
    public hideGrid() {
        this.graph.hideGrid();
    }

    // ????????????
    public showGrid() {
        this.graph.showGrid();
    }

    // ???????????????????????????????????????????????????
    public setDelayTime_changeColor(delayTime: number = DEFAULT_CHANGE_COLOR_DELAY) {
        this.delayTime_changefColor = delayTime;
    }

    // ????????????????????????callback
    public setNodeClickEvenCallback(node: Node, callback: Function = () => { }) {
        if (node && node.data) {
            node.data.clickCallback = callback;
        }
    }

    // ?????????????????????callback
    public setEdgeClickEvenCallback(edge: Edge, callback: Function = () => { }) {
        if (edge && edge.data) {
            edge.data.clickCallback = callback;
        }
    }

    // ???????????????????????????
    public setEditMode(enabled: boolean = false) {
        this.isEditMode = enabled;
    }

    // ?????????????????????visible
    public setBackBtnVisible(visible: boolean = true) {
        if (!this.backBtn) {
            console.warn('/// no back btn');
            return;
        }

        if (visible) {
            this.backBtn.removeAttribute("hidden");
        } else {
            this.backBtn.setAttribute("hidden", "hidden");
        }
    }

    // ?????????????????????callback
    public setBackBtnCallback(callback: Function = () => { }) {
        if (!this.backBtn) {
            console.warn('/// no back btn');
            return;
        }
        this.backBtn.addEventListener("click", callback);
    }
    // #endregion

    // #region ????????????
    // ?????????
    /**
     * 
     * @param posX ??????x
     * @param posY ??????y
     * @param shape ??????, ??????????????????, ?????? H5FC.registerName ??????
     * 
     * @param attr (obj, optional) ??????????????????(?????????tip)
     * {
     *      @param label (string)(optional) ??????, ?????????????????????"\n"
     *      @param fill (string)(optional) ????????????????????????????????? data.colorSets ??????
     *      @param fontSize (number)(optional) ?????????????????????12???????????????12
     *      @param portLabels (array<object>)(optional) ??????port?????????
     *      [
     *          {
     *              @param portId (string) ??????????????????port??????12??????ex.'left'??????, 'left_top'??????, 'right_bottom'?????????????????????
     *              @param label (string) port?????????
     *          }
     *      ]
     * },  
     * 
     * @param data (obj, optional) X6 ????????????????????????????????????
     * {
     *      @param seat (string)(optional) ???????????? config ??????????????????????????????????????? config ?????????????????????????????????
     *      @param name (string)(optional) ????????????
     *      @param size (obj)(optional) ??????????????????????????????????????? { w: xx, h: xx } ????????? 
     *      @param changeToFlowChart (string)(optional) ?????????????????????????????????????????????????????? shape ???????????? H5FC.registerName.changeToOtherFlowChart
     *      @param tipContent (string) ??????hover??????tip??????????????????
     *      @param colorSets (obj)(optional) ????????????????????????????????????????????? { index: fill }???????????????????????????????????? attr.fill ?????????
     *      @param tipColorSets (obj)(optional) ??????tip??????????????????????????????????????? { index: fill }
     * }
     */
    public drawNode(posX: number = 0, posY: number = 0, shape: string = registerName.process, attr: any = {}, data: any = {}) {

        // ???????????????????????????port????????????port?????????
        let newPort = {};
        if (attr && attr.portLabels) {
            newPort = this.getPortLabelsSetting(attr.portLabels);
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

            // ????????????????????????
            const adjustX = check.newSize.width > DEFAULT_RECT_WIDTH ? -(check.newSize.width - DEFAULT_RECT_WIDTH) / 2 : (check.newSize.width - DEFAULT_RECT_WIDTH) / 2;
            const adjustY = check.newSize.height > DEFAULT_RECT_HEIGHT ? -(check.newSize.height - DEFAULT_RECT_HEIGHT) / 2 : (check.newSize.height - DEFAULT_RECT_HEIGHT) / 2;
            node.position(posX + adjustX, posY + adjustY);
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

        return node;
    }

    // ??????
    /**
     * 
     * @param source ???????????????{x, y}?????????{cell}???????????????????????????{cell, port}
     * @param target ???????????????{x, y}?????????{cell}???????????????????????????{cell, port}
     * @param direction ???????????????H ??? ??????V ??? L???(????????????port)
     * @param shape ????????????????????????????????????????????????
     * @param data ???????????????
     * {
     *      @param label (string)(optional) ???????????????????????????????????????????????????
     *      @param sourceSeat (string) ????????????
     *      @param targetSeat (string) ????????????
     * }
     */
    public drawEdge(source: any = { x: 0, y: 0 }, target: any = { x: 0, y: 0 }, direction: string = 'v', shape: string = registerName.normalEdge, data: any = {}) {
        let sourceCheck, targetCheck;
        let sourceX = source.cell ? source.cell.position().x : (source.position() ? source.position().x : source.x);
        let sourceY = source.cell ? source.cell.position().y : (source.position() ? source.position().y : source.y);
        let targetX = target.cell ? target.cell.position().x : (target.position() ? target.position().x : target.x);
        let targetY = target.cell ? target.cell.position().y : (target.position() ? target.position().y : target.y);

        if (direction === 'v' || direction === 'V') {
            // ???????????????source?????????????????? bottom->top??????????????? top->bottom
            // ?????????y?????????
            let checkV = (sourceY - targetY) < 0;
            sourceCheck = { cell: source.cell ? source.cell : source, port: source.cell && source.port ? source.port : (checkV ? 'bottom' : 'top') };
            targetCheck = { cell: target.cell ? target.cell : target, port: target.cell && target.port ? target.port : (checkV ? 'top' : 'bottom') };
        }
        else if (direction === 'h' || direction === 'H') {
            // ???????????????source?????????????????? right->left??????????????? left->right
            // ?????????x?????????
            let checkH = (sourceX - targetX) < 0;
            sourceCheck = { cell: source.cell ? source.cell : source, port: source.cell && source.port ? source.port : (checkH ? 'right' : 'left') };
            targetCheck = { cell: target.cell ? target.cell : target, port: target.cell && target.port ? target.port : (checkH ? 'left' : 'right') };
        }
        else {
            sourceCheck = { cell: source.cell, port: source.port };
            targetCheck = { cell: target.cell, port: target.port };
        }

        const edge = (direction === 'z' || direction === 'Z') ?
            this.graph.addEdge({
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
                },
                // router: {
                //     name: 'manhattan',
                //     args: {
                //         startDirections: [sourceCheck.port],
                //         endDirections: [targetCheck.port],
                //     },
                // }
            }) : this.graph.addEdge({
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
            if (data.label === 'n' || data.label === 'N') edge.appendLabel('???');
            else if (data.label === 'y' || data.label === 'Y') edge.appendLabel('???');
            else edge.appendLabel(data.label);

            edge.data = {
                ...edge.data,
                label: data.label
            };
        }

        return edge;
    }

    // ???????????????????????????????????????????????????????????????????????????????????????12????????????????????????(??????????????????)
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

        // ?????????????????????????????????????????????
        if (fontSize < minFontSize) newFontSize = minFontSize;
        for (let size = newFontSize; size < minFontSize; size--) {
            if (split.length * size < nodeSize) {
                newFontSize = size;
                break;
            }
        }

        if (ifn) {
            // ?????????????????????????????????padding????????????1.1???????????????????????????????????????????????????
            if (withoutN.length * newFontSize > newSizeH) {
                newSizeH = (withoutN.length * 1.1) * newFontSize;
            }
        }

        let colorSets = {};
        withoutN.forEach((line, index) => {
            colorSets[index] = 'white';
        })

        // ?????????????????????????????????padding????????????0.6???????????????????????????????????????????????????
        if (split.length * newFontSize > newSizeW) {
            newSizeW = (split.length * fontSizeAdjust) * newFontSize;
        }

        return { newSize: { width: newSizeW, height: newSizeH }, newLabel: newLabel, newFontSize: newFontSize, colorSets: colorSets }
    }

    // ?????????????????????????????????????????????port?????????
    /**
     * @param portLabels (Array) ??????????????????ports??????
     * [
     *      {
     *          @param portId (string) ??????????????????port??????12??????ex.'left'??????, 'left_top'??????, 'right_bottom'?????????????????????
     *          @param label (string) port?????????
     *          @param fill (string)(optional) port????????????
     *      }
     * ]
     */
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
                            fill: label.fill ? label.fill : (this.theme === 'dark' ? '#FFF' : '#000'),
                        },
                    },
                }
            }
        });

        return { groups: groups, items: items }
    }

    // ????????????port??????
    /**
     * @param cell ??????
     * @param portLabels (Array) ??????????????????ports??????
     * [
     *      {
     *          @param portId (string) ??????????????????port??????12??????ex.'left'??????, 'left_top'??????, 'right_bottom'?????????????????????
     *          @param label (string) port?????????
     *          @param fill (string)(optional) port????????????
     *      }
     * ]
     */
    public setPortsLabel(cell: any = Node, portLabels: any = []) {
        portLabels.forEach(item => {
            cell.setPortProp(item.portId, ['attrs', 'text'], { text: item.label, fill: item.fill })
        });
    }

    // ?????????????????????
    /**
     * @param cell ??????
     * @param label ????????????????????????
     */
    public setNodeLabel(cell: any = Node, label: string = '') {
        if (cell.label) cell.label = label;
    }

    // ???????????????????????????
    /**
     * @param cell ??????
     * @param settings (array)
     * [
     *      {
     *          @param index (number) ???????????????????????????0??????,
     *          @param fill (string) ???????????????????????????
     *      }
     * ]
     */
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

    // ????????????
    public clearGraph() {
        this.graph.clearCells();
        if (this.isEditMode) {
            this.prePages[this.nowPage.level] = this.nowPage.name;
            this.nowPage = emptyPage;
        }
    }
    // #endregion

    // #region ????????????
    // ??????????????????
    public setIfNeedAnimate(isNeedAnimate: boolean = false) {
        // this.isNeedAnimate = isNeedAnimate;
        // ?????????????????????????????????????????
        this.isNeedAnimate = false;
    }

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
            this.setNodeLabel(nowNode, 'My Label');
            this.setPortsLabel(nowNode,
                [
                    { portId: 'top_left', label: '2022/03/18 15:03:55 GMT' },
                    { portId: 'bottom_right', label: 'success', fill: 'green' },
                ]);
            this.unFlash(nowNode);

            edges.forEach((edge) => {
                this.startEdgeAnimate(edge);
            });
        });
    }

    public startEdgeAnimate(nowEdge: Edge) {
        const view = this.graph.findViewByCell(nowEdge) as EdgeView;
        if (view) {
            const token = Vector.create('circle', { r: 6, fill: '#feb662' });
            const source = nowEdge.getSourceCell() as Node;
            const target = nowEdge.getTargetCell() as Node;
            // ????????????????????????????????????????????????
            const callback = () => {
                if (target) {
                    this.startNodeAnimate(target);
                }
            }

            view.sendToken(token.node, 1000, callback);
        }
    }
    // #endregion

    // #region ???????????????
    // ???????????????
    private initContainer(canvasId: string) {
        if (!canvasId) return;
        this.canvasId = canvasId;
        const container = document.getElementById(this.canvasId)!;
        const graphContainer = document.createElement('div');
        graphContainer.id = this.canvasId + '-' + GRAPH_NAME;
        container.appendChild(graphContainer);

        this.initCSSConfig(this.canvasId);
        insertCss(this.cssConfig);
    }

    // ???????????????
    public initGraph(option: any = {}) {
        this.theme = (option && option.theme) ? option.theme : 'dark';
        const isGrid = (option && option.isGrid !== undefined) ? option.isGrid : true;

        const graph = new Graph({
            container: document.getElementById(this.canvasId + '-' + GRAPH_NAME)!,                        // ???????????????
            background: { color: this.theme === 'dark' ? '#2A2A2A' : '#ffffff' },   // ??????
            grid: {                                                                 // ??????
                type: 'doubleMesh',                                                 // 'dot' | 'fixedDot' | 'mesh' | 'doubleMesh'
                visible: isGrid,
                args: [                                                             // doubleMesh ???????????????
                    {
                        color: this.theme === 'dark' ? '#6e6e6e' : '#aaaaaa',       // ??????????????????
                        thickness: 1,                                               // ??????????????????
                    },
                    {
                        color: this.theme === 'dark' ? '#6e6e6e' : '#aaaaaa',       // ??????????????????
                        thickness: 1,                                               // ??????????????????
                        factor: 4,                                                  // ?????????????????????
                    },
                ],
            },
            mousewheel: {                                                           // ??????????????????
                enabled: true,
                zoomAtMousePosition: true,                                          // ???????????????????????????????????????
                modifiers: 'ctrl',                                                  // ??????????????????????????????????????????????????????????????????
            },
            connecting: {                                                           // ????????????
                router: {                                                           // ???????????????????????? vertices ????????????????????????????????????????????????????????????
                    name: 'normal',                                                 // ??????????????????????????????????????????????????????????????????????????????????????????????????????
                },
                connector: {                                                        // ?????????
                    name: 'normal',                                                 // ?????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
                },
                anchor: 'center',                                                   // ?????????????????????????????? anchor ????????????????????????????????????
                connectionPoint: 'anchor',                                          // ???????????????
                allowBlank: false,                                                  // ?????????????????????????????????????????????
                snap: {                                                             // ?????????????????????????????????????????????radius????????????????????????
                    radius: 20,
                },
                validateConnection({ targetMagnet }) {              // ???????????????????????????????????????????????????????????? false?????????????????????????????????????????????????????????????????????????????????????????????
                    return !!targetMagnet
                },
            },
            interacting: {
                nodeMovable: false,                                 // ???????????????????????????
                edgeMovable: false,                                 // ????????????????????????
            },
            highlighting: {                                         // ????????????
                magnetAdsorbed: {                                   // ??????????????????????????????????????????????????????
                    name: 'stroke',
                    args: {
                        attrs: {
                            fill: '#5F95FF',
                            stroke: '#5F95FF',
                        },
                    },
                },
            },
            resizing: false,                                         // ????????????
            rotating: false,                                        // ????????????
            panning: {                                              // ????????????????????????
                enabled: false,
                eventTypes: ['rightMouseDown']                      // ???????????????????????????
            },
            scroller: true,                                         // ????????????
            snapline: true,                                         // ?????????
            keyboard: true,                                         // ???????????????
            clipboard: true,                                        // ?????????
            history: true,                                          // ??????/??????
            autoResize: false
        });

        this.graph = graph;

        if (option && option.width) this.graph.resize(option.width, option.height);
    }

    // ??????????????????
    public initEvent() {
        this.graph.on('node:mousedown', ({ cell }) => {
            // console.log('node:mousedown: ', cell)
            if (cell && cell.data.changeToFlowChart) this.changeFlowChart(cell.data.changeToFlowChart);
            if (cell && cell.data.clickCallback) cell.data.clickCallback();
        })

        this.graph.on('edge:mousedown', ({ edge }) => {
            // console.log('edge:mousedown: ', edge)
            if (edge && edge.data.clickCallback) edge.data.clickCallback();
        })

        this.graph.on('node:mouseenter', ({ cell }) => {

            // ???tip??????????????????????????????tip????????????
            if (this.tipDialog && cell.id !== this.tipDialog.data.tipParent.id && cell.id !== this.tipDialog.id) {
                this.graph.removeNode(this.tipDialog);
                this.tipDialog = null;
                gsap.globalTimeline.clear();
                this.timeline = null;
            }

            if (cell) {
                this.nowMouseOnNode = cell;
                if (cell.data && !cell.data.tipContent) return;
                const posX = cell.position().x + TIP_DIALOG_ADJUST_X;
                const posY = cell.position().y + TIP_DIALOG_ADJUST_Y;
                const attr = {
                    label: cell.data.tipContent ? cell.data.tipContent : '',
                    fontSize: 15,
                };

                if (!this.tipDialog) {
                    this.tipDialog = this.drawNode(posX, posY, registerName.tipDialog, attr,
                        {
                            tipParent: cell,
                            colorSets: cell.data.tipColorSets ? cell.data.tipColorSets : {}
                        }
                    );
                    cell.data.tipDialog = this.tipDialog;
                }

                if (isTest && Object.keys(cell.data.tipColorSets).length == 0) this.timelineTest(cell);

            }
        })

        this.graph.on('node:mouseleave', () => {
            this.nowMouseOnNode = null;
            gsap.delayedCall(TIP_TEXT_DELAYTIME / 2, () => {
                if (!this.nowMouseOnNode && this.tipDialog) {
                    this.graph.removeNode(this.tipDialog);
                    this.tipDialog = null;
                    gsap.globalTimeline.clear();
                    this.timeline = null;
                }
            });

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

        let backBtn = document.getElementById(BACK_TO_PREPAGE_BTN_NAME_LEFTER);
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
                this.download(this.nowPage.name + '.json', downConfig);
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

    public timelineTest(testContent: any) {

        this.timeline = gsap.timeline();
        // this.timeline.add(gsap.delayedCall(TIP_TEXT_DELAYTIME, () => {
        //     if (this.tipDialog) this.setNodeLabelColor(this.tipDialog, [
        //         { index: 0, fill: 'green' },
        //         { index: 1, fill: 'green' },
        //         { index: 2, fill: 'green' },
        //         { index: 3, fill: 'green' },
        //         { index: 4, fill: 'red' },
        //     ]);
        // }));
        // this.timeline.add(gsap.delayedCall(TIP_TEXT_DELAYTIME, () => {
        //     if (this.tipDialog) this.setNodeLabelColor(this.tipDialog, [
        //         { index: 4, fill: 'green' },
        //         { index: 5, fill: 'green' },
        //     ]);
        // }));
        // this.timeline.add(gsap.delayedCall(TIP_TEXT_DELAYTIME, () => {
        //     if (this.tipDialog) this.setNodeLabelColor(this.tipDialog, [{ index: 6, fill: 'green' },]);
        // }));
        // this.timeline.add(gsap.delayedCall(TIP_TEXT_DELAYTIME, () => {
        //     if (this.tipDialog) this.setNodeLabelColor(this.tipDialog, [{ index: 7, fill: 'green' },]);
        // }));
        // this.timeline.add(gsap.delayedCall(TIP_TEXT_DELAYTIME, () => {
        //     if (this.tipDialog) this.setNodeLabelColor(this.tipDialog, [{ index: 8, fill: 'green' },]);
        // }));
        // this.timeline.add(gsap.delayedCall(TIP_TEXT_DELAYTIME, () => {
        //     if (this.tipDialog) this.setNodeLabelColor(this.tipDialog, [{ index: 8, fill: 'green' },]);
        // }));
        // this.timeline.add(gsap.delayedCall(TIP_TEXT_DELAYTIME, () => {
        //     if (this.tipDialog) this.setNodeLabelColor(this.tipDialog, [{ index: 9, fill: 'green' },]);
        // }));
        // this.timeline.add(gsap.delayedCall(TIP_TEXT_DELAYTIME, () => {
        //     if (this.tipDialog) this.setNodeLabelColor(this.tipDialog, [{ index: 10, fill: 'green' },]);
        // }));
        // this.timeline.add(gsap.delayedCall(TIP_TEXT_DELAYTIME, () => {
        //     if (this.tipDialog) this.setNodeLabelColor(this.tipDialog, [{ index: 11, fill: 'green' },]);
        // }));
        // this.timeline.add(gsap.delayedCall(TIP_TEXT_DELAYTIME, () => {
        //     this.setNodeLabel(testContent, 'My Label');
        //     this.setPortsLabel(testContent,
        //         [
        //             { portId: 'top_left', label: '2022/03/18 15:03:55 GMT' },
        //             { portId: 'bottom_right', label: 'success', fill: 'green' },
        //         ]);
        // }));
        // this.timeline.add(() => { this.timeline ?.kill(); });
    }

    // ?????????????????????
    /**
     * ???????????????
     */
    public initGraphNode() {

        if (!Node.registry.exist(registerName.tipDialog)) {
            // tip??????????????????????????????
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
            // ????????????????????????????????????
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
            // ??????????????????????????????????????????
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
            // ?????????????????????????????????
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
            // ?????????????????????
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
            // API????????????????????????
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
            // ??????????????????????????????
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
            // ????????????????????????????????????
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
            // ?????????????????????
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
            // ????????????????????????
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
            // ????????????????????????????????????????????????
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
     * ????????????
     */
    public initGraphEdge() {
        if (!Edge.registry.exist(registerName.normalEdge)) {
            // ?????????
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
        }

        if (!Edge.registry.exist(registerName.lEdge)) {
            // ????????????L??????
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

        if (!Edge.registry.exist(registerName.cRightEdge)) {
            // ??????????????????????????????
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

        if (!Edge.registry.exist(registerName.cLeftEdge)) {
            // ??????????????????????????????
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

        if (!Edge.registry.exist(registerName.cTopEdge)) {
            // ??????????????????????????????
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

        if (!Edge.registry.exist(registerName.cBottomEdge)) {
            // ??????????????????????????????
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

        if (!Edge.registry.exist(registerName.zEdge)) {
            // ????????????Z??????
            Graph.registerEdge(
                registerName.zEdge,
                {
                    inherit: 'edge',
                    router: {
                        name: 'er',
                        args: {
                            offset: 'center'
                        },
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

        if (!Edge.registry.exist(registerName.connectorEdge)) {
            // ?????????????????????????????????
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

    // ??????????????????????????????????????????
    public initBackBtn(canvasId: string) {
        if (!canvasId) return;
        const container = document.getElementById(canvasId)!;
        const backBtn = document.createElement('button');
        backBtn.id = BACK_TO_PREPAGE_BTN_NAME;
        backBtn.textContent = 'back';
        container.appendChild(backBtn);
        const css = `#${canvasId} ${containerCSSConfig}`;
        insertCss(css);
        this.backBtn = backBtn;
    }

    // ?????????config???
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

    // ?????????css???
    public initCSSConfig(canvasId: string) {
        this.cssConfig =
            `
            #${canvasId}-code-graph-container {
                width: 100%;
                height: 100%;
                flex: 1;
            }
            #stencil {
                width: 180px;
                height: 100%;
                position: fixed;
                z-index: 1;
            }
            #graph-container {
                width: 1200px;
                height: 800px;
            }
            #backToPrePage{
                width: 50px;
                height: 25px;
                position: fixed;
                z-index: 1;
                margin: 10px;
            }
        `;
    }
    // #endregion
}