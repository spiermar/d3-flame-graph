const path = require('path')
const {
    CleanWebpackPlugin
} = require('clean-webpack-plugin')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const InlineChunkHtmlPlugin = require('react-dev-utils/InlineChunkHtmlPlugin')
const TerserPlugin = require('terser-webpack-plugin')
const ESLintPlugin = require('eslint-webpack-plugin')
const packageFile = require('./package.json')

module.exports = [{
    context: path.join(__dirname, 'src'),
    entry: {
        'd3-flamegraph': './flamegraph.js',
        'd3-flamegraph.min': './flamegraph.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        library: 'flamegraph',
        libraryExport: 'default',
        libraryTarget: 'umd'
    },
    plugins: [
        new CopyWebpackPlugin(
            {
                patterns: [
                    { from: 'flamegraph.css', to: 'd3-flamegraph.css' }
                ]
            }
        ),
        new ESLintPlugin()
    ],
    optimization: {
        minimizer: [
            new TerserPlugin({
                test: /\.min\.js$/i
            })
        ]
    },
    devServer: {
        static: [path.join(__dirname, 'examples'), path.join(__dirname, 'dist')]
    }
}, {
    context: path.join(__dirname, 'src'),
    entry: {
        colorMapper: './colorMapper.js',
        'colorMapper.min': './colorMapper.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'd3-flamegraph-[name].js',
        library: ['flamegraph', 'colorMapper'],
        libraryTarget: 'umd'
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                test: /\.min\.js$/i
            })
        ]
    }
}, {
    context: path.join(__dirname, 'src'),
    entry: {
        tooltip: './tooltip.js',
        'tooltip.min': './tooltip.js'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'd3-flamegraph-[name].js',
        library: ['flamegraph', 'tooltip'],
        libraryTarget: 'umd'
    },
    optimization: {
        minimizer: [
            new TerserPlugin({
                test: /\.min\.js$/i
            })
        ]
    }
}, {
    context: path.join(__dirname, 'src', 'templates', 'base'),
    entry: './template.js',
    output: {
        path: path.resolve(__dirname, 'dist', 'templates'),
        filename: 'bundle.js'
    },
    plugins: [
        new CleanWebpackPlugin({
            protectWebpackAssets: false,
            cleanOnceBeforeBuildPatterns: [],
            cleanAfterEveryBuildPatterns: ['bundle.js']
        }),
        new HtmlWebpackPlugin({
            template: 'template.html',
            filename: 'd3-flamegraph-base.html',
            inject: 'head',
            meta: {
                template_version: packageFile.version
            },
            minify: false
        }),
        new InlineChunkHtmlPlugin(HtmlWebpackPlugin, [/bundle.js/])
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
}]
