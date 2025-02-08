"use client";
import { Button } from "@/components/ui/button";
import React from "react";

function page() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4">
      <h1 className="text-3xl font-bold">Kyushu LB</h1>
      <p className="text-lg">Welcome to Kyushu LB</p>
      <Button
        onClick={() => {
          window.location.href = "/signin";
        }}
      >
        Sign In
      </Button>
    </div>
  );
}

export default page;
