import { NextAuthOptions } from "next-auth";
import GithubProvider from "next-auth/providers/github";
import CredentialProvider from "next-auth/providers/credentials";
import { LBUser } from "@/models/models";

export const authOptions: NextAuthOptions = {
  providers: [
    // GithubProvider({
    //   clientId: process.env.GITHUB_ID ?? "",
    //   clientSecret: process.env.GITHUB_SECRET ?? "",
    // }),
    CredentialProvider({
      credentials: {
        id: {
          label: "id",
          type: "string",
          placeholder: "id",
        },
        username: {
          label: "username",
          type: "text",
          placeholder: "username",
        },
        email: {
          label: "email",
          type: "email",
          placeholder: "email",
        },
        profileImage: {
          label: "profileImage",
          type: "string",
          placeholder: "string",
        },
      },
      async authorize(credentials, req) {
        const user = {
          id: credentials?.id as string,
          username: credentials?.username,
          email: credentials?.email,
          profileImage: credentials?.profileImage,
        };
        if (user) {
          // Any object returned will be saved in `user` property of the JWT
          return user;
        } else {
          // If you return null then an error will be displayed advising the user to check their details.
          return null;
          // You can also Reject this callback with an Error thus the user will be sent to the error page with the error message as a query parameter
        }
      },
    }),
  ],
  pages: {
    signIn: "/signin", //sigin page
  },
};
