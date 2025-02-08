"use client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn as nextSignIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import * as z from "zod";
import GoogleSignInButton from "../github-auth-button";
import useSignIn from "react-auth-kit/hooks/useSignIn";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { userAgent } from "next/server";
import createRefresh from "react-auth-kit/createRefresh";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { encrypt } from "@/lib/crypto";
import axios from "@/lib/axios";

const signUpFormSchema = z.object({
  username: z.string().min(1, { message: "Enter your username" }),
  email: z.string().email({ message: "Enter a valid email address" }),
  password: z.string().min(1, { message: "Enter your password" }),
});

type signUpUserFormValue = z.infer<typeof signUpFormSchema>;

const signInFormSchema = z.object({
  email: z.string().email({ message: "Enter a valid email address" }),
  password: z.string().min(1, { message: "Enter your password" }),
  remember: z.boolean(),
});

type signInUserFormValue = z.infer<typeof signInFormSchema>;

interface authProps {
  shouldSignIn: boolean;
  setShowModal?: any;
  setModalArgs?: any;
}

export default function UserAuthForm({
  shouldSignIn,
  setShowModal,
  setModalArgs,
}: authProps) {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl");
  const [loading, setLoading] = useState(false);
  const [actionMessage, setactionMessage] = useState<string | null>(null);
  const signIn = useSignIn();
  const router = useRouter();
  const { data: session, update: sessionUpdate } = useSession();

  const user: any = useAuthUser();

  const signUpDefaultValues = {
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  };

  const signUpForm = useForm<signUpUserFormValue>({
    resolver: zodResolver(signUpFormSchema),
    defaultValues: signUpDefaultValues,
  });

  const onSignUp = async (data: signUpUserFormValue) => {
    try {
      const response = await axios.post(
        `${process.env.BACKEND_URL}/api/auth/signup`,
        {
          username: data.username,
          email: data.email,
          password: encrypt(data.password),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const responseData = response.data;

      if (response.status === 200 && responseData.status === "success") {
        // alert(response.data.message);
        setModalArgs({
          title:
            responseData.status[0].toUpperCase() + responseData.status.slice(1),
          description: responseData.message,
        });
        setShowModal(true);
        router.push("/auth/signin");
      } else {
        // alert(response.data.message);
        setModalArgs({
          title: "Error",
          description: response.data.message,
        });
        setShowModal(true);
      }
    } catch (error: any) {
      setModalArgs({
        title: "Error",
        description: error.message,
      });
      setShowModal(true);
    }
  };

  const signInDefaultValues = {
    email: "",
    password: "",
    remember: false,
  };

  const signInForm = useForm<signInUserFormValue>({
    resolver: zodResolver(signInFormSchema),
    defaultValues: signInDefaultValues,
  });

  const onSignIn = async (data: signInUserFormValue) => {
    try {
      const response = await axios.post(
        `${process.env.BACKEND_URL}/api/auth/signin`,
        {
          email: data.email,
          password: encrypt(data.password),
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      const responseData = response.data;
      if (response.status === 200 && responseData.status === "success") {
        // alert(response.data.message);

        setModalArgs({
          title:
            responseData.status[0].toUpperCase() + responseData.status.slice(1),
          description: responseData.message,
        });
        setShowModal(true);
        signIn({
          auth: {
            token: responseData.data.accessToken,
            type: "Bearer",
          },
          refresh: responseData.data.refreshToken,
          userState: {
            user: {
              id: responseData.data.user.id,
              name: responseData.data.user.username,
              // email: responseData.data.user.email,
              image: responseData.data.user.profileImage,
              role: responseData.data.user.role,
            },
            accessToken: responseData.data.accessToken,
            refreshToken: responseData.data.refreshToken,
          },
        });
        nextSignIn("credentials", {
          id: responseData.data.user.id,
          name: responseData.data.user.username,
          // email: responseData.data.user.email,
          profileImage: responseData.data.user.profileImage,
          redirect: false,
          // token: responseData.data.token,
        });
        sessionUpdate({
          data: {
            user: {
              id: responseData.data.user.id,
              name: responseData.data.user.username,
              // email: responseData.data.user.email,
              image: responseData.data.user.profileImage,
            },
          },
        });
      } else {
        // alert(response.data.message);
        setModalArgs({
          title: "Error",
          description: response.data.message,
        });
        setShowModal(true);
      }
    } catch (error: any) {
      setModalArgs({
        title: "Error",
        description: error.message,
      });
      setShowModal(true);
    }
  };

  return (
    <>
      {shouldSignIn ? (
        <Form {...signInForm}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="space-y-2 w-full"
          >
            <FormField
              control={signInForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email..."
                      disabled={loading}
                      {...field}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={signInForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password..."
                      disabled={loading}
                      {...field}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={signInForm.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between w-full">
                  <FormLabel className="mr-2 text-nowrap">
                    Remember me
                  </FormLabel>
                  <FormControl>
                    <Input
                      style={{ marginTop: 0, marginBottom: 0, width: 16 }}
                      type="checkbox"
                      disabled={loading}
                      {...field}
                      checked={field.value}
                      value={undefined}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {actionMessage && (
              <>
                <p className="text-sm text-green-500 text-muted-foreground text-center">
                  You have successfully signed in with {actionMessage}.
                </p>
                <div className="h-2"></div>
              </>
            )}

            <Link href="/signup">
              <Button disabled={loading} className="w-full mt-2" type="button">
                Dont have an account? Sign Up
              </Button>
            </Link>

            <Button
              disabled={loading}
              className="ml-auto w-full"
              type="submit"
              onClick={() => onSignIn(signInForm.getValues())}
            >
              Sign In
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...signUpForm}>
          <form
            onSubmit={(e) => {
              e.preventDefault();
            }}
            className="space-y-2 w-full"
          >
            <FormField
              control={signUpForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Username</FormLabel>
                  <FormControl>
                    <Input
                      type="text"
                      placeholder="Enter your desired username..."
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={signUpForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter your email..."
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={signUpForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Enter your password..."
                      disabled={loading}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {actionMessage && (
              <p className="text-sm text-green-500 text-muted-foreground text-center">
                You have successfully signed up with {actionMessage}. Please
                check your email to verify your account.
              </p>
            )}

            <div className="h-2"></div>

            <Link href="/signin">
              <Button disabled={loading} className="w-full" type="button">
                Already have an account? Sign In
              </Button>
            </Link>

            <Button
              disabled={loading}
              className="ml-auto w-full"
              type="submit"
              onClick={() => onSignUp(signUpForm.getValues())}
            >
              Sign Up
            </Button>
          </form>
        </Form>
        // {/* <div className="relative">
        //   <div className="absolute inset-0 flex items-center">
        //     <span className="w-full border-t" />
        //   </div>
        //   <div className="relative flex justify-center text-xs uppercase">
        //     <span className="bg-background px-2 text-muted-foreground">
        //       Or continue with
        //     </span>
        //   </div>
        // </div>
        // <GoogleSignInButton /> */}
      )}
    </>
  );
}
