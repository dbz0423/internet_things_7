import Taro from "@tarojs/taro";
const baseURL = "http://localhost:8182";

type Data<T> = {
  code: number;
  msg: string;
  data: T;
};

export const http = <T>(options: {
  url: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  data?: any;
  header?: any;
}) => {
  return new Promise<Data<T>>((resolve, reject) => {
    Taro.request({
      ...options,
      success(res) {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          if (res.data.code === 401) {
            Taro.showToast({
              icon: "error",
              title: res.data.msg || "请求错误",
            });
            Taro.navigateTo({ url: "/pages/login/index" });
            reject(res);
          } else if (res.data.code === 0) {
            resolve(res.data as Data<T>);
          } else {
            Taro.showToast({
              icon: "error",
              title: res.data.msg || "请求错误",
            });
          }
        } else {
          Taro.showToast({
            icon: "error",
            title: res.data.msg || "请求错误",
          });
          reject(res);
        }
      },
      fail(err) {
        Taro.showToast({
          icon: "none",
          title: "网络错误",
        });
        reject(err);
      },
    });
  });
};

const httpInterceptor = function (chain) {
  const requestParams = chain.requestParams;
  const { url } = requestParams;

  if (!url.startsWith("http")) {
    requestParams.url = baseURL + url;
  }

  requestParams.header = {
    ...requestParams.header,
  };

  const token = Taro.getStorageSync("token") || "no-token";
  if (token) {
    requestParams.header.Authorization = token;
  }
  return chain.proceed(requestParams).then((res) => {
    return res;
  });
};

Taro.addInterceptor(httpInterceptor);
