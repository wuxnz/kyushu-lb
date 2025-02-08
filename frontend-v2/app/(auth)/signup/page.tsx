"use client";

import { Metadata } from "next";
import Link from "next/link";
import UserAuthForm from "@/components/forms/user-auth-form";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import favicon from "@/public/favicon.svg";
import React from "react";
import { useRouter } from "next/navigation";
import { AlertModal } from "@/components/modal/alert-modal";

// export const metadata: Metadata = {
//   title: "Authentication",
//   description: "Authentication forms built using the components.",
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
      {showModal && (
        <AlertModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          onConfirm={() => {
            if (modalArgs.title === "Success") {
              router.push("signin");
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
          <blockquote className="space-y-2">
            <p className="text-lg">All except cheaters are welcome</p>
          </blockquote>
        </div>
      </div>
      <div className="p-4 lg:p-8 h-full flex items-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Create an account
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email below to create your account
            </p>
          </div>
          <UserAuthForm
            shouldSignIn={false}
            setShowModal={setShowModal}
            setModalArgs={setModalArgs}
          />
          <p className="px-8 text-center text-sm text-muted-foreground">
            By clicking continue, you agree to our{" "}
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
