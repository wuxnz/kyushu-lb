"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { useEffect, useState } from "react";
import Link from "next/link";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export default function LbPage() {
  const [rows, setRows] = useState([]);
  const authHeader = useAuthHeader();
  const user: any = useAuthUser();

  const axiosAuth = useAxiosAuth();

  useEffect(() => {
    if (rows.length === 0) {
      const fetchUsers = async () => {
        const response = await axiosAuth.post(
          `${process.env.BACKEND_URL}/api/account/discreteUsers`,
          {},
          {
            headers: {
              Authorization: authHeader as string,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.data;
        setRows(data.data);
      };

      fetchUsers();
    }
  }, []);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight text-center">
        Leaderboard
      </h2>
      <Table>
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Rank</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Wins</TableHead>
            <TableHead>Losses</TableHead>
            <TableHead>Latest Win</TableHead>
            <TableHead>Latest Loss</TableHead>
            <TableHead className="text-right">Win %</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((user: any) => (
            <TableRow key={user._id}>
              <TableCell className="font-medium">
                {rows.indexOf(user as never) + 1}
              </TableCell>
              <TableCell className="flex items-center">
                <img src={user.profileImage} className="w-6 mr-1" alt="" />
                <Link href={`/profile/${user.id}`}>{user.username}</Link>
              </TableCell>
              <TableCell>{user.wins}</TableCell>
              <TableCell>{user.losses}</TableCell>
              <TableCell>{user.latestWin?.username || "N/A"}</TableCell>
              <TableCell>{user.latestLoss?.username || "N/A"}</TableCell>
              <TableCell className="text-right">
                {(user.wins / (user.wins + user.losses)) * 100}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colSpan={7}>Page</TableCell>
            <TableCell className="text-right">{1}</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}
