type MobileLoginDTO = {
  mobile: string;
  code: string;
};

type MobileLoginVO = {
  id: number;
  mobile: string;
  accessToken: string;
};

type UserVO = {
  id: number;
  mobile: string;
  nickname: string;
  avatar: string;
  gender: number;
  createTime: string;
};

type AccountLoginDTO = {
  username: string;
  password: string;
  tenantId: number;
};

type AccountLoginVO = {
  username: string;
  password: string;
  accessToken: string;
};

type UserDTO = {
  id: number;
  nickname: string;
  avatar: string;
  gender: number;
};

type RegisterDTO = {
  username: string;
  mobile: string;
  code: string;
  password: string;
  accessToken: string;
  tenantId: number;
};
type NewVO = {
  id: number;
  title: string;
  content: string;
  createTime: string;
  top: number;
  video: string;
  support: number;
  list: any;
  type: number;
};

type NewDTO = {
  id: number;
  title: string;
  content: string;
  top: number;
  video: string;
  support: number;
  type: number;
};
type NewQuery = {
  page: number;
  limit: number;
  title: string;
  tenantId: number;
};
