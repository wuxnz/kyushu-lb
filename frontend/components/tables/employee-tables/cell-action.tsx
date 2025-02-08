"use client";
import { AlertModal } from "@/components/modal/alert-modal";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Employee } from "@/constants/data";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import axios from "@/lib/axios";
import { DiscreteUser, Role } from "@/models/models";
import { set } from "date-fns";
import { ArrowDown, ArrowUp, Edit, MoreHorizontal, Trash } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useState } from "react";

import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";

interface CellActionProps {
  data: DiscreteUser;
}

export const CellAction: React.FC<CellActionProps> = ({ data }) => {
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const authHeader = useAuthHeader();

  const axiosAuth = useAxiosAuth();

  const [onConfirm, setOnConfirm] = useState<"promote" | "demote" | "delete">();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [showCancel, setShowCancel] = useState(false);
  const allRoles = Object.values(Role)
    // .slice(Object.values(Role).length / 2, Object.values(Role).length)
    .map((role) => role.toString());

  const [doOp, setDoOp] = useState<boolean>(true);

  const onPromote = async () => {
    if (data.role === allRoles[allRoles.indexOf(data.role) - 1]) {
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.BACKEND_URL}/api/account/promote`,
        {
          userId: data.id,
          role: allRoles[allRoles.indexOf(data.role) - 1],
        },
        {
          headers: {
            Authorization: authHeader as string,
            "Content-Type": "application/json",
          },
        },
      );
      setTitle(
        response.data.status[0].toUpperCase() + response.data.status.slice(1),
      );
      setDescription(response.data.message);
      setOpen(true);
      setDoOp(false);
    } catch (error) {
      setTitle("Error");
      setDescription("Unable to promote user");
      setOpen(true);
      setDoOp(false);
    }
  };

  const onDemote = async () => {
    if (data.role === allRoles[allRoles.indexOf(data.role) + 1]) {
      return;
    }
    try {
      const response = await axios.post(
        `${process.env.BACKEND_URL}/api/account/demote`,
        {
          userId: data.id,
          role: allRoles[allRoles.indexOf(data.role) + 1],
        },
        {
          headers: {
            Authorization: authHeader as string,
            "Content-Type": "application/json",
          },
        },
      );
      setTitle(
        response.data.status[0].toUpperCase() + response.data.status.slice(1),
      );
      setDescription(response.data.message);
      setOpen(true);
      setDoOp(false);
    } catch (error) {
      setTitle("Error");
      setDescription("Unable to demote user");
      setOpen(true);
      setDoOp(false);
    }
  };

  const onDelete = async () => {
    try {
      const response = await axios.post(
        `${process.env.BACKEND_URL}/api/account/delete`,
        {
          userId: data.id,
        },
        {
          headers: {
            Authorization: authHeader as string,
            "Content-Type": "application/json",
          },
        },
      );
      setTitle(
        response.data.status[0].toUpperCase() + response.data.status.slice(1),
      );
      setDescription(response.data.message);
      setShowCancel(false);
      setOpen(true);
      setDoOp(false);
    } catch (error) {
      setTitle("Error");
      setDescription("Unable to delete user");
      setOpen(true);
      setDoOp(false);
    }
  };

  const doesRoleExist = (promote: boolean) => {
    if (promote) {
      return allRoles[allRoles.indexOf(data.role) - 1] !== undefined;
    } else {
      return allRoles[allRoles.indexOf(data.role) + 1] !== undefined;
    }
  };

  return (
    <>
      <AlertModal
        title={title}
        description={description}
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={() => {
          if (doOp) {
            if (onConfirm === "promote") onPromote();
            if (onConfirm === "demote") onDemote();
            if (onConfirm === "delete") onDelete();

            setOpen(false);
          } else {
            setOpen(false);
            window.location.reload();
          }
        }}
        loading={loading}
        showCancel={showCancel}
      />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>

          <DropdownMenuItem
            onClick={() => {
              if (doesRoleExist(true) === false) {
                return;
              }
              setTitle("Are you sure?");
              setDescription(
                `This user will be promoted to ${
                  allRoles[allRoles.indexOf(data.role) - 1]
                }.`,
              );
              setDoOp(true);
              setOnConfirm("promote");
              setShowCancel(true);
              setOpen(true);
            }}
          >
            <ArrowUp className="mr-2 h-4 w-4" /> Promote
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => {
              if (doesRoleExist(false) === false) {
                return;
              }
              setTitle("Are you sure?");
              setDescription(
                `This user will be demoted to ${
                  allRoles[allRoles.indexOf(data.role) + 1]
                }.`,
              );
              setDoOp(true);
              setOnConfirm("demote");
              setShowCancel(true);
              setOpen(true);
            }}
          >
            <ArrowDown className="mr-2 h-4 w-4" /> Demote
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setTitle("Are you sure?");
              setDescription(`This user will be deleted.`);
              setDoOp(true);
              setOnConfirm("delete");
              setShowCancel(true);
              setOpen(true);
            }}
          >
            <Trash className="mr-2 h-4 w-4" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
