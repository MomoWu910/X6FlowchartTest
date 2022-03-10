import { Chart } from '@antv/g2';

const otherRatio = 6.67 / 100; // Other 的占比
const otherOffsetAngle = otherRatio * Math.PI; // other 占的角度的一半
const data = [
    { type: '微博', value: 93.33 },
    { type: '其他', value: 6.67 },
];
const other = [
    { type: '论坛', value: 1.77 },
    { type: '网站', value: 1.44 },
    { type: '微信', value: 1.12 },
    { type: '客户端', value: 1.05 },
    { type: '新闻', value: 0.81 },
    { type: '视频', value: 0.39 },
    { type: '博客', value: 0.37 },
    { type: '报刊', value: 0.17 },
];

export default class ChartTest {
    public chart: any;
    public view1: any;
    public view2: any;

    constructor() {

        this.initChart();
        this.initView();

        this.chart.render();
        this.drawLinkArea();
        this.chart.on('afterpaint', () => {
            this.drawLinkArea();
        });
    }

    public initChart() {
        this.chart = new Chart({
            container: 'container',
            autoFit: true,
        });
        this.chart.legend(false);
        this.chart.tooltip({
            showMarkers: false,
        });
    }

    public initView() {
        this.view1 = this.chart.createView({
            region: {
                start: {
                    x: 0,
                    y: 0,
                },
                end: {
                    x: 0.5,
                    y: 1,
                },
            },
        });
        this.view1.coordinate('theta', {
            radius: 0.7,
            startAngle: 0 + otherOffsetAngle,
            endAngle: Math.PI * 2 + otherOffsetAngle,
        });
        this.view1.data(data);
        this.view1.interaction('element-highlight');
        this.view1
            .interval()
            .adjust('stack')
            .position('value')
            .color('type', ['#38c060', '#2593fc'])
            .label('value', function () {
                return {
                    offset: -10,
                    content: (obj) => {
                        return obj.type + '\n' + obj.value + '%';
                    },
                };
            });

        this.view2 = this.chart.createView({
            region: {
                start: {
                    x: 0.5,
                    y: 0.1,
                },
                end: {
                    x: 1,
                    y: 0.9,
                },
            },
        });
        this.view2.axis(false);
        this.view2.data(other);
        this.view2.interaction('element-highlight');
        this.view2
            .interval()
            .adjust('stack')
            .position('value')
            .color('type', ['#063d8a', '#0b53b0', '#1770d6', '#2593fc', '#47abfc', '#6dc1fc', '#94d6fd', '#bbe7fe'])
            .label('value', {
                position: 'right',
                offsetX: 5,
                offsetY: 10,
                content: (obj) => {
                    return obj.type + ' ' + obj.value + '%';
                },
            });
    }
    /* ---------绘制连接区间-----------*/
    public drawLinkArea() {
        const canvas = this.chart.getCanvas();
        const container = this.chart.backgroundGroup;
        const view1_coord = this.view1.getCoordinate();
        const center = view1_coord.getCenter();
        const radius = view1_coord.getRadius();
        const interval_geom = this.view2.geometries[0];
        const interval_container = interval_geom.container;
        const interval_bbox = interval_container.getBBox();
        const view2_coord = this.view2.getCoordinate();
        // area points
        const pie_start1 = {
            x: center.x + Math.cos(Math.PI * 2 - otherOffsetAngle) * radius,
            y: center.y + Math.sin(Math.PI * 2 - otherOffsetAngle) * radius,
        };
        const pie_start2 = {
            x: center.x + Math.cos(otherOffsetAngle) * radius,
            y: center.y + Math.sin(otherOffsetAngle) * radius,
        };
        const interval_end1 = {
            x: interval_bbox.minX,
            y: view2_coord.end.y,
        };
        const interval_end2 = {
            x: interval_bbox.minX,
            y: view2_coord.start.y,
        };
        const path = [
            ['M', pie_start1.x, pie_start1.y],
            ['L', pie_start2.x, pie_start2.y],
            ['L', interval_end2.x, interval_end2.y],
            ['L', interval_end1.x, interval_end1.y],
            ['Z'],
        ];
        container.addShape('path', {
            attrs: {
                path,
                fill: '#e9f4fe',
            },
        });
        canvas.draw();
    }

}