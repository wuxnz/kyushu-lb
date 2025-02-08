// @ts-nocheck
import { signOut } from "next-auth/react";
import createRefresh from "react-auth-kit/createRefresh";

const refresh = createRefresh({
  interval: 1,
  refreshApiCallback: async (param) => {
    try {
      const response = await fetch(
        `${process.env.BACKEND_URL}/api/auth/refreshToken`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${param.authToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            refreshToken: param.refreshToken,
          }),
        },
      )
        .then((response) => {
          if (response.status !== 200) {
            signOut();
          } else {
            return response.json();
          }
        })
        .then((data) => {
          // console.log("Refreshing");
          return {
            isSuccess: true,
            newAuthToken: data.data.accessToken,
            newAuthTokenExpireIn: 5, // 5 min
            newRefreshTokenExpiresIn: 1 * 60 * 24 * 7, // 1 week
          };
        });

      return response;
    } catch (error) {
      console.error(error);
      return {
        isSuccess: false,
      };
    }
  },
});

export default refresh;
