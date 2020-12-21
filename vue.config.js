module.exports = {
  configureWebpack: {
    // No need for splitting
    optimization: {
      splitChunks: false
    }
  },
  outputDir: "../../public/vendor/file-manager/",
  filenameHashing: false
};
