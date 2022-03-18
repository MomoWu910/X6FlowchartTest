import { Chart } from '@antv/g2';

const SHOW_CHART_BTN_NAME = 'showChart';

const otherRatio = 6.67 / 100; // Other 的占比
const otherOffsetAngle = otherRatio * Math.PI; // other 占的角度的一半
const data = [
    { type: '成功', value: 93.33 },
    { type: '失敗', value: 6.67 },
];
const other = [
    { type: 'google chrome', value: 1.77 },
    { type: 'ios safari', value: 1.44 },
    { type: 'browser1', value: 1.12 },
    { type: 'browser2', value: 1.05 },
    { type: 'browser3', value: 0.81 },
    { type: 'browser4', value: 0.39 },
    { type: 'browser5', value: 0.37 },
    { type: 'browser6', value: 0.17 },
];

export default class ChartTest {
    public chart: any;
    public view1: any;
    public view2: any;

    constructor() {

        this.initChart();
        this.initView();
        this.initEvent();

        this.chart.render();
        // this.drawLinkArea();
        this.chart.on('afterpaint', () => {
            // this.drawLinkArea();
        });
        this.chart.forceFit();
        this.showChart();
    }

    // region 功能相關
    public showChart() {
        if (this.chart.visible) {
            this.chart.changeVisible(false);
            this.chart.clear();

            let chartContainer = document.getElementById('chartContainer');
            if (chartContainer) chartContainer.style.visibility = "hidden";
        } else {

            // 好像要清掉重畫才能有文字，待觀察
            this.initChart();
            this.initView();
            this.chart.changeVisible(true);

            this.chart.render();
            // this.drawLinkArea();

            let chartContainer = document.getElementById('chartContainer');
            if (chartContainer) chartContainer.style.visibility = "visible";
        }

    }
    // endregion

    // region 初始化相關
    public initChart() {
        this.chart = new Chart({
            container: 'chartContainer',
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
                    y: 0,
                },
                end: {
                    x: 1,
                    y: 1,
                },
            },
        });
        this.view2.coordinate('theta', {
            radius: 0.7,
            startAngle: 0 + otherOffsetAngle,
            endAngle: Math.PI * 2 + otherOffsetAngle,
        });
        this.view2.data(other);
        this.view2.interaction('element-highlight');
        this.view2
            .interval()
            .adjust('stack')
            .position('value')
            .color('type', ['#063d8a', '#0b53b0', '#1770d6', '#2593fc', '#47abfc', '#6dc1fc', '#94d6fd', '#bbe7fe'])
            .label('value', function () {
                return {
                    offset: -10,
                    content: (obj) => {
                        return obj.type + '\n' + obj.value + '%';
                    },
                };
            });

        // this.view2 = this.chart.createView({
        //     region: {
        //         start: {
        //             x: 0.5,
        //             y: 0.1,
        //         },
        //         end: {
        //             x: 1,
        //             y: 0.9,
        //         },
        //     },
        // });
        // this.view2.axis(false);
        // this.view2.data(other);
        // this.view2.interaction('element-highlight');
        // this.view2
        //     .interval()
        //     .adjust('stack')
        //     .position('value')
        //     .color('type', ['#063d8a', '#0b53b0', '#1770d6', '#2593fc', '#47abfc', '#6dc1fc', '#94d6fd', '#bbe7fe'])
        //     .label('value', {
        //         position: 'right',
        //         offsetX: 5,
        //         offsetY: 10,
        //         content: (obj) => {
        //             return obj.type + ' ' + obj.value + '%';
        //         },
        //     });
    }

    public initEvent() {
        let showChartBtn = document.getElementById(SHOW_CHART_BTN_NAME);
        if (showChartBtn) showChartBtn.addEventListener('click', () => { this.showChart(); });
    }
    // endregion

    // region 繪圖相關
    /* ---------绘制连接区间-----------*/
    public drawLinkArea() {
        const canvas = this.chart.getCanvas();
        const container = this.chart.backgroundGroup;
        const view1_coord = this.view1.getCoordinate();
        const center = view1_coord.getCenter();
        const radius = view1_coord.getRadius();


        // const view2_coord = this.view2.getCoordinate();
        // const center2 = view2_coord.getCenter();
        // const radius2 = view2_coord.getRadius();

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
            x: (view2_coord.end.x + view2_coord.start.x) / 2,
            y: view2_coord.end.y,
        };
        const interval_end2 = {
            x: (view2_coord.end.x + view2_coord.start.x) / 2,
            y: view2_coord.start.y,
        };
        // const interval_end1 = {
        //     x: interval_bbox.minX,
        //     y: view2_coord.end.y,
        // };
        // const interval_end2 = {
        //     x: interval_bbox.minX,
        //     y: view2_coord.start.y,
        // };
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
    //endregion

}