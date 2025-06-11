import { View, Text, RichText, Image, Video, Button } from "@tarojs/components";
import { useEffect, useState } from "react";
import Taro from "@tarojs/taro";
import { getNewDetail, updateSupport } from "../../../../service/new";
import "./index.scss";
import zan from "../../../../static/images/zan.png";
import zan_active from "../../../../static/images/zan_active.png";

interface NewsDetail {
  id: number;
  title: string;
  content: string;
  createTime: string;
  support: number;
  type: number;
  video?: string;
}

export default function NewsDetailPage() {
  const [detail, setDetail] = useState<NewsDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false); // 新增点赞状态
  console.log("liked:", liked);

  useEffect(() => {
    const { id } = Taro.getCurrentInstance().router?.params || {};
    console.log("获取到的ID:", id);

    if (id) {
      fetchNewsDetail(Number(id));
    }
  }, []);

  const fetchNewsDetail = async (id: number) => {
    try {
      setLoading(true);
      const res = await getNewDetail(id);
      console.log("获取到的详情:", res);
      if (res?.data) {
        setDetail(res.data);
      }
    } catch (error) {
      console.error("获取详情失败:", error);
      Taro.showToast({
        title: "获取详情失败",
        icon: "none",
      });
    } finally {
      setLoading(false);
    }
  };

  const extractFirstImage = (html: string) => {
    const match = html.match(/<img[^>]+src="([^"]+)"/);
    return match ? match[1] : "";
  };

  const cleanVideoUrl = (url?: string) => {
    if (!url) return "";
    // 移除可能存在的锚点或参数
    return url.split("#")[0].split("?")[0];
  };

  const update = async (data: NewDTO) => {
    await updateSupport(data); // 调用接口

    fetchNewsDetail(Number(detail?.id));
  };

  const handleLike = async () => {
    setLiked((prevLiked) => {
      const newLiked = !prevLiked; // 获取新的点赞状态
      const data: NewDTO = {
        id: detail?.id || 0,
        support: newLiked
          ? (detail?.support || 0) + 1
          : (detail?.support || 0) - 1,
      };
      update(data); // 更新点赞状态
      return newLiked; // 返回新的点赞状态
    });
  };

  if (loading) {
    return (
      <View className="loading">
        <Text>加载中...</Text>
      </View>
    );
  }

  if (!detail) {
    return (
      <View className="error">
        <Text>资讯不存在</Text>
      </View>
    );
  }
  Taro.eventCenter.trigger("newsListShouldUpdate"); // 触发列表更新事件

  return (
    <View className="news-detail">
      {/* 标题 */}
      <View className="detail-header">
        <Text className="detail-title">{detail.title}</Text>
        <View className="detail-meta">
          <Text className="meta-date">{detail.createTime}</Text>
          <View className="support">
            <Text className="meta-views">{detail.support}</Text>
            <Button
              className={`meta-like ${liked ? "liked" : ""}`}
              onClick={handleLike}
            >
              <Image
                className="like-icon"
                src={liked ? zan_active : zan}
                style={{ width: "24px", height: "24px" }}
              />
            </Button>
          </View>
        </View>
      </View>

      {/* 封面图 */}
      {extractFirstImage(detail.content) && (
        <Image
          className="detail-cover"
          src={extractFirstImage(detail.content)}
          mode="widthFix"
        />
      )}

      {/* 视频（仅当有视频链接且未出错时显示） */}
      {detail.video && (
        <View className="video-container">
          <Video
            className="detail-video"
            src={cleanVideoUrl(detail.video)}
            controls
            autoplay={false}
            initialTime={0}
            onError={(e) => {
              console.error("视频加载失败:", e);
              Taro.showToast({ title: "视频加载失败", icon: "none" });
            }}
          />
        </View>
      )}

      {/* 内容 */}
      <View className="detail-content">
        <RichText nodes={detail.content} className="rich-text-content" />
      </View>
    </View>
  );
}
