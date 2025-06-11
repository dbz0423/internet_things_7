import { http } from "../utils/http";

export const getNewList = (data: NewQuery) => {
  return http<NewVO>({
    method: "POST",
    url: `/api/new/info`,
    data,
  });
};
export const getNewDetail = (id: number) => {
  return http<NewVO>({
    method: "POST",
    url: `/api/new/getNewById/${id}`,
  });
};
export const updateSupport = (data: NewDTO) => {
  return http<NewVO>({
    method: "PUT",
    url: `/api/new/update`,
    data,
  });
};
