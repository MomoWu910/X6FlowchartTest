import { Graph } from '@antv/x6';
// 使用 CDN 引入时暴露了 X6 全局变量
// const { Graph } = X6

const data = {
    // 节点
    nodes: [
        {
            id: 'node1', // String，可选，节点的唯一标识
            shape: 'rect', // 使用 rect 渲染
            x: 40,       // Number，必选，节点位置的 x 值
            y: 40,       // Number，必选，节点位置的 y 值
            width: 80,   // Number，可选，节点大小的 width 值
            height: 40,  // Number，可选，节点大小的 height 值
            label: 'hello', // String，节点标签
        },
        {
            id: 'node2', // String，节点的唯一标识
            shape: 'ellipse', // 使用 ellipse 渲染
            x: 160,      // Number，必选，节点位置的 x 值
            y: 180,      // Number，必选，节点位置的 y 值
            width: 80,   // Number，可选，节点大小的 width 值
            height: 40,  // Number，可选，节点大小的 height 值
            label: 'world', // String，节点标签
        },
    ],
    // 边
    edges: [
        {
            source: 'node1', // String，必须，起始节点 id
            target: 'node2', // String，必须，目标节点 id
            shape: 'double-edge',
        },
    ],
};

const svgData = {
    nodes: [
        {
            id: 'node1',
            x: 40,
            y: 40,
            width: 100,
            height: 40,
            attrs: {
                body: {
                    fill: '#2ECC71',
                    stroke: '#000',
                    strokeDasharray: '10,2',
                },
                label: {
                    text: 'Hello',
                    fill: '#333',
                    fontSize: 13,
                }
            }
        },
        {
            id: 'node2',
            x: 180,
            y: 240,
            width: 100,
            height: 40,
            attrs: {
                body: {
                    fill: '#F39C12',
                    stroke: '#000',
                    rx: 16,
                    ry: 16,
                },
                label: {
                    text: 'World',
                    fill: '#333',
                    fontSize: 18,
                    fontWeight: 'bold',
                    fontVariant: 'small-caps',
                },
            },
        },
    ],
    edges: [
        {
            source: 'node1',
            target: 'node2',
            attrs: {
                line: {
                    stroke: 'orange',
                },
            },
        },
    ],
};

const graph = new Graph({
    container: document.getElementById('container') as HTMLElement,
    width: 800,
    height: 600,
    background: {
        color: '#fffbe6', // 设置画布背景颜色
    },
    grid: {
        size: 10,      // 网格大小 10px
        visible: true, // 渲染网格背景
    },
});

// 创建画布后，可以调用 graph.zoom(factor: number) 和 graph.translate(tx: number, ty: number) 来缩放和平移画布。
graph.zoom(-0.5);
graph.translate(80, 40);

graph.fromJSON(data);
// graph.fromJSON(svgData);