# 流程圖工具使用教學

先附上使用的X6套件的官方 [Document](https://x6.antv.vision/zh/docs/tutorial/about)

## 使用混淆化的程式碼

使用上必須是經過混淆化的程式碼，並且每次程式碼有更新(後續會加上版號)也需要再混淆化一次再使用，npm install 過後，執行

```javascript
    npm run rollup
```

## 導入H5FC

混淆化後會在 dist/ 拿到一個 **rollupBundle.umd.js** 檔案，在 index.html 中直接導入即可

```javascript
    <script src="./rollupBundle.umd.js"></script>
```

然後直接 new 它即可，例如:

```javascript
    /**
     * @param canvasId (string) 用於套入canvas的<div>的id
     * @param option (obj)(optional) 可調整參數
     * {
     *      @param width (number) 畫布寬，默認容器寬
     *      @param height (number) 畫布高，默認容器高
     *      @param theme (string) 主題，默認 'dark'暗色主題，可以代入 'light'改為亮色主題
     *      @param isGrid (boolean) 是否需要格線，預設開啟
     * }
     */
    let fc = new H5FC.FlowChart('container', { width: 1200, height: 800, theme: 'dark', isGrid: false });
```

## 畫流程圖相關功能
### 建立節點

**drawNode()** function 可以建立一個節點並回傳該節點  
* _shape_ 決定了節點的外觀，目前有建立幾個樣式在 H5FC.registerName 中，之後考慮開放自定義節點接口
* _attr_ 為節點文本、port文本相關參數
* _data_ 為自定義內容參數，未來擴充節點資料也盡量存在這裡面
* 雖然節點會自動根據attr給入的文本長度改變大小，但還是建議自己加入'\n'來換行
* colorSets 格式 { index: fill } 中的index是對應文本行數，從0開始

```javascript
    /**
     * 
     * @param posX 座標x
     * @param posY 座標y
     * @param shape 形狀, 預設圓角矩形, 對應 H5FC.registerName 內容
     * 
     * @param attr (obj, optional) 文本相關參數(不包含tip)
     * {
     *      @param label (string)(optional) 文字, 需注意換行要加"\n"
     *      @param fill (string)(optional) 節點整段文字顏色，會被 data.colorSets 蓋掉
     *      @param fontSize (number)(optional) 文字大小，最小12，預設也是12
     *      @param portLabels (array<object>)(optional) 周圍port的文字
     *      [
     *          {
     *              @param portId (string) 要顯示在哪個port，有12個，ex.'left'左中, 'left_top'左上, 'right_bottom'右下，依此類推
     *              @param label (string) port上文字
     *          }
     *      ]
     * },  
     * 
     * @param data (obj, optional) X6 相關參數之外的自定義參數
     * {
     *      @param seat (string)(optional) 如果是用 config 方式來繪製流程圖，則用來與 config 座標對應，平常就不用帶
     *      @param name (string)(optional) 節點名稱
     *      @param size (obj)(optional) 如果要調整該節點大小，傳入 { w: xx, h: xx } 的格式 
     *      @param changeToFlowChart (string)(optional) 此節點會轉換去哪個流程圖，需注意節點 shape 類型要為 H5FC.registerName.changeToOtherFlowChart
     *      @param tipContent (string) 滑鼠hover時的tip要顯示的文字
     *      @param colorSets (obj)(optional) 節點的文本分行顏色設定，格式為 { index: fill }，要注意這邊的設定會蓋掉 attr.fill 的設定
     *      @param tipColorSets (obj)(optional) 節點tip的文本分行顏色設定，格式為 { index: fill }
     * }
     */
    drawNode(posX: number = 0, posY: number = 0, shape: string = H5FC.registerName.process, attr: any = {}, data: any = {})
    
```
```javascript
    // 範例
    let node = fc.drawNode(x, y, H5FC.registerName.process,
        {
            label: 'test\nlabel\nline2',
            fill: 'blue',
            portLabels: [
                { portId: 'top_left', label: '2022/03/18 15:03:55 GMT' },
                { portId: 'bottom_right', label: 'not yet', fill: 'red' },
            ]
        },
        {
            tipContent: 'tip label\nline2',
            colorSets: { 0: 'red', 1: 'red' },
            tipColorSets: { 0: 'green', 1: 'green' }
        }
    );
```

上面範例呈現的效果如下圖(黑色的節點是滑鼠hover時出現的tip)  
![](../res/mdAssets/drawNode_example.png)


### 建立邊

**drawEdge()** function 可以建立邊並回傳該邊
* _source_ 跟 _target_ 為起點跟終點，可以傳入三種格式
  * **{ x, y }** 基本的座標物件
  * **Node節點物件** drawNode()回傳的那個
  * **{ cell, port }** 有帶入指定的port的物件
* _shape_ 決定了邊的樣式，目前有建立兩個樣式在 H5FC.registerName 中，直線normalEdge 及轉角型lEdge
* _data_ 如果邊上想要有文字就帶入 label 中

```javascript
    /**
     * 
     * @param source 從哪個座標 { x, y } 或節點 { cell } 或指定節點的連接點 { cell, port }
     * @param target 到哪個座標 { x, y } 或節點 { cell } 或指定節點的連接點 { cell, port }
     * @param direction 方向，水平H 或 垂直V 或 L型(需要給 port 參數)
     * @param shape (string)(optional) 哪種類型的邊，預設白色直線單箭頭
     * 
     * @param data (obj)(optional) 自定義參數
     * {
     *      @param label (string)(optional) 邊上顯示文字，通常是“是”、“否”
     *      @param sourceSeat (string)(optional) 起點座標，如果是用 config 方式來繪製流程圖，則用來與 config 座標對應，平常就不用帶
     *      @param targetSeat (string)(optional) 終點座標，如果是用 config 方式來繪製流程圖，則用來與 config 座標對應，平常就不用帶
     * }
     */
    drawEdge(source: any = { x: 0, y: 0 }, target: any = { x: 0, y: 0 }, direction: string = 'v', shape: string = H5FC.registerName.normalEdge, data: any = {})
```
```javascript
    // 範例
    let node1 = nodeArray[i];
    let node2 = nodeArray[i + 1];

    let edge = fc.drawEdge(node1, node2, 'h', H5FC.registerName.normalEdge, { label: 'Y' });
```

上面範例呈現的效果如下圖  
![](../res/mdAssets/drawEdge_example1.png)

```javascript
    // 範例
    let node1 = { cell: nodeArray[i], port: 'right_top' };
    let node2 = { cell: nodeArray[i + 1], port: 'left_bottom' };

    let edge = fc.drawEdge(node1, node2, 'h', registerName.normalEdge, { label: 'Y' });
```

上面範例呈現的效果如下圖  
![](../res/mdAssets/drawEdge_example2.png)



###