import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LBEvent } from "@/models/models";

interface HistoryProps {
  event: LBEvent | null | undefined;
}

export function EventHistory({ event }: HistoryProps) {
  // console.log(event);

  var onThenYearRegex = /\d{4}-\d{2}-\d{2}.*\d{2}:\d{2}:\d{2}.\d{6}/;

  const findOnThenYearInStringAndFormatIt = (message: string): string => {
    const onThenYear = message.match(onThenYearRegex);
    var onThenYearFormatted = "";
    if (onThenYear != null) {
      onThenYearFormatted =
        new Date(onThenYear[0]).toLocaleDateString("en-US") +
        " " +
        new Date(onThenYear[0]).toLocaleTimeString("en-US");
      return message.replace(onThenYear[0], onThenYearFormatted);
    }
    return message;
  };

  if (event == null || event == undefined || event.initUser == null)
    return <></>;
  return (
    <div className="space-y-8">
      <div className="flex items-center">
        <Avatar className="h-9 w-9">
          <AvatarImage src={event.initUser.profileImage} alt="Avatar" />
          <AvatarFallback>{event.initUser.username.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div className="ml-4 space-y-1">
          <p className="text-sm font-medium leading-none">
            {findOnThenYearInStringAndFormatIt(event.message)}
          </p>
          <p className="text-sm text-muted-foreground">
            Created by: {event.initUser.username}
          </p>
        </div>
        <div className="ml-auto font-medium">
          {event.timestamp != null
            ? new Date(event.timestamp).toLocaleDateString("en-US") +
              " " +
              new Date(event.timestamp).toLocaleTimeString("en-US")
            : "N/A"}
        </div>
      </div>
      {/* {eventHistory.length == 0 && (
        <p className="text-sm text-muted-foreground">No events found</p>
      )} */}
    </div>
  );
}
