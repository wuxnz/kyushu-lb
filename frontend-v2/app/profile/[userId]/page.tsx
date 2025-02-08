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
  Percent,
  PercentIcon,
  UserIcon,
} from "lucide-react";
import { signOut as nextSignOut } from "next-auth/react";
import useSignOut from "react-auth-kit/hooks/useSignOut";
import { useRouter } from "next/navigation";

import useAuthHeader from "react-auth-kit/hooks/useAuthHeader";
import useAuthUser from "react-auth-kit/hooks/useAuthUser";
import { EventHistory } from "@/components/event-history";
import { useEffect, useState } from "react";
import Link from "next/link";
import useAxiosAuth from "@/hooks/useAxiosAuth";
import { AlertModal } from "@/components/modal/alert-modal";
import { set } from "date-fns";

export default function page() {
  const authHeader = useAuthHeader();
  const session: any = useAuthUser();
  const user: LBUser = session?.user as LBUser;

  const axiosAuth = useAxiosAuth();

  const router = useRouter();

  const [discreteUser, setDiscreteUser] = useState<any>({});

  useEffect(() => {
    // console.log(window.location.pathname.split("/")[2]);
    try {
      const fetchDiscreteUser = async () => {
        const response = await axiosAuth.post(
          `${process.env.BACKEND_URL}/api/account/discreteUser`,
          {
            userId: window.location.pathname.split("/")[2],
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
          setDiscreteUser(data.data);
        }
      };
      fetchDiscreteUser();
    } catch (error) {}
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [modalArgs, setModalArgs] = useState<any>({});
  const challengeUser = async () => {
    const response = await axiosAuth.post(
      `${process.env.BACKEND_URL}/api/lb/challenge`,
      {
        userId: discreteUser.id,
      },
      {
        headers: {
          Authorization: authHeader as string,
          "Content-Type": "application/json",
        },
      },
    );

    const data = await response.data;

    // if (data.status === "success") {
    // alert("Challenged!");
    setModalArgs({
      title: data.status[0].toUpperCase() + data.status.slice(1),
      description: data.message,
    });
    setShowModal(true);
    // } else {
    //   alert("Challenge failed");
    // }
  };

  if (discreteUser.id === undefined) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <p>Loading...</p>
      </div>
    );
  } else {
    return (
      <ScrollArea className="h-full">
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          {showModal && (
            <AlertModal
              isOpen={showModal}
              onClose={() => setShowModal(false)}
              onConfirm={() => {
                challengeUser();
              }}
              loading={false}
              title={modalArgs.title || `Challenge ${discreteUser.username}?`}
              description={modalArgs.description || `Are you sure?`}
            />
          )}
        </div>
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
          <div className="flex items-center justify-between space-y-2">
            <div className="flex items-center space-x-4">
              <img
                src={discreteUser.profileImage}
                className="w-12 h-12"
                alt=""
              />
              <h2 className="text-3xl font-bold tracking-tight">
                {discreteUser.username.endsWith("s")
                  ? discreteUser.username + "'"
                  : discreteUser.username + "'s"}{" "}
                Profile
              </h2>
            </div>
            <div className="hidden md:flex items-center space-x-2">
              <div
                className="flex items-center space-x-2 p-2.5 border rounded-lg"
                style={{
                  border: "1px solid ##27272a",
                }}
              >
                {discreteUser.status.toLowerCase() === "online" ? (
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                ) : (
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                )}
                <CardTitle className="ml-2 text-sm">
                  {discreteUser.status}
                </CardTitle>
              </div>
              <Button onClick={() => setShowModal(true)}>Challenge</Button>
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
                    <div className="text-2xl font-bold">
                      # {discreteUser.rank}
                    </div>
                    {/* <p className="text-xs text-muted-foreground">
                      Latest Win: {discreteUser.latestWin?.username} | Latest
                      Loss: {discreteUser.latestLoss?.username}
                    </p> */}
                    <p className="text-xs text-muted-foreground">
                      {discreteUser.username} is rank {discreteUser.rank}
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Wins / Losses
                    </CardTitle>
                    <PercentIcon className="h-4 w-4" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {discreteUser.wins} / {discreteUser.losses} (
                      {Math.round(
                        (discreteUser.wins /
                          (discreteUser.wins + discreteUser.losses)) *
                          100,
                      )}
                      )
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {discreteUser.wins} Wins, {discreteUser.losses} Losses,{" "}
                      {Math.round(
                        (discreteUser.wins /
                          (discreteUser.wins + discreteUser.losses)) *
                          100,
                      )}
                      % Winrate
                    </p>
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
                    <div className="text-2xl font-bold">
                      {discreteUser.role[0].toUpperCase() +
                        discreteUser.role.slice(1)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {discreteUser.role}
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
                      {new Date(discreteUser.timestamp).toLocaleDateString(
                        "en-US",
                      ) +
                        " " +
                        new Date(discreteUser.timestamp).toLocaleTimeString(
                          "en-US",
                        )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(discreteUser.timestamp).toLocaleDateString(
                        "en-US",
                      )}
                    </p>
                  </CardContent>
                </Card>
              </div>
              {/* <div className="flex flex-col space-y-4 w-full">
              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Latest Event</CardTitle>
                  <Link href="/event">See all</Link>
                </CardHeader>
                <CardContent>
                  <Overview />
                  <EventHistory event={recentEvent} />
                </CardContent>
              </Card>
              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Latest VIP Event</CardTitle>
                  <Link href="/vip">See all</Link>
                </CardHeader>
                <CardContent>
                  <Overview />
                  <EventHistory event={null} />
                </CardContent>
              </Card>
              <Card className="w-full">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle>Latest Match</CardTitle>
                  <Link href="/match">See all</Link>
                  <CardDescription>
                    You have {discreteUser.matchHistory?.length} recent match
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MatchHistory
                    myUsername={discreteUser.username}
                    matchHistory={[recentMatch] as LBMatch[]}
                  />
                </CardContent>
              </Card>
            </div> */}
            </TabsContent>
          </Tabs>
        </div>
      </ScrollArea>
    );
  }
}
