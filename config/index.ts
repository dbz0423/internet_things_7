import { defineConfig, type UserConfigExport } from "@tarojs/cli";
import type { Plugin } from "vite";
import tailwindcss from "tailwindcss";
// 1. 导入 weapp-tailwindcss/vite 提供的插件, 更新别名和路径
import { UnifiedViteWeappTailwindcssPlugin as uvtw } from "weapp-tailwindcss/vite";

import devConfig from "./dev";
import prodConfig from "./prod";

// https://taro-docs.jd.com/docs/next/config#defineconfig-辅助函数
export default defineConfig<"vite">(async (merge, { command, mode }) => {
  const baseConfig: UserConfigExport<"vite"> = {
    projectName: "taro-things-app",
    date: "2025-5-28",
    designWidth: 750,
    deviceRatio: {
      640: 2.34 / 2,
      750: 1,
      375: 2,
      828: 1.81 / 2,
    },
    sourceRoot: "src",
    outputRoot: "dist",
    plugins: [], // Taro CLI 插件放这里
    defineConstants: {},
    copy: {
      patterns: [],
      options: {},
    },
    framework: "react",
    // 更新 compiler 和 vitePlugins 结构
    compiler: {
      type: "vite",
      vitePlugins: [
        {
          // 通过 vite 插件加载 postcss,
          name: "postcss-config-loader-plugin",
          config(config) {
            if (
              typeof config.css?.postcss === "object" &&
              config.css.postcss.plugins
            ) {
              // @ts-ignore
              config.css.postcss.plugins.unshift(tailwindcss());
            }
          },
        },
        uvtw({
          // rem转rpx
          rem2rpx: true,
          // 除了小程序这些，其他平台都 disable
          disabled:
            typeof process === "undefined" ||
            process.env.TARO_ENV === "h5" ||
            process.env.TARO_ENV === "harmony" ||
            process.env.TARO_ENV === "rn",
          // 由于 taro vite 默认会移除所有的 tailwindcss css 变量，所以一定要开启这个配置，进行css 变量的重新注入
          injectAdditionalCssVarScope: true,
        }),
      ] as Plugin[], // 从 vite 引入 type, 为了智能提示
    },
    mini: {
      postcss: {
        pxtransform: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: "module",
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
      },
    },
    h5: {
      publicPath: "/",
      staticDirectory: "static",
      miniCssExtractPluginOption: {
        ignoreOrder: true,
        filename: "css/[name].[hash].css",
        chunkFilename: "css/[name].[chunkhash].css",
      },
      postcss: {
        autoprefixer: {
          enable: true,
          config: {},
        },
        cssModules: {
          enable: false,
          config: {
            namingPattern: "module",
            generateScopedName: "[name]__[local]___[hash:base64:5]",
          },
        },
      },
    },
    rn: {
      appName: "taroDemo",
      postcss: {
        cssModules: {
          enable: false,
        },
      },
    },
  };

  if (typeof process !== "undefined") {
    process.env.BROWSERSLIST_ENV = process.env.NODE_ENV;
  }

  if (
    typeof process === "undefined" ||
    process.env.NODE_ENV === "development"
  ) {
    return merge({}, baseConfig, devConfig);
  }
  return merge({}, baseConfig, prodConfig);
});
