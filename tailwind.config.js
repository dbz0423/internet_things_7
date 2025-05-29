/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // 适用于Taro/React项目的主要源文件
    // 如果您有其他地方使用Tailwind类名，例如public/index.html，也可以添加
    // './public/index.html',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
  // corePlugins: { // 如果遇到样式冲突，可以考虑禁用 preflight
  //   preflight: false,
  // }
};
