// import Demo from './src/demo';
import ChartTest from './src/chartTest';
import FlowChart from './src/x6FlowChart';

// new Demo();
// new CodeControl();
new ChartTest();

// ex
let x6fc = new FlowChart('container', { width: 1500, height: 1200, theme: 'dark', isGrid: false });
// let x6fc = new FlowChart('container');

// x6fc.setIfNeedAnimate(true);


import { registerName } from './src/constants/config'
let start_x = 0;
let start_y = 0;
let increase_x = 400;
let increase_y = 200;
let oneLineNum = 3;

const arr = ['Btn_Base_PersonalNamePopup_ConfirmResult', 'Btn_Base_', 'Btn_Base_PersonalNamePopup', 'Btn'];
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

    // let event_name = arr[i % 4] + i;
    // let event_name = 'Btn_Base_PersonalNamePopup\n_ConfirmResultBtn_Base_PersonalNamePopup_ConfirmResultBtn\n_Base_PersonalNamePopup_ConfirmResult' + i;
    let event_name = 'Btn_\nBase_P\nersonalNa\nmePopup\n_ConfirmResul\ntBtn_Base_Persona\nlNamePopup_\nConfirmResu\nltBtn\n_Base_Per\nsonalNamePop\nup_ConfirmResult' + i;
    // let event_name = 'Btn_Base_PersonalNamePopup_ConfirmResultBtn_Base_PersonalNamePopup_ConfirmResultBtn_Base_PersonalNamePopup_ConfirmResult' + i;


    // 計算出這個node的位置
    let position = getDrawNodePosition(start_x, start_y, increase_x, increase_y, oneLineNum, i);

    let node = x6fc.drawNode(position.x, position.y, registerName.process,
        {
            label: event_name,
            fill: 'blue',
            portLabels: [
                { portId: 'top_left', label: '2022/03/18 15:03:55 GMT' },
                { portId: 'bottom_right', label: 'not yet', fill: 'red' },
            ]
        },
        {
            tipContent: event_name,
            colorSets: colorSets,
            tipColorSets: colorSets
        }
    );
    nodeArray.push(node);

}

// 將裡面每個node加上箭頭線條
for (let i = 0; i < nodeArray.length - 1; i++) {

    let node1 = nodeArray[i];
    let node2 = nodeArray[i + 1];

    let direct = (i + 1) % oneLineNum == 0 ? 'v' : 'h';
    x6fc.drawEdge(node1, node2, direct);
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
    position.x = start_x + row * diff_x;
    position.y = start_y + column * diff_y;

    return position;
}
