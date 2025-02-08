"use client";
import BreadCrumb from "@/components/breadcrumb";
import { columns } from "@/components/tables/employee-tables/columns";
import { EmployeeTable } from "@/components/tables/employee-tables/employee-table";
import { buttonVariants } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { Employee } from "@/constants/data";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { cn } from "@/lib/utils";
import { DiscreteUser } from "@/models/models";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";

const breadcrumbItems = [{ title: "Employee", link: "/dashboard/employee" }];

type paramsProps = {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
};

export default function page({ searchParams }: paramsProps) {
  const page = Number(searchParams.page) || 1;
  const pageLimit = Number(searchParams.limit) || 10;
  const username = searchParams.search || null;
  const offset = (page - 1) * pageLimit;

  const axiosAuth = useAxiosAuth();

  // const res = await fetch(
  //   `https://api.slingacademy.com/v1/sample-data/users?offset=${offset}&limit=${pageLimit}` +
  //     (country ? `&search=${country}` : ""),
  // );
  // const employeeRes = await res.json();
  // const totalUsers = employeeRes.total_users; //1000
  // const pageCount = Math.ceil(totalUsers / pageLimit);
  // const employee: Employee[] = employeeRes.users;

  const authHeader = useAuthHeader();

  const [totalUsers, setTotalUsers] = useState(0);
  const [pageCount, setPageCount] = useState(0);
  const [discreteUsers, setDiscreteUsers] = useState<DiscreteUser[]>([]);

  useEffect(() => {
    const getEmployee = async () => {
      const response = await axiosAuth.post(
        `${process.env.BACKEND_URL}/api/account/discreteUsers`,
        {
          all: true,
        },
        {
          headers: {
            Authorization: authHeader as string,
            "Content-Type": "application/json",
          },
        },
      );

      var data = await response.data;

      if (username != null) {
        data = {
          ...data,
          data: data.data
            .filter((user: DiscreteUser) =>
              RegExp(username as string, "i").test(user.username) ? user : null,
            )
            .slice(offset, offset + pageLimit),
        };
      }

      if (data.status === "success") {
        setTotalUsers(data.data.length);
        setPageCount(Math.ceil(data.data.length / pageLimit));
        setDiscreteUsers(data.data);
      }
    };

    getEmployee();
  }, [username]);
  return (
    <>
      <div className="flex-1 space-y-4  p-4 md:p-8 pt-6">
        <BreadCrumb items={breadcrumbItems} />

        <div className="flex items-start justify-between">
          <Heading
            title={`Users (${totalUsers})`}
            description="Manage employees (Server side table functionalities.)"
          />

          <Link
            href={"/dashboard/employee/new"}
            className={cn(buttonVariants({ variant: "default" }))}
          >
            <Plus className="mr-2 h-4 w-4" /> Add New
          </Link>
        </div>
        <Separator />

        <EmployeeTable
          searchKey="username"
          pageNo={page}
          columns={columns}
          totalUsers={totalUsers}
          data={discreteUsers}
          pageCount={pageCount}
        />
      </div>
    </>
  );
}
