/**
 * @fileOverview
 * @author iNahoo
 * @since 2018/6/14.
 */
"use strict";

const {resolve} = require('path');

const r = rp => resolve(__dirname, '../', rp);

module.exports = {
    mode: 'production',
    entry: r("src/index.js"),
    output: {
        filename: 'index.js',
        path: r('build/'),
        libraryTarget: 'commonjs',
    },

    resolve: {
        extensions: ['.js'],
    },

    module: {
        rules: [
            {
                test: /\.js$/,
                loader: require.resolve('babel-loader'),
            }
        ]
    }

};