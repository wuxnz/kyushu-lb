"use client";
import { axiosAuth } from "@/lib/axios";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
// import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import useSignOut from "react-auth-kit/hooks/useSignOut";

const useAxiosAuth = () => {
  const authHeader = useAuthHeader();
  // console.log("authHeader", authHeader);
  // const refreshToken = useRefreshToken();
  // const authUser: any = useAuthUser();
  // console.log("authUser", authUser.user);
  const signOutRAK = useSignOut();
  const router = useRouter();

  useEffect(() => {
    const requestIntercept = axiosAuth.interceptors.request.use(
      (config: any) => {
        if (!config.headers["Authorization"]) {
          config.headers["Authorization"] = authHeader;
        }
        return config;
      },
      (error: any) => Promise.reject(error),
    );

    const responseIntercept = axiosAuth.interceptors.response.use(
      (response: any) => response,
      async (error: any) => {
        const prevRequest = error?.config;
        if (error?.response?.status === 401 && !prevRequest?.sent) {
          prevRequest.sent = true;
          // await refreshToken();
          // prevRequest.headers["Authorization"] = authHeader;
          // return axiosAuth(prevRequest);

          // signOut({ callbackUrl: "/dashboard" });
          if (
            window.location.pathname === "/dashboard" &&
            prevRequest.url ===
              `${process.env.BACKEND_URL}/api/account/userData` //&&
          ) {
            signOutRAK();
            signOut({ callbackUrl: "/signin" });
          } else {
            router.push("/dashboard");
          }
          // return axiosAuth(prevRequest);

          return Promise.resolve(prevRequest);
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axiosAuth.interceptors.request.eject(requestIntercept);
      axiosAuth.interceptors.response.eject(responseIntercept);
    };
  }, [authHeader, signOutRAK]);

  return axiosAuth;
};

export default useAxiosAuth;
