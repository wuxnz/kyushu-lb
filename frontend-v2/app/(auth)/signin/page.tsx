"use client";
import { Metadata } from "next";
import Link from "next/link";
import UserAuthForm from "@/components/forms/user-auth-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import favicon from "@/public/favicon.svg";
import { AlertModal } from "@/components/modal/alert-modal";
import React from "react";
import { ro } from "date-fns/locale";
import { useRouter } from "next/navigation";

// export const metadata: Metadata = {
//   title: "Kyushu LB - Sign In",
//   description: "Sign in to Kyushu LB",
// };

export default function AuthenticationPage() {
  const [showModal, setShowModal] = React.useState(false);
  const [modalArgs, setModalArgs] = React.useState({
    title: "",
    description: "",
  });

  const router = useRouter();
  return (
    <div className="relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
      {/* <div className="flex-1 space-y-4 p-4 md:p-8 pt-6"> */}
      {showModal && (
        <AlertModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            if (modalArgs.title === "Success") {
              router.push("dashboard");
            } else {
              setShowModal(false);
            }
          }}
          loading={false}
          title={modalArgs.title}
          description={modalArgs.description}
          showCancel={false}
        />
      )}
      {/* </div> */}
      <Link
        href="/examples/authentication"
        className={cn(
          buttonVariants({ variant: "ghost" }),
          "absolute right-4 hidden top-4 md:right-8 md:top-8",
        )}
      >
        Login
      </Link>
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white dark:border-r lg:flex">
        <div className="absolute inset-0 bg-zinc-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <div className="mr-2">
            <img src={favicon.src} className="h-10 w-auto" alt="" />
          </div>
          Kyushu LB
        </div>
        <div className="relative z-20 mt-auto">
          <p className="text-lg">All except cheaters are welcome</p>
        </div>
      </div>
      <div className="p-4 lg:p-8 h-full flex items-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">Sign in</h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and password below to sign in
            </p>
          </div>
          <UserAuthForm
            shouldSignIn={true}
            setShowModal={setShowModal}
            setModalArgs={setModalArgs}
          />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking "Sign in", you agree to our{" "}
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:text-primary"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:text-primary"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
