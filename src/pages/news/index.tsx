import {
  View,
  Text,
  Input,
  Button,
  Icon,
  ScrollView,
} from "@tarojs/components";
import { useState, useEffect } from "react";
import "./index.scss";
import { getNewList } from "../../service/new";
import Taro, { useDidShow } from "@tarojs/taro";

// 添加onShow生命周期钩子
export default function NewsPage() {
  useDidShow(() => {
    getNew();
  });
  const [activeCategory, setActiveCategory] = useState(6);
  const [searchValue, setSearchValue] = useState("");
  const [NewData, setNewData] = useState<NewVO[]>([]); // 修正类型定义

  const categories = [
    { type: 6, name: "全部" },
    { type: 0, name: "最新动态" },
    { type: 1, name: "通知公告" },
    { type: 2, name: "设备监控" },
    { type: 3, name: "智慧教室" },
  ];

  const data: NewQuery = {
    page: 1,
    limit: 10,
    title: searchValue,
    tenantId: Taro.getStorageSync("user").tenantId,
  };
  const extractFirstImage = (html: string) => {
    const match = html.match(/<img[^>]+src="([^"]+)"/);
    return match
      ? match[1]
      : "https://img95.699pic.com/photo/60018/4772.jpg_wh860.jpg";
  };
  const getNew = async () => {
    const res = await getNewList(data);
    if (res?.data.list) {
      setNewData(
        res.data.list.map((item) => ({
          ...item,
          cover:
            extractFirstImage(item.content) ||
            "https://img95.699pic.com/photo/60018/4772.jpg_wh860.jpg",
        }))
      );
    } else {
      console.error("获取新闻失败:");
      setNewData([]);
    }
  };
  // 修改导航返回逻辑（详情页）
  // 删除或注释掉以下导航返回代码
  // Taro.navigateBack({
  //   delta: 1,
  //   success: () => {
  //     Taro.eventCenter.trigger("page.onShow");
  //   },
  // });

  const filteredNews =
    activeCategory === 6
      ? NewData
      : NewData.filter((item) => item.type === activeCategory);

  const handleSearch = () => {
    // 实际项目中这里调用搜索API
    console.log("搜索内容:", searchValue);
    getNew();
  };

  const onDetail = (id: number) => {
    // 实际项目中这里跳转到详情页
    Taro.navigateTo({
      url: `/pages/news/components/newsDetail/index?id=${id}`,
    });
    console.log("跳转到详情页");
  };

  return (
    <View className="news-page bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* 搜索栏 */}
      <View className="search">
        <View className="search-item ">
          <Icon type="search" size={16} color="#999" className="icon" />
          <Input
            className="input"
            type="text"
            value={searchValue}
            placeholder="搜索物联网资讯..."
            placeholderClass="placeholder"
            onBlur={handleSearch}
            onInput={(e) => setSearchValue(e.detail.value)}
          />
        </View>
        <Button type="primary" className="btn" onClick={handleSearch}>
          搜索
        </Button>
      </View>

      {/* 分类滚动条 */}
      <ScrollView
        className="category-scroll "
        scrollX
        scrollWithAnimation
        showScrollbar={false}
      >
        {categories.map((category) => (
          <View
            key={category.type}
            className={`category-item ${
              activeCategory === category.type ? "active" : ""
            }`}
            onClick={() => setActiveCategory(category.type)}
          >
            <Text>{category.name}</Text>
          </View>
        ))}
      </ScrollView>

      {/* 资讯列表 */}
      <View className="news-list">
        {filteredNews.map((item) => (
          <View
            className="news-card"
            key={item.id}
            onClick={() => {
              onDetail(item.id);
            }}
          >
            <View
              className="card-image"
              style={{ backgroundImage: `url(${item.cover})` }}
            />
            <View className="card-content">
              <Text className="card-title">{item.title}</Text>
              <Text className="card-desc">
                {item.content
                  .replace(/<[^>]+>/g, " ") // 替换标签为空格
                  .replace(/\s{2,}/g, " ") // 合并多个空格
                  .trim()}
              </Text>
              <View className="card-meta">
                <Text className="meta-date">{item.createTime}</Text>
                <Text className="meta-views">{item.support}喜欢</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}
