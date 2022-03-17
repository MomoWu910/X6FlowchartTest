const path = require('path');
var webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// import * as path from 'path';
// import * as webpack from 'webpack';
// import HtmlWebpackPlugin from 'html-webpack-plugin';

module.exports = {
    mode: 'development',
    entry: {
        index: path.resolve(__dirname, './index.ts'),
    },
    devtool: 'cheap-module-source-map',
    devServer: {
        static: {
            serveIndex: true,
            directory: __dirname,
            watch: false
        },
        hot: true,
        open: true
    },
    plugins: [
        new webpack.HotModuleReplacementPlugin(),
        new HtmlWebpackPlugin({
            title: 'Development',
        }),
    ],
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist'),
        publicPath: '/dist/'
    },
    resolve: {
        extensions: ['.ts', '.js'],
        fallback: { "path": require.resolve("path-browserify") }
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader'],
            },
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            },
            {
                test: /\.(png|jpe?g|gif)$/i,
                use: [
                    {
                        loader: 'file-loader',
                    },
                ],
            },
        ],
    },
    watchOptions: {
        ignored: /node_modules/
    }
};