import axios from "axios";

const axiosAPI = axios.create({
     baseURL: "http://localhost:8000/v1",
     withCredentials: true
});

axiosAPI.interceptors.response.use(
     (response) => response,
     async (error) => {
          const originalRequest = error.config;

          // if error code is 401(UNAUTHORIZED)
          if (
               error.response?.data?.status === 401 &&
               error.response?.data?.code === "ACCESS_TOKEN_EXPIRED" &&
               !originalRequest._retry
          ){

               originalRequest._retry = true;

               try {
                    const refreshResponse = await axios.post("http://localhost:8000/v1/auth/login/refresh", {}, { withCredentials: true });
                    console.log(refreshResponse)

                    return axiosAPI(originalRequest);
               } catch (refreshError) {
                    console.log(refreshError)
                    if (refreshError.response?.data?.code === "REFRESH_TOKEN_EXPIRED") {
                         // sets info about refreshtoken expiration
                         refreshError.isRefreshTokenExpired = true; // To be added in every file
                    }
                    return Promise.reject(refreshError);
               }
          }
          return Promise.reject(error);
     }
);

export default axiosAPI;
