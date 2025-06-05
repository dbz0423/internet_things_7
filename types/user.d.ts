type MobileLoginDTO = {
  mobile: string
  code: string
}

type MobileLoginVO = {
  id: number
  mobile: string
  accessToken: string
}

type UserVO = {
  id: number
  mobile: string
  nickname: string
  avatar: string
  gender: number
  createTime: string
}

type AccountLoginDTO = {
  username: string
  password: string
}

type AccountLoginVO = {
  username: string
  password: string
  accessToken: string
}

type UserDTO = {
  id: number
  nickname: string
  avatar: string
  gender: number
}
