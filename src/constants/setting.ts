const path = require('path');

// es6額外定義
const __dirname = global.__dirname;

// 這個是給build出來的應用程式使用，目前只測試過mac的，是放此應用程式的資料夾位置
// 例 : 如果此應用程式是放在 /Users/sorrows.lee/Desktop/Application.app
// 那就會是 /Users/sorrows.lee/Desktop/
export let applicationDir = path.join(global.__dirname, String('../../../../'));

let ifDevelop = true;

export function isDevelop() {

    return ifDevelop;
}

// 工作目錄
let myWorkDir = isDevelop() ? __dirname : applicationDir;

export let editerDemoConfigPath = path.join(myWorkDir, String('./src/jsonFiles/editerDemoConfig.json'));

// // 大廳流程圖文件目錄
// export let lobbyNodesPath = path.join(myWorkDir, './res/flowData/lobbyNodes.json');
// export let lobbyEdgesPath = path.join(myWorkDir, './res/flowData/lobbyEdges.json');

// // 選房遊戲流程圖文件目錄
// export let hasRoomNodesPath = path.join(myWorkDir, './res/flowData/hasRoomNodes.json');
// export let hasRoomEdgesPath = path.join(myWorkDir, './res/flowData/hasRoomEdges.json');

// // 非選房遊戲流程圖文件目錄
// export let noRoomNodesPath = path.join(myWorkDir, './res/flowData/noRoomNodes.json');
// export let noRoomEdgesPath = path.join(myWorkDir, './res/flowData/noRoomEdges.json');