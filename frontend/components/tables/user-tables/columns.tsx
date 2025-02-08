"use client";
import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { LBEvent } from "@/models/models";
import { Checkbox } from "@/components/ui/checkbox";

var onThenYearRegex = /\d{4}-\d{2}-\d{2}.*\d{2}:\d{2}:\d{2}.\d{6}/;

const findOnThenYearInStringAndFormatIt = (message: string): string => {
  const onThenYear = message.match(onThenYearRegex);
  var onThenYearFormatted = "";
  if (onThenYear != null) {
    onThenYearFormatted =
      new Date(onThenYear[0]).toLocaleDateString("en-US") +
      " " +
      new Date(onThenYear[0]).toLocaleTimeString("en-US");
    var message = message.replace(onThenYearRegex, onThenYearFormatted);
    // console.log(message);
    return message;
  }
  return message;
};

export const columns: ColumnDef<LBEvent>[] = [
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
    accessorKey: "timestamp",
    header: "TIMESTAMP",
    cell: ({ row }) =>
      new Date(row.original.timestamp || 0).toLocaleDateString("en-US") +
      " " +
      new Date(row.original.timestamp || 0).toLocaleTimeString("en-US"),
  },
  {
    accessorKey: "message",
    header: "MESSAGE",
    cell: ({ row }) => findOnThenYearInStringAndFormatIt(row.original.message),
    // cell: ({ row }) => row.original.message,
  },
  {
    accessorKey: "type",
    header: "TYPE",
    cell: ({ row }) => row.original.type,
  },
  {
    id: "created by",
    header: "CREATED BY",
    cell: ({ row }) => row.original.initUser?.username || "-",
  },
  {
    id: "target user",
    header: "TARGET USER",
    cell: ({ row }) => row.original.targetUser?.username || "-",
  },
  {
    id: "affected mod",
    header: "AFFECTED MOD",
    cell: ({ row }) => row.original.affectedModerator?.username || "-",
  },
  {
    id: "affected admin",
    header: "AFFECTED ADMIN",
    cell: ({ row }) => row.original.affectedAdmin?.username || "-",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
];
