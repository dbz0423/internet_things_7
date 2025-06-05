import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import { configureStore } from "@reduxjs/toolkit";
import userReducer from "./user";
const store = configureStore({
  reducer: {
    user: userReducer,
  },
});
// 从 store 本身推断出 RootState 和 AppDispatch 类型
export type RootState = ReturnType<typeof store.getState>;
// 推断出类型：{posts: PostsState,comments:CommentsState,users:UsersState}
export type AppDispatch = typeof store.dispatch;
// 在整个应⽤程序中使⽤，⽽不是简单的 useDispatch 和 useSelector
export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
export default store;
