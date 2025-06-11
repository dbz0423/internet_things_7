import { http } from "../utils/http";

/**
 * 分页查询报警日志
 * @param params 查询参数
 * @returns
 */
export const getAlarmLogPage = (params: {
  page: number;
  size: number;
  deviceId?: string;
  eventLevel?: "Critical" | "Warning" | "Info";
}) => {
  return http({
    url: "/api/iot/alarm-log/page",
    method: "GET",
    data: params,
  });
};
