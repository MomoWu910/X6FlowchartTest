import FlowChartEditer from './src/flowChartEditer';
import FlowChart from './src/x6FlowChart';

const CONTAINER_NAME = 'editer-container';
new FlowChartEditer(CONTAINER_NAME);

import { registerName } from './src/constants/config'

// startDraw();

// setTimeout(() => {
//     const container = document.getElementById('container')!;
//     container.style.display = 'none';
//     startDraw2();
// }, 3000);

function startDraw() {

    let x6fc = new FlowChart('container', { width: 1500, height: 1200, theme: 'dark', isGrid: false });
    // x6fc.setIfNeedAnimate(true);

    let start_x = 0;
    let start_y = 0;
    let increase_x = 400;
    let increase_y = 200;
    let oneLineNum = 5;

    const arr = ['按下確認修改玩家頭像按鈕結果', 'Btn_Base_PersonalNamePopup_ConfirmResult', 'Btn_Base_', 'Btn_Base_PersonalNamePopup', 'Btn'];
    const tipArr = ['', 'a', 'bbb'];
    const tipColorSetsArr = [
        { index: 0, fill: 'green' },
        { index: 1, fill: 'green' },
        { index: 2, fill: 'green' },
        { index: 3, fill: 'red' },
    ]
    const colorSetsArr = [
        { index: 0, fill: 'green' },
        { index: 1, fill: 'green' },
        { index: 2, fill: 'green' },
        { index: 3, fill: 'red' },
    ]
    const colorSets = {
        0: 'green', 1: 'green', 2: 'green', 3: 'green', 4: 'red'
    };
    // 開始繪製node
    let nodeArray: any[] = [];
    for (let i = 0; i < 10; i++) {

        // let event_name = '按下確認修改玩家頭像按鈕結果Btn_Base_PersonalNamePopup';
        // let event_name = arr[i % 4] + i;
        // let event_name = 'Btn_Base_PersonalNamePopup\n_ConfirmResultBtn_Base_PersonalNamePopup_ConfirmResultBtn\n_Base_PersonalNamePopup_ConfirmResult' + i;
        // let event_name = 'Btn_\nBase_P\nersonalNa\nmePopup\n_ConfirmResul\ntBtn_Base_Persona\nlNamePopup_\nConfirmResu\nltBtn\n_Base_Per\nsonalNamePop\nup_ConfirmResult' + i;
        // let event_name = 'Btn_Base_PersonalNamePopup_ConfirmResultBtn_Base_PersonalNamePopup_ConfirmResultBtn_Base_PersonalNamePopup_ConfirmResult' + i;
        // let event_name = '按下確認修改玩家頭像按鈕結果';
        let event_name = 'label\nline2\nline3\nline4';
        let change_label = 'Changed label';

        // 計算出這個node的位置
        let position = getDrawNodePosition(start_x, start_y, increase_x, increase_y, oneLineNum, i);

        let node = x6fc.drawNode(position.x, position.y, registerName.process,
            {
                label: event_name,
                fill: 'white',
                // portLabels: [
                //     { portId: 'top_left', label: '2022/03/18 15:03:55 GMT' },
                //     { portId: 'bottom_right', label: 'not yet', fill: 'red' },
                // ]
            },
            {
                tipContent: 'tip label\nline2',
                // colorSets: { 0: 'red', 1: 'red' },
                // tipColorSets: { 0: 'green', 1: 'green' }
            }
        );
        nodeArray.push(node);

        if (i == 1) {
            x6fc.setNodeLabelColor(node, [
                { index: 0, fill: 'green' },
                { index: 1, fill: 'red' },
                { index: 2, fill: 'yellow' },
            ]);

            x6fc.setNodeClickEvenCallback(node, () => {
                console.log('////test Node Callback')
            })
            // x6fc.setNodeLabel(node, change_label);
            // x6fc.setPortsLabel(node, [
            //     { portId: 'top_left', label: '2022/03/18 15:03:55 GMT' },
            //     { portId: 'bottom_right', label: 'not yet', fill: 'red' },
            // ]);
        }

        // x6fc.flash(node);
    }

    // 將裡面每個node加上箭頭線條
    for (let i = 0; i < nodeArray.length - 1; i++) {

        // let node1 = { cell: nodeArray[i], port: 'right_top' };
        // let node2 = { cell: nodeArray[i + 1], port: 'left_bottom' };
        let node1 = nodeArray[i];
        let node2 = nodeArray[i + 1];

        let direct = (i + 1) % oneLineNum == 0 ? 'v' : 'h';

        // all
        let edge = x6fc.drawEdge(
            node1,
            node2,
            direct,
            registerName.normalEdge,
        );

        // L
        // let edge = x6fc.drawEdge(
        //     { cell: node1, port: 'bottom' },
        //     { cell: node2, port: 'left' },
        //     'l',
        //     registerName.lEdge,
        //     { label: 'Y' }
        // );

        // normal h
        // let edge = x6fc.drawEdge(
        //     { cell: node1, port: 'right' },
        //     { cell: node2, port: 'left' },
        //     'h',
        //     registerName.normalEdge,
        //     { label: 'Y' }
        // );

        // normal v
        // let edge = x6fc.drawEdge(
        //     { cell: node1, port: 'bottom' },
        //     { cell: node2, port: 'top' },
        //     'v',
        //     registerName.normalEdge,
        //     { label: 'Y' }
        // );

        // c
        // let edge = x6fc.drawEdge(
        //     { cell: node1, port: 'right' },
        //     { cell: node2, port: 'right' },
        //     'c',
        //     registerName.cRightEdge,
        //     { label: 'Y' }
        // );

        x6fc.setEdgeClickEvenCallback(edge, () => {
            console.log('/////test Edge Callback');
        });

        // x6fc.flash(edge);
    }

    x6fc.setBackBtnCallback(() => {
        console.log('/////test backBtn Callback');
    });
}

function startDraw2() {

    let x6fc = new FlowChart('container2', { width: 1500, height: 1200, theme: 'dark', isGrid: false });
    // x6fc.setIfNeedAnimate(true);

    let start_x = 0;
    let start_y = 0;
    let increase_x = 400;
    let increase_y = 200;
    let oneLineNum = 1;

    const arr = ['按下確認修改玩家頭像按鈕結果', 'Btn_Base_PersonalNamePopup_ConfirmResult', 'Btn_Base_', 'Btn_Base_PersonalNamePopup', 'Btn'];
    const tipArr = ['', 'a', 'bbb'];
    const tipColorSetsArr = [
        { index: 0, fill: 'green' },
        { index: 1, fill: 'green' },
        { index: 2, fill: 'green' },
        { index: 3, fill: 'red' },
    ]
    const colorSetsArr = [
        { index: 0, fill: 'green' },
        { index: 1, fill: 'green' },
        { index: 2, fill: 'green' },
        { index: 3, fill: 'red' },
    ]
    const colorSets = {
        0: 'green', 1: 'green', 2: 'green', 3: 'green', 4: 'red'
    };
    // 開始繪製node
    let nodeArray: any[] = [];
    for (let i = 0; i < 2; i++) {

        // let event_name = '按下確認修改玩家頭像按鈕結果Btn_Base_PersonalNamePopup';
        // let event_name = arr[i % 4] + i;
        // let event_name = 'Btn_Base_PersonalNamePopup\n_ConfirmResultBtn_Base_PersonalNamePopup_ConfirmResultBtn\n_Base_PersonalNamePopup_ConfirmResult' + i;
        // let event_name = 'Btn_\nBase_P\nersonalNa\nmePopup\n_ConfirmResul\ntBtn_Base_Persona\nlNamePopup_\nConfirmResu\nltBtn\n_Base_Per\nsonalNamePop\nup_ConfirmResult' + i;
        // let event_name = 'Btn_Base_PersonalNamePopup_ConfirmResultBtn_Base_PersonalNamePopup_ConfirmResultBtn_Base_PersonalNamePopup_ConfirmResult' + i;
        // let event_name = '按下確認修改玩家頭像按鈕結果';
        let event_name = 'label\nline2\nline3\nline4';
        let change_label = 'Changed label';

        // 計算出這個node的位置
        let position = getDrawNodePosition(start_x, start_y, increase_x, increase_y, oneLineNum, i);

        let node = x6fc.drawNode(position.x, position.y, registerName.process,
            {
                label: event_name,
                fill: 'white',
                // portLabels: [
                //     { portId: 'top_left', label: '2022/03/18 15:03:55 GMT' },
                //     { portId: 'bottom_right', label: 'not yet', fill: 'red' },
                // ]
            },
            {
                tipContent: 'tip label\nline2',
                // colorSets: { 0: 'red', 1: 'red' },
                // tipColorSets: { 0: 'green', 1: 'green' }
            }
        );
        nodeArray.push(node);

        if (i == 1) {
            x6fc.setNodeLabelColor(node, [
                { index: 0, fill: 'green' },
                { index: 1, fill: 'red' },
                { index: 2, fill: 'yellow' },
            ]);

            x6fc.setNodeClickEvenCallback(node, () => {
                console.log('////test Node Callback')
            })
            // x6fc.setNodeLabel(node, change_label);
            // x6fc.setPortsLabel(node, [
            //     { portId: 'top_left', label: '2022/03/18 15:03:55 GMT' },
            //     { portId: 'bottom_right', label: 'not yet', fill: 'red' },
            // ]);
        }

        // x6fc.flash(node);
    }

    // 將裡面每個node加上箭頭線條
    for (let i = 0; i < nodeArray.length - 1; i++) {

        // let node1 = { cell: nodeArray[i], port: 'right_top' };
        // let node2 = { cell: nodeArray[i + 1], port: 'left_bottom' };
        let node1 = nodeArray[i];
        let node2 = nodeArray[i + 1];

        let direct = (i + 1) % oneLineNum == 0 ? 'v' : 'h';

        // L
        // let edge = x6fc.drawEdge(
        //     { cell: node1, port: 'bottom' },
        //     { cell: node2, port: 'left' },
        //     'l',
        //     registerName.lEdge,
        //     { label: 'Y' }
        // );

        // normal h
        // let edge = x6fc.drawEdge(
        //     { cell: node1, port: 'right' },
        //     { cell: node2, port: 'left' },
        //     'h',
        //     registerName.normalEdge,
        //     { label: 'Y' }
        // );

        // normal v
        // let edge = x6fc.drawEdge(
        //     { cell: node1, port: 'bottom' },
        //     { cell: node2, port: 'top' },
        //     'v',
        //     registerName.normalEdge,
        //     { label: 'Y' }
        // );

        // c
        let edge = x6fc.drawEdge(
            { cell: node1, port: 'right' },
            { cell: node2, port: 'right' },
            'c',
            registerName.cRightEdge,
            { label: 'Y' }
        );

        x6fc.setEdgeClickEvenCallback(edge, () => {
            console.log('/////test Edge Callback');
        });

        // x6fc.flash(edge);
    }

    x6fc.setBackBtnCallback(() => {
        console.log('/////test backBtn Callback');
    });
}

function getDrawNodePosition(start_x, start_y, diff_x, diff_y, maxRow, index) {

    let position = { x: 0, y: 0 };

    if (maxRow == 0)
        return position;

    // 先知道這個index是在第幾列
    let column = Math.floor(index / maxRow);

    // 算出這個index是第幾行
    let row = Math.floor(index % maxRow);

    // 如果是奇數列，要倒著算回來
    if (Math.floor(column % 2) != 0) {

        row = maxRow - row - 1;
    }

    //  行列都有了，可以算出位置了
    // 斜向
    // position.x = start_x + index * 1.5 * diff_x;
    // position.y = start_y + index * 1.5 * diff_y;

    // normal
    position.x = start_x + row * diff_x;
    position.y = start_y + column * diff_y;

    return position;
}
