import { PropsWithChildren } from "react";
import { useLaunch } from "@tarojs/taro";
import { Provider } from "react-redux";
import "taro-ui/dist/style/index.scss";
import store from "./pages/store";
import "./app.scss";

// 引入组件样式
function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log("App launched.");
  });

  // children 是将要会渲染的页面
  return (
    <>
      <Provider store={store}>{children}</Provider>
    </>
  );
}

export default App;
