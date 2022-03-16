import typescript from 'rollup-plugin-typescript2';
import json from 'rollup-plugin-json';
import image from 'rollup-plugin-image';
import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import size from 'rollup-plugin-filesize';
import { uglify } from 'rollup-plugin-uglify';
// import nodePolyfills from 'rollup-plugin-polyfill-node';
import injectProcessEnv from 'rollup-plugin-inject-process-env';

// amd – 异步模块定义，使用RequireJS載入模組化指令碼將提高程式碼的載入速度和質量它針對瀏覽器使用場景進行了優化
// cjs – CommonJS，主要用於後端，在nodejs中，node應用是由模組組成
// es – es6原生支援的 将软件包保存为ES模块文件
// iife – 一个自动立即(執行)的功能，
// umd – 通用模块定义，以amd，cjs 和 iife 为一体


const config = {
    input: 'indexForRollup.ts', // 打包檔案的入口文件
    output: [ // 整個output是以 Array<Object>的形式存在，可以一次輸出多種檔案
        // {
        //     file: 'dist/rollupBundle.amd.js', // 檔案輸出的路徑
        //     format: 'amd', // 檔案輸出的格式包含cjs,iife,umd...等等
        //     name : 'amdBundle', // 套件的名稱 ex: 取Base的話，使用時就Base.method就可以呼叫了
        // },
        // {
        //     file: 'dist/rollupBundle.cjs.js',
        //     format: 'cjs',
        //     name : 'cjsBundle',
        // },
        // {
        //     file: 'dist/rollupBundle.es.js',
        //     format: 'es',
        //     name : 'esBundle',
        // },

        // {
        //     file: 'dist/rollupBundle.iife.js',
        //     format: 'iife',
        //     name : 'iifeBundle',
        // },
        {
            file: 'dist/rollupBundle.umd.js',
            format: 'umd',
            name: 'H5FC',
        }
    ],
    // plugins 看個人需求決定使用與否
    plugins: [
        typescript(), //處理typescript
        json(), // 讀取json用
        image(), // 讀取img用
        commonjs({}), // 支援commonjs用
        resolve(), // 支援相對路徑用
        size(), // 打包順便縮小size
        uglify(), // 進行混淆
        // nodePolyfills(), // 如果要在瀏覽器上執行一些node的module，會需要安裝他
        injectProcessEnv({ // 設定打包時的env
            NODE_ENV: 'development',
        })
    ],
    // 這邊可以設定不需要打包到套件的第三方lib
    // external: ['gsap'],

    // 以下為解決 (!) `this` has been rewritten to `undefined`
    onwarn: function (warning) {
        if (warning.code === 'THIS_IS_UNDEFINED') {
            return;
        }
        console.error(warning.message);
    },
}


export default config;
