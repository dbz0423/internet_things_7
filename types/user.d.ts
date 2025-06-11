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
  tenantId: number;
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
  nickname: string;
  username: string;
  mobile: string;
  avatar: string;
};

type RegisterDTO = {
  username: string;
  mobile: string;
  code: string;
  password: string;
  accessToken: string;
  tenantId: number;
};
