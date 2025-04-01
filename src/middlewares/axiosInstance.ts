import axios, { AxiosResponse, AxiosError } from "axios";
import { toast } from "react-toastify";
import { HttpStatusCode } from "utils/enum";
import { IApiResponse, IErrorResponse } from "interfaces/user.interface";

// Create an Axios instance
const axiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    "Content-Type": "application/json; charset=utf-8",
    Accept: "application/json",
    "ngrok-skip-browser-warning": true,
    "Access-Control-Allow-Headers": "*",
  },
});

// Axios request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    
    // Retrieve user information from local storage
    const userStorage = localStorage.getItem("user");
    let user = null;
    if (userStorage) user = JSON.parse(userStorage);
    // Add Authorization header if the user has an access token
    if (user && user.token) {
      config.headers["Authorization"] = `Bearer ${user.token}`;
    } else {
      // Set an empty Authorization header if no access token is available
      delete config.headers["Authorization"];
    }
    // You can also modify other parts of the config as needed
    return config;
  },
  (error) => {
    
    // Do something with request error
    return Promise.reject(error);
  }
);

// Axios response interceptor
axiosInstance.interceptors.response.use(
  (response: AxiosResponse<IApiResponse>) => {
    // Do something with the successful response
    return response;
  },
  async (error: AxiosError<IErrorResponse>) => {
    // Check if error.response exists before attempting to destructure
    if (error.response) {
      const { status, data } = error.response;
      if (status === HttpStatusCode.Unauthorized) {
        
        // Handle Unauthorized access
        window.location.href = "/login";
        toast.error("Unauthorized access!", {
          position: toast.POSITION.TOP_RIGHT,
        });
        return error;
      } 
      else if (status === HttpStatusCode.BadRequest) {
        // Handle Bad Request (400)
        const errorMessage = data.message || "Bad Request";
        toast.error(errorMessage, {
          position: toast.POSITION.TOP_RIGHT,
        });
        return error;
      } 
      else {
        // Handle other status codes
        const errorMessage = data.message || "An error occurred";
        toast.error(errorMessage, {
          position: toast.POSITION.TOP_RIGHT,
        });
        return error;
      }
    } 
    else {
      // Handle network errors or any other errors
      toast.error("An unexpected error occurred", {
        position: toast.POSITION.TOP_RIGHT,
      });
    }
    // Reject the promise with the error
    return Promise.reject(error);
  }
);

export default axiosInstance;
