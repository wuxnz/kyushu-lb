"use client";

import axios from "@/lib/axios";
// import { signIn, useSession } from "next-auth/react";

import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import useSignIn from "react-auth-kit/hooks/useSignIn";

export const useRefreshToken = () => {
  const authUser: any = useAuthUser();
  const signIn = useSignIn();
  // console.log("authUser", authUser);

  const refreshToken = async () => {
    const res = await axios.post(
      `${process.env.NEXT_BACKEND_URL}/api/auth/refreshToken`,
      {
        refresh: authUser.refreshToken,
      },
    );

    if (authUser) authUser.accessToken = res.data.accessToken;
    else
      signIn({
        auth: {
          token: res.data.accessToken,
          type: "Bearer",
        },
        userState: {
          user: {
            ...authUser.user,
            accessToken: res.data.accessToken,
            refreshToken: res.data.refreshToken,
          },
        },
      });
  };
  return refreshToken;
};
