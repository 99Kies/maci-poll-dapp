module.exports = [
  {
      plugins: [
      new webpack.ProvidePlugin({
          Buffer: ["buffer", "Buffer"],
      }),
      ],
      resolve: {
      fallback: {
          buffer: false,
          crypto: false,
          events: false,
          path: false,
          stream: false,
          string_decoder: false,
      },
      },
  },
  ];
  