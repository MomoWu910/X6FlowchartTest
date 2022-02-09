import { Graph, Shape, Addon } from '@antv/x6';
import { insertCss } from 'insert-css';
import { cssConfig } from './constants/config';

/* html css 相關樣式建立
*   stencilContainer: 左側面板
*   graphContainer: 右側畫板
*/
const preWork = () => {
    // 这里协助演示的代码，在实际项目中根据实际情况进行调整
    const container = document.getElementById('container')!;
    const stencilContainer = document.createElement('div');
    stencilContainer.id = 'stencil';
    const graphContainer = document.createElement('div');
    graphContainer.id = 'graph-container';
    container.appendChild(stencilContainer);
    container.appendChild(graphContainer);

    insertCss(cssConfig);
}

export default class Demo {
    public graph: any;
    public stencil: any;

    constructor() {
        preWork();                          // 設定css樣式
        this.initGraph();                   // 初始化畫布
        this.initStencil();                 // 初始化左側面板
        this.initEvent();                   // 初始化鍵盤、滑鼠事件
        this.initGraphNode();               // 初始化各種節點設定
        this.initStencilBasicNode();        // 建立面板上基礎流程圖節點
        this.initStencilSpecialNode();      // 建立面板上系統設計圖節點
    }

    // #region 初始化画布
    public initGraph() {
        const graph = new Graph({
            container: document.getElementById('graph-container')!, // 画布的容器
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
                minScale: 0.5,
                maxScale: 3,
            },
            connecting: {                                           // 连线规则
                router: {                                           // 路由将边的路径点 vertices 做进一步转换处理，并在必要时添加额外的点
                    name: 'manhattan',                              // 智能正交路由，由水平或垂直的正交线段组成，并自动避开路径上的其他节点
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
                        attrs: {
                            line: {
                                stroke: '#A2B1C3',
                                strokeWidth: 2,
                                targetMarker: {
                                    name: 'block',
                                    width: 12,
                                    height: 8,
                                },
                            },
                        },
                        zIndex: 0,
                        tools: {
                            name: 'segments',
                            args: {
                                snapRadius: 20,
                                attrs: {
                                    fill: '#444',
                                },
                            },
                        },
                    })
                },
                validateConnection({ targetMagnet }) {              // 在移动边的时候判断连接是否有效，如果返回 false，当鼠标放开的时候，不会连接到当前元素，否则会连接到当前元素。
                    return !!targetMagnet
                },
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
            history: true,                                          // 撤销/重做
        });

        this.graph = graph;
    }
    // #endregion

    // #region 初始化 stencil
    public initStencil() {
        const stencil = new Addon.Stencil({
            title: '流程图',
            target: this.graph,                                     // 目标画布
            stencilGraphWidth: 200,
            stencilGraphHeight: 180,
            collapsable: true,                                      // 是否显示全局折叠/展开按钮
            groups: [
                {
                    title: '基础流程图',
                    name: 'group1',
                },
                {
                    title: '系统设计图',
                    name: 'group2',
                    graphHeight: 250,
                    layoutOptions: {
                        rowHeight: 70,
                    },
                },
            ],
            layoutOptions: {                                        // 布局选项
                columns: 2,
                columnWidth: 80,
                rowHeight: 55,
            },
        })
        document.getElementById('stencil')!.appendChild(stencil.container);
        this.stencil = stencil;
    }
    // #endregion

    // #region 快捷键与事件
    public initEvent() {
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

        // 控制连接桩显示/隐藏
        const showPorts = (ports: NodeListOf<SVGElement>, show: boolean) => {
            for (let i = 0, len = ports.length; i < len; i = i + 1) {
                ports[i].style.visibility = show ? 'visible' : 'hidden'
            }
        }
        this.graph.on('node:mouseenter', () => {
            const container = document.getElementById('graph-container')!
            const ports = container.querySelectorAll(
                '.x6-port-body',
            ) as NodeListOf<SVGElement>
            showPorts(ports, true)
        })
        this.graph.on('node:mouseleave', () => {
            const container = document.getElementById('graph-container')!
            const ports = container.querySelectorAll(
                '.x6-port-body',
            ) as NodeListOf<SVGElement>
            showPorts(ports, false)
        })

        this.graph.on('cell:dblclick', ({ cell, e }) => {
            const isNode = cell.isNode()
            const name = cell.isNode() ? 'node-editor' : 'edge-editor'
            cell.removeTool(name)
            cell.addTools({
                name,
                args: {
                    event: e,
                    attrs: {
                        backgroundColor: isNode ? '#EFF4FF' : '#FFF',
                    },
                },
            })
        })
    }
    // #endregion

    // #region 初始化图形
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
                    group: 'top',
                },
                {
                    group: 'right',
                },
                {
                    group: 'bottom',
                },
                {
                    group: 'left',
                },
            ],
        }

        Graph.registerNode(
            'custom-rect',
            {
                inherit: 'rect',
                width: 66,
                height: 36,
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
        )

        Graph.registerNode(
            'custom-polygon',
            {
                inherit: 'polygon',
                width: 66,
                height: 36,
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
        )

        Graph.registerNode(
            'custom-circle',
            {
                inherit: 'circle',
                width: 45,
                height: 45,
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
        )

        Graph.registerNode(
            'custom-image',
            {
                inherit: 'rect',
                width: 52,
                height: 52,
                markup: [
                    {
                        tagName: 'rect',
                        selector: 'body',
                    },
                    {
                        tagName: 'image',
                    },
                    {
                        tagName: 'text',
                        selector: 'label',
                    },
                ],
                attrs: {
                    body: {
                        stroke: '#5F95FF',
                        fill: '#5F95FF',
                    },
                    image: {
                        width: 26,
                        height: 26,
                        refX: 13,
                        refY: 16,
                    },
                    label: {
                        refX: 3,
                        refY: 2,
                        textAnchor: 'left',
                        textVerticalAnchor: 'top',
                        fontSize: 12,
                        fill: '#fff',
                    },
                },
                ports: { ...ports },
            },
            true,
        )
    }
    // #endregion

    // #region 基礎流程圖節點
    public initStencilBasicNode() {
        const r1 = this.graph.createNode({
            shape: 'custom-rect',
            label: '开始',
            attrs: {
                body: {
                    rx: 20,
                    ry: 26,
                },
            },
        })
        const r2 = this.graph.createNode({
            shape: 'custom-rect',
            label: '过程',
        })
        const r3 = this.graph.createNode({
            shape: 'custom-rect',
            attrs: {
                body: {
                    rx: 6,
                    ry: 6,
                },
            },
            label: '可选过程',
        })
        const r4 = this.graph.createNode({
            shape: 'custom-polygon',
            attrs: {
                body: {
                    refPoints: '0,10 10,0 20,10 10,20',
                },
            },
            label: '决策',
        })
        // const r5 = this.graph.createNode({
        //     shape: 'custom-polygon',
        //     attrs: {
        //         body: {
        //             refPoints: '10,0 40,0 30,20 0,20',
        //         },
        //     },
        //     label: '数据',
        // })
        const r6 = this.graph.createNode({
            shape: 'custom-circle',
            label: '连接',
        })
        this.stencil.load([r1, r2, r3, r4, r6], 'group1');
    }
    // #endregion

    // #region 系統設計圖節點
    public initStencilSpecialNode() {
        const imageShapes = [
            {
                label: 'Client',
                image:
                    'https://gw.alipayobjects.com/zos/bmw-prod/687b6cb9-4b97-42a6-96d0-34b3099133ac.svg',
            },
            {
                label: 'Http',
                image:
                    'https://gw.alipayobjects.com/zos/bmw-prod/dc1ced06-417d-466f-927b-b4a4d3265791.svg',
            },
            {
                label: 'Api',
                image:
                    'https://gw.alipayobjects.com/zos/bmw-prod/c55d7ae1-8d20-4585-bd8f-ca23653a4489.svg',
            },
            {
                label: 'Sql',
                image:
                    'https://gw.alipayobjects.com/zos/bmw-prod/6eb71764-18ed-4149-b868-53ad1542c405.svg',
            },
            {
                label: 'Clound',
                image:
                    'https://gw.alipayobjects.com/zos/bmw-prod/c36fe7cb-dc24-4854-aeb5-88d8dc36d52e.svg',
            },
            {
                label: 'Mq',
                image:
                    'https://gw.alipayobjects.com/zos/bmw-prod/2010ac9f-40e7-49d4-8c4a-4fcf2f83033b.svg',
            },
        ]
        const imageNodes = imageShapes.map((item) =>
            this.graph.createNode({
                shape: 'custom-image',
                label: item.label,
                attrs: {
                    image: {
                        'xlink:href': item.image,
                    },
                },
            }),
        )
        this.stencil.load(imageNodes, 'group2');
    }
    // #endregion

}
