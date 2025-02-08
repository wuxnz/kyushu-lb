"use client";
import { LBUser, CompanionItem, LBMatch, LBEvent } from "@/models/models";
import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Overview } from "@/components/overview";
import { MatchHistory } from "@/components/match-history";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ArrowRightCircleIcon,
  CalendarIcon,
  ChevronRightIcon,
  HashIcon,
  MailIcon,
  UserIcon,
} from "lucide-react";
import { signOut as nextSignOut } from "next-auth/react";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import { useRouter } from "next/navigation";

import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { EventHistory } from "@/components/event-history";
import { useEffect, useState } from "react";
import Link from "next/link";

import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import { match } from "assert";
import useAxiosAuth from "@/hooks/useAxiosAuth";

export default function page() {
  const authHeader = useAuthHeader();
  const session: any = useAuthUser();
  // console.log("authHeader", authHeader);
  // console.log("session", session);
  const [user, setUser] = useState<LBUser>({} as LBUser);
  const signOut = useSignOut();
  const router = useRouter();

  const axiosAuth = useAxiosAuth();

  useEffect(() => {
    if (authHeader === null || session === null) return;
    const fetchUser = async () => {
      const response = await axiosAuth.post(
        `${process.env.BACKEND_URL}/api/account/userData`,
        {},
        {
          headers: {
            Authorization: authHeader,
            "Content-Type": "application/json",
          },
        },
      );
      const data = await response.data;
      setUser(data.data);
    };
    fetchUser();
  }, [authHeader]);

  const [recentMatch, setRecentMatch] = useState<any>([]);
  const [recentEvent, setRecentEvent] = useState<any>([]);

  // console.log(recentEvent);
  // console.log(user);
  // console.log(session);
  // const [refresh, setRefresh] = useState(true);

  // useEffect(() => {
  //   if (user === undefined) return;
  //   const fetchRecentMatch = async () => {
  //     const response = await fetch(
  //       `${process.env.BACKEND_URL}/api/match/recentMatch`,
  //       {
  //         method: "POST",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //         body: JSON.stringify({
  //           userId: user.matchHistory!![0].id,
  //         }),
  //       },
  //     );
  //     const data = await response.json();
  //     setRecentMatch(data.data);
  //   };
  //   fetchRecentMatch();
  // }, [user]);

  // const userData: any = useAuthUser();

  useEffect(() => {
    if (authHeader === null || session === null) return;
    // refresh data every 5 seconds
    // if (refresh) {
    try {
      const fetchRecentMatch = async () => {
        const response = await axiosAuth.post(
          `${process.env.BACKEND_URL}/api/account/recentMatch`,
          {},
          {
            headers: {
              Authorization: authHeader as string,
              "Content-Type": "application/json",
            },
          },
        );
        const data = await response.data;
        if (data.status === "success") {
          setRecentMatch(data.data);
          // setRefresh(false);
        }
      };
      fetchRecentMatch();

      // setTimeout(() => {
      //   setRefresh(true);
      // }, 5000);
    } catch (error) {
      // do nothing
    }
  }, [/*refresh,*/ user]);

  useEffect(() => {
    if (authHeader === null || session === null) return;
    // refresh data every 5 seconds
    // if (refresh) {
    try {
      const fetchRecentEvent = async () => {
        const response = await axiosAuth.post(
          `${process.env.BACKEND_URL}/api/account/recentEvent`,
          {
            userId: user.id,
          },
          {
            headers: {
              Authorization: authHeader as string,
              "Content-Type": "application/json",
            },
          },
        );

        const data = await response.data;

        if (data.status === "success") {
          setRecentEvent(data.data);
          // setRefresh(false);
        }
      };
      fetchRecentEvent();

      // setTimeout(() => {
      //   setRefresh(true);
      // }, 5000);
    } catch (error) {
      // do nothing
    }
  }, [/*refresh,*/ user]);

  // return <div></div>;

  return (
    <ScrollArea className="h-full">
      {session === null || user.status === undefined ? (
        <div>Loading...</div>
      ) : (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <h2 className="text-3xl font-bold tracking-tight">
              Hi, Welcome back {user?.username} 👋
            </h2>
            <div className="hidden md:flex items-center space-x-2">
              <div
                className="flex items-center space-x-2 p-2.5 border rounded-lg"
                style={{
                  border: "1px solid ##27272a",
                }}
              >
                {user?.status.toLowerCase() === "online" ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                )}
                <CardTitle className="ml-2 text-sm">{user?.status}</CardTitle>
              </div>
              <Button
                onClick={() => {
                  signOut();
                  nextSignOut({ callbackUrl: "/signin" });
                  router.push("/signin");
                }}
              >
                Log out
              </Button>
            </div>
          </div>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics" disabled>
                Analytics
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Rank</CardTitle>
                    <HashIcon className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold"># {user?.rank}</div>
                    {/* <p className="text-xs text-muted-foreground">
                    Latest Win: {user?.latestWin?.username} | Latest Loss:{" "}
                    {user?.latestLoss?.username}
                  </p> */}
                    <p className="text-xs text-muted-foreground">
                      {user?.username} is ranked {user?.rank}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Email</CardTitle>
                    <MailIcon className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{user?.email}</div>
                    <p className="text-xs text-muted-foreground">Verified</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Account Type
                    </CardTitle>
                    <UserIcon className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    {/* error here */}
                    <div className="text-2xl font-bold">
                      {user?.role[0].toUpperCase() + user?.role.slice(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {user?.role}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Created at
                    </CardTitle>
                    <CalendarIcon className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {new Date(user?.timestamp).toLocaleDateString("en-US") +
                        " " +
                        new Date(user?.timestamp).toLocaleTimeString("en-US")}
                      {/* {user?.timestamp.toString()} */}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(user?.timestamp).toLocaleDateString("en-US")}
                      {/* {user?.timestamp.toString()} */}
                    </p>
                  </CardContent>
                </Card>
              </div>
              <div className="flex flex-col space-y-4 w-full">
                <Card className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Latest Event</CardTitle>
                    <Link href="/event">See all</Link>
                  </CardHeader>
                  <CardContent>
                    {/* <Overview /> */}
                    <EventHistory event={recentEvent} />
                  </CardContent>
                </Card>
                <Card className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Latest VIP Event</CardTitle>
                    <Link href="/vip">See all</Link>
                  </CardHeader>
                  <CardContent>
                    {/* <Overview /> */}
                    <EventHistory event={null} />
                  </CardContent>
                </Card>
                <Card className="w-full">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle>Latest Match</CardTitle>
                    <Link href="/match">See all</Link>
                    {/* <CardDescription>
                    You have {user?.matchHistory?.length} recent match
                  </CardDescription> */}
                  </CardHeader>
                  <CardContent>
                    <MatchHistory
                      myUsername={user?.username}
                      matchHistory={[recentMatch] as LBMatch[]}
                    />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </ScrollArea>
  );
}
