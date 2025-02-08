"use client";

import BreadCrumb from "@/components/breadcrumb";
import { UserClient } from "@/components/tables/user-tables/client";
import { users } from "@/constants/data";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { useEffect, useState } from "react";

import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";

const breadcrumbItems = [{ title: "Logs", link: "/dashboard/logs" }];
export default function page() {
  const authHeader = useAuthHeader();
  const authUser: any = useAuthUser();

  const axiosAuth = useAxiosAuth();

  const [logs, setLogs] = useState<any>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const response = await axiosAuth.get(
        `${process.env.BACKEND_URL}/api/logs/all`,
        {
          headers: {
            Authorization: authHeader as string,
            "Content-Type": "application/json",
          },
        },
      );

      const data = await response.data;

      if (data.status === "success") {
        setLogs(data.data);
      }
    };

    fetchLogs();
  }, []);

  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />
        <UserClient data={logs} />
      </div>
    </>
  );
}
