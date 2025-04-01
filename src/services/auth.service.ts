import { AxiosResponse } from "axios";
import axios from "middlewares/axiosInstance";
import {
  ILoginResponse,
  IResetPassword,
  IStates,
  IUnsignedCaseCount,
  IUserLogin,
  IUserRegistration,
  IVerifyEmail,
} from "interfaces/user.interface";
import axiosClient from "middlewares/axiosInstance";
import { jwtDecode } from "jwt-decode";

/**
 * login details
 * @param email
 * @param password
 * @returns
 */
const login = async (userDetail: IUserLogin) => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const response = await axios<ILoginResponse>({
    method: "POST",
    url: `/api/Account/Login`,
    data: userDetail,
    headers: headers
  });

  return response as AxiosResponse<ILoginResponse>;
};

/**
 * check for current user in local storage
 * @returns boolean
 */
const isAuthenticated = () => {
  const userStorage = localStorage.getItem("user");
  if (userStorage) return true;
  return false;
};

/**
 * check for current user in local storage
 * @returns boolean
 */

const handleAuthToken = (token: string): Promise<boolean> => {
  
  return new Promise((resolve, reject) => {
    try {
      localStorage.setItem("user", token);
      const userDetail = jwtDecode(token);
      localStorage.setItem("userDetail", JSON.stringify(userDetail));
      // Check if the value is stored immediately
      if (localStorage.getItem("user")) {
        resolve(true);
      } else {
        reject(new Error("Value not stored in local storage"));
      }
    } catch (error) {
      reject(error);
    }
  });
};

/**
 *
 * @param userDetail
 * @returns
 */
const signUp = async (userDetail: IUserRegistration) => {
  const response = await axiosClient<AxiosResponse>({
    method: "POST",
    url: `/api/Account/Register`,
    data: userDetail,
  });

  return response as AxiosResponse;
};

/**
 *
 * @param userDetail
 * @returns
 */
const forgotPassword = async (values: { email: string }) => {
  const response = await axiosClient<AxiosResponse>({
    method: "POST",
    url: `/api/Account/ForgotPassword`,
    data: values,
  });

  return response as AxiosResponse;
};

/**
 *
 * @param password
 * @returns
 */
const resetPassword = async (resetPassword: IResetPassword) => {
  const response = await axios<AxiosResponse>({
    method: "POST",
    url: `/api/Account/ResetPassword`,
    data: resetPassword,
  });

  return response as AxiosResponse;
};

const confirmVerification = async (verify: IVerifyEmail) => {
  const response = await axios.get(`/api/Account/ConfirmEmail?userId=${verify.userId}&code=${verify.code}`);
  return response as AxiosResponse;
};

const getUnsignedCaseCount = async () => {
  const response: AxiosResponse<IUnsignedCaseCount> =
    await axios<IUnsignedCaseCount>({
      method: "GET",
      url: `/api/AllCase/UnsignedCases`,
    });

  return response as AxiosResponse<IUnsignedCaseCount>;
};

const getStates = async () => {
  const response: AxiosResponse<IStates[]> =
    await axios<IStates[]>({
      method: "GET",
      url: `/api/Account/getStates`,
    });

  return response as AxiosResponse<IStates[]>;
};


const AuthService = {
  login,
  handleAuthToken,
  isAuthenticated,
  signUp,
  forgotPassword,
  resetPassword,
  confirmVerification,
  getUnsignedCaseCount,
  getStates
};
export default AuthService;
