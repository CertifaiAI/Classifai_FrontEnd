const webpack = require('webpack');
module.exports = {
  plugins: [
    // /**  @remark - project only deal with Malaysia date format, thus remove the rest */
    // new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /ms-my/),
    /**  @remark - project not require xlx OLD excel files */
    new webpack.IgnorePlugin(/cpexcel/),
    /**  @remark - project not require zip files YET */
    new webpack.IgnorePlugin(/jszip/),
  ],
};
