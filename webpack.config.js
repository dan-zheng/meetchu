const autoprefixer = require('autoprefixer');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const path = require('path');

const config = {
  entry: [
    'bootstrap-loader',
    'font-awesome-sass-loader',
    path.resolve(__dirname, 'public/index.js')
  ],
  output: {
    path: path.join(__dirname, 'public/dist'),
    publicPath: 'dist/',
    filename: 'bundle.js'
  },
  module: {
    rules: [
      {
        test: /bootstrap-sass\/assets\/javascripts\//,
        use: [
          'imports-loader?jQuery=jquery'
        ]
      },
      {
        test: /\.(sass|scss)$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            'css-loader',
            'resolve-url-loader',
            'sass-loader?sourceMap',
            {
              loader: 'postcss-loader',
              options: {
                plugins() {
                  return [
                    autoprefixer
                  ];
                }
              }
            }
          ]
        }),
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          'url-loader?limit=10000&mimetype=application/font-woff'
        ]
      },
      {
        test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: [
          'file-loader'
        ]
      }
    ]
  },
  plugins: [
    new ExtractTextPlugin('[name].css')
  ],
  resolve: {
    modules: [path.join(__dirname, 'node_modules'), path.join(__dirname, 'public')]
  }
};

module.exports = config;
