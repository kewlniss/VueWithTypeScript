const path = require('path');
const webpack = require('webpack');
const merge = require('webpack-merge');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const bundleOutputDir = './wwwroot/dist';
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');

module.exports = (env) => {
    const isDevBuild = !(env && env.prod);

    const sharedConfig = {
        stats: { modules: false },
        context: __dirname,
        resolve: { extensions: ['.js', '.ts', '.vue', '.scss'] },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: 'ts-loader',
                    exclude: /node_modules/,
                    options: {
                        appendTsSuffixTo: [/\.vue$/],
                        happyPackMode: true,
                        transpileOnly: true
                    }
                },
                {
                    test: /\.scss$/,
                    use:
                        isDevBuild ?
                    [{
                        loader: "style-loader"
                    }, {
                        loader: "css-loader", options: {
                            sourceMap: true
                        }
                    }, {
                        loader: "sass-loader", options: {
                            sourceMap: true,
                            includePaths:
                            [
                                path.resolve(__dirname, "node_modules")
                            ]
                        }
                    }]
                    :
                    ExtractTextPlugin.extract({
                        fallback: 'style-loader',
                        use:
                        [{
                            loader: "css-loader?minimize"
                        }, {
                            loader: "sass-loader", options: {
                                includePaths:
                                [
                                    path.resolve(__dirname, "node_modules")
                                ]
                            }
                        }]
                    })
                },
                { test: /\.vue$/, include: /src/, loader: 'vue-loader', options: { esModule: false } },
                //{ test: /\.scss$/, include: /node_modules/, use: isDevBuild ? ['style-loader', 'css-loader', 'sass-loader'] : ExtractTextPlugin.extract({ use: 'css-loader?minimize' }) },
                { test: /\.sass$/, include: /node_modules/, use: isDevBuild ? ['style-loader', 'css-loader', 'sass-loader?indentedSyntax'] : ExtractTextPlugin.extract({ use: 'css-loader?minimize' }) },
                { test: /\.css$/, use: isDevBuild ? ['style-loader', 'css-loader'] : ExtractTextPlugin.extract({ use: 'css-loader?minimize' }) },
                { test: /\.(png|jpg|jpeg|gif|svg)$/, use: 'url-loader?limit=25000' }
            ]
        },
        plugins: [
            new ForkTsCheckerWebpackPlugin(),
            new webpack.optimize.CommonsChunkPlugin({
               name: 'common' // specify the common bundle's name
            }),
            new webpack.DefinePlugin({
                'process.env': {
                    NODE_ENV: JSON.stringify(isDevBuild ? 'development' : 'production')
                }
            })].concat(isDevBuild ? [
                // Plugins that apply in development builds only
                new webpack.SourceMapDevToolPlugin({
                    filename: '[file].map', // Remove this line if you prefer inline source maps
                    moduleFilenameTemplate: path.relative(bundleOutputDir, '[resourcePath]') // Point sourcemap entries to the original file locations on disk
                })
            ] : [
                    // Plugins that apply in production builds only
                    //new UglifyJsPlugin(),
                    new ExtractTextPlugin('site.css')
                ])
    }

    const clientBundleConfig = merge(sharedConfig, {
        entry: {
            'site': './src/main.ts'
        },
        output: {
            path: path.join(__dirname, bundleOutputDir),
            filename: '[name].js',
            publicPath: 'dist/'
        }
    });

    return [clientBundleConfig];

};
