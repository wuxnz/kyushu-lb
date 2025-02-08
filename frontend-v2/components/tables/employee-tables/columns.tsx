"use client";
import { Checkbox } from "@/components/ui/checkbox";
import { Employee } from "@/constants/data";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { DiscreteUser } from "@/models/models";
import Link from "next/link";

export const columns: ColumnDef<DiscreteUser>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "ID",
  },
  {
    accessorKey: "username",
    header: "USERNAME",
    cell: ({ row }) => (
      <Link href={`/profile/${row.original.id}`}>{row.original.username}</Link>
    ),
  },
  {
    accessorKey: "profileImage",
    header: "PROFILE IMAGE",
    cell: ({ row }) => (
      <img
        src={row.original.profileImage}
        alt={row.original.username}
        className="w-10 h-10 rounded-full"
      />
    ),
  },
  {
    accessorKey: "rank",
    header: "RANK",
  },
  {
    accessorKey: "role",
    header: "ROLE",
  },
  // {
  //   accessorKey: "first_name",
  //   header: "NAME",
  // },
  // {
  //   accessorKey: "country",
  //   header: "COUNTRY",
  // },
  // {
  //   accessorKey: "email",
  //   header: "EMAIL",
  // },
  // {
  //   accessorKey: "job",
  //   header: "COMPANY",
  // },
  // {
  //   accessorKey: "gender",
  //   header: "GENDER",
  // },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
