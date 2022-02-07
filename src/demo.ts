import { Graph, Shape, Addon } from '@antv/x6';
import { insertCss } from 'insert-css';

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

    insertCss(`
        #container {
            display: flex;
            border: 1px solid #dfe3e8;
        }
        #stencil {
            width: 180px;
            height: 100%;
            position: relative;
            border-right: 1px solid #dfe3e8;
        }
        #graph-container {
            width: calc(100% - 180px);
            height: 100%;
        }
        .x6-widget-stencil  {
            background-color: #666;
        }
        .x6-widget-stencil-title {
            color: #fff;
            background-color: #555;
        }
        .x6-widget-stencil-title:hover {
            color: #eee;
        }
        .x6-widget-stencil-group-title {
            color: #fff !important;
            background-color: #555 !important;
        }
        .x6-widget-stencil-group-title:hover {
            color: #eee !important;
        }
        .x6-widget-transform {
            margin: -1px 0 0 -1px;
            padding: 0px;
            border: 1px solid #239edd;
        }
        .x6-widget-transform > div {
            border: 1px solid #239edd;
        }
        .x6-widget-transform > div:hover {
            background-color: #3dafe4;
        }
        .x6-widget-transform-active-handle {
            background-color: #3dafe4;
        }
        .x6-widget-transform-resize {
            border-radius: 0;
        }
        .x6-widget-selection-inner {
            border: 1px solid #239edd;
        }
        .x6-widget-selection-box {
            opacity: 0;
        }
    `);
}

export default class Demo {
    public graph: any;
    public stencil: any;

    constructor() {
        preWork();
        this.initGraph();
        this.initStencil();
        this.initEvent();
        this.initGraphNode();
        this.initStencilBasicNode();
        this.initStencilSpecialNode();
    }

    // #region 初始化画布
    public initGraph() {
        const graph = new Graph({
            container: document.getElementById('graph-container')!,
            grid: true,
            background: { color: '#222' },
            mousewheel: {
                enabled: true,
                zoomAtMousePosition: true,
                modifiers: 'ctrl',
                minScale: 0.5,
                maxScale: 3,
            },
            connecting: {
                router: {
                    name: 'manhattan',
                    args: {
                        padding: 1,
                    },
                },
                connector: {
                    name: 'rounded',
                    args: {
                        radius: 8,
                    },
                },
                anchor: 'center',
                connectionPoint: 'anchor',
                allowBlank: false,
                snap: {
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
                    })
                },
                validateConnection({ targetMagnet }) {
                    return !!targetMagnet
                },
            },
            highlighting: {
                magnetAdsorbed: {
                    name: 'stroke',
                    args: {
                        attrs: {
                            fill: '#5F95FF',
                            stroke: '#5F95FF',
                        },
                    },
                },
            },
            resizing: true,
            rotating: true,
            selecting: {
                enabled: true,
                rubberband: true,
                showNodeSelectionBox: true,
            },
            snapline: true,
            keyboard: true,
            clipboard: true,
            history: true,// 這行要加，才能undo redo
        })

        this.graph = graph;
    }
    // #endregion

    // #region 初始化 stencil
    public initStencil() {
        const stencil = new Addon.Stencil({
            title: '流程图',
            target: this.graph,
            stencilGraphWidth: 200,
            stencilGraphHeight: 180,
            collapsable: true,
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
            layoutOptions: {
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
                ports: {
                    ...ports,
                    items: [
                        {
                            group: 'top',
                        },
                        {
                            group: 'bottom',
                        },
                    ],
                },
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
        const r5 = this.graph.createNode({
            shape: 'custom-polygon',
            attrs: {
                body: {
                    refPoints: '10,0 40,0 30,20 0,20',
                },
            },
            label: '数据',
        })
        const r6 = this.graph.createNode({
            shape: 'custom-circle',
            label: '连接',
        })
        this.stencil.load([r1, r2, r3, r4, r5, r6], 'group1');
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
