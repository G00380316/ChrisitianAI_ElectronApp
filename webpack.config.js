const path = require('path');

module.exports = {
    entry: './src/index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                exclude: /node_modules/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env', '@babel/preset-react']
                    }
                }
            },
           {
      test: /\.css$/,
      use: [
        "style-loader",
        {
          loader: "css-loader",
          options: {
            importLoaders: 1,
            modules: true,
          },
        },
      ],
      include: /\.module\.css$/,
    },
    {
      test: /\.css$/,
      use: ["style-loader", "css-loader"],
      exclude: /\.module\.css$/,
    },        ]
    },
    resolve: {
        extensions: ['.js', '.jsx', '.css']
    },
    devServer: {
        static: path.join(__dirname, 'dist'),
        compress: true,
        port: 9000
    }
};

