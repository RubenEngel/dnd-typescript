const path = require('path');

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-typescript', '@babel/preset-env']
                    }
                },
                include: [path.resolve(__dirname, 'src')]
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js']
    },
    devtool: 'eval-source-map',
    devServer: {
        host: '0.0.0.0',
        publicPath: "/",
        contentBase: "./public",
        hot: true,
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'public')
    },
    mode: 'development',
}