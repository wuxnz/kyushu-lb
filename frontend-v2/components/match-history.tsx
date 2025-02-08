import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LBMatch } from "@/models/models";

interface HistoryProps {
  myUsername: string;
  matchHistory: LBMatch[];
}

export function MatchHistory({ myUsername, matchHistory }: HistoryProps) {
  // console.log(matchHistory);
  return (
    <div className="space-y-8">
      {matchHistory[0].challenger === undefined ? (
        <p className="text-sm text-muted-foreground">No matches found</p>
      ) : (
        matchHistory.map((match: LBMatch) => (
          <div className="flex items-center" key={match.timestamp}>
            <Avatar className="h-9 w-9">
              <AvatarImage
                src={
                  match.challenger.username == myUsername
                    ? match.challenged.profileImage
                    : match.challenger.profileImage
                }
                alt="Avatar"
              />
              <AvatarFallback>
                {match.challenger.username[0]}
                {match.challenged.username[0]}
              </AvatarFallback>
            </Avatar>
            <div className="ml-4 space-y-1">
              <p className="text-sm font-medium leading-none">
                {match.challenger.username} vs. {match.challenged.username}{" "}
                (Expires:{" "}
                {match.expiresAt != null
                  ? new Date(match.expiresAt).toLocaleDateString("en-US") +
                    " " +
                    new Date(match.expiresAt).toLocaleTimeString("en-US")
                  : "N/A"}
                )
              </p>
              <p className="text-sm text-muted-foreground">
                Moderator: {match.moderator.username} | Admin:{" "}
                {match.admin.username} | MT:{" "}
                {match.isMandatory ? "Mandatory" : "Optional"}
              </p>
            </div>
            <div className="ml-auto font-medium">
              {match.status} - {match.result}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
