enum Status {
  ONLINE = "Online",
  OFFLINE = "Offline",
  AFK = "AFK",
}

enum Role {
  DEVELOPER = "Developer",
  OWNER = "Owner",
  ADMIN = "Admin",
  MODERATOR = "Moderator",
  VIP = "Vip",
  USER = "User",
}
interface DiscreteUser {
  id: string;
  username: string;
  profileImage: string;
  rank: number;
  role: string;
}

enum EventType {
  JOIN = "Join",
  LEAVE = "Leave",
  MESSAGE = "Message",
  KICK = "Kick",
  BAN = "Ban",
  UNBAN = "Unban",
  CHALLENGE = "Challenge",
  ACCEPT_CHALLENGE = "AcceptChallenge",
  DECLINE_CHALLENGE = "DeclineChallenge",
  INVALIDATE_CHALLENGE = "InvalidateChallenge",
  START_MATCH = "StartMatch",
  END_MATCH = "EndMatch",
  SUBMIT_MATCH_RESULT_PROOF = "SubmitMatchResultProof",
  MATCH_RESULT = "MatchResult",
  DISPUTE_MATCH_RESULT = "DisputeMatchResult",
  INVALIDATE_MATCH = "InvalidateMatch",
  RANK_UP = "RankUp",
  RANK_DOWN = "RankDown",
  EDIT_PROFILE = "EditProfile",
  EDIT_RANK = "EditRank",
  PROMOTE_USER = "PromoteUser",
  DEMOTE_USER = "DemoteUser",
  REPORT_USER = "ReportUser",
  REQUEST_HELP = "RequestHelp",
  ACCEPT_REQUEST_HELP = "AcceptRequest",
  ASSIGNED_TO_MATCH = "AssignedToMatch",
}
interface LBEvent {
  id: string;
  timestamp: string | null;
  message: string;
  type: string;
  initUser: DiscreteUser;
  targetUser: DiscreteUser;
  affectedModerator: DiscreteUser | null;
  affectedAdmin: DiscreteUser | null;
  companionId: string | null;
}

enum MatchStatus {
  STARTED = "Started",
  PENDING = "Awaiting Result",
  ENDED = "Ended",
  DISPUTED = "Disputed",
  INVALIDATED = "Invalidated",
}

enum MatchResult {
  CHALLENGER_WIN = "Challenger Win",
  CHALLENGED_WIN = "Challenged Win",
  TIE = "Tie",
  INVALID = "Invalid",
  PENDING = "Pending",
  PENDING_REVIEW = "Pending Review",
  DISPUTED = "Disputed",
}

interface LBMatch {
  challenger: DiscreteUser;
  challenged: DiscreteUser;
  moderator: DiscreteUser;
  admin: DiscreteUser;
  status: MatchStatus;
  result: MatchResult;
  timestamp: string;
  isMandatory: boolean;
  isTopCut: boolean;
  expiresAt: string | null;
  challengerProof: Array<string>;
  challengedProof: Array<string>;
}

enum VIPEventType {
  DONATE = "Donate",
  CONTRIBUTE = "Contribute",
  FOUND_BUG = "FoundBug",
  REPORT_BUG = "ReportBug",
  REQUEST_FEATURE = "RequestFeature",
  REPORT_FEATURE = "ReportFeature",
}

interface LBVIPEvent extends Omit<LBEvent, "eventType"> {
  eventType: VIPEventType;
}

enum TableType {
  USERS = "users",
  MATCHES = "matches",
  LOGS = "logs",
  TASKS = "tasks",
}

interface CompanionItem {
  TableType: TableType;
  id: string;
}

interface LBUser {
  id: string;
  timestamp: string;
  email: string;
  username: string;
  password: string;
  profileImage: string;
  rank: number;
  status: Status;
  lastSeen: string;
  role: Role;
  wins: number;
  losses: number;
  mandatoryChallengeImmunity: string | null;
  latestWin: DiscreteUser | null;
  latestLoss: DiscreteUser | null;
  eventHistory: CompanionItem[] | null;
  matchHistory: CompanionItem[] | null;
}

export { EventType, Status, Role, MatchStatus, MatchResult, VIPEventType };
export type {
  LBEvent,
  LBMatch,
  DiscreteUser,
  LBVIPEvent,
  CompanionItem,
  LBUser,
};
