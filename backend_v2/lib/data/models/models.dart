enum UserStatus {
  online,
  offline,
}

extension UserStatusExtension on UserStatus {
  String get name =>
      (toString().split('.')[1])[0].toUpperCase() +
      toString().split('.')[1].substring(1);
}

extension UserStatusExtension2 on String {
  UserStatus get toUserStatus => UserStatus
      .values[UserStatus.values.indexWhere((element) => element.name == this)];
}

enum AccountStatus {
  banned,
  active,
  suspended,
}

extension AccountStatusExtension on AccountStatus {
  String get name =>
      (toString().split('.')[1])[0].toUpperCase() +
      toString().split('.')[1].substring(1);
}

extension AccountStatusExtension2 on String {
  AccountStatus get toAccountStatus => AccountStatus.values[
      AccountStatus.values.indexWhere((element) => element.name == this)];
}

enum Role {
  developer,
  owner,
  admin,
  moderator,
  vip,
  user,
  guest,
}

extension RoleExtension on Role {
  String get name =>
      (toString().split('.')[1])[0].toUpperCase() +
      toString().split('.')[1].substring(1);
}

extension RoleExtension2 on String {
  Role get toRole =>
      Role.values[Role.values.indexWhere((element) => element.name == this)];
}

class DiscreteUser {
  String id;
  DateTime timestamp;
  String username;
  String profileImage;
  int? rank;
  Role role;
  UserStatus status = UserStatus.online;
  int wins;
  int losses;

  DiscreteUser(
    this.id,
    this.timestamp,
    this.username,
    this.profileImage,
    this.rank,
    this.role,
    this.status, {
    this.wins = 0,
    this.losses = 0,
  });

  DiscreteUser.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        timestamp = DateTime.parse(json['timestamp']),
        username = json['username'],
        profileImage = json['profileImage'],
        rank = json['rank'],
        role = (json['role'] as String).toRole,
        status = (json['status'] as String).toUserStatus,
        wins = json['wins'],
        losses = json['losses'];

  Map<String, dynamic> toJson() => {
        'id': id,
        'timestamp': timestamp.toIso8601String(),
        'username': username,
        'profileImage': profileImage,
        'rank': rank,
        'role': role.name,
        'status': status.name,
        'wins': wins,
        'losses': losses,
      };
}

enum EventType {
  join,
  leave,
  message,
  kick,
  ban,
  unban,
  challenge,
  acceptChallenge,
  declineChallenge,
  invalidateChallenge,
  startMatch,
  expireMatch,
  endMatch,
  submitMatchResultProof,
  matchResult,
  disputeMatchResult,
  invalidateMatch,
  rankUp,
  rankDown,
  editProfile,
  updateProfile,
  editRank,
  promoteUser,
  demoteUser,
  deleteUser,
  reportUser,
  requestHelp,
  acceptRequest,
  assignedToMatch,
}

extension EventTypeExtension on EventType {
  String get name =>
      (toString().split('.')[1])[0].toUpperCase() +
      (toString().split('.')[1])
          .substring(1)
          .split(RegExp(r'(?=[A-Z])'))
          .join(' ');
}

extension EventTypeExtension2 on String {
  EventType get toEventType => EventType
      .values[EventType.values.indexWhere((element) => element.name == this)];
}

enum Table {
  users,
  logs,
  matches,
  tasks,
}

extension TableExtension on Table {
  String get name =>
      (toString().split('.')[1])[0].toUpperCase() +
      toString().split('.')[1].substring(1);
}

extension TableExtension2 on String {
  Table get toTable =>
      Table.values[Table.values.indexWhere((element) => element.name == this)];
}

class LBEvent {
  String id;
  DateTime timestamp;
  String message;
  EventType type;
  DiscreteUser initUser;
  DiscreteUser targetUser;
  DiscreteUser? affectedModerator;
  DiscreteUser? affectedAdmin;
  Table companionTable;
  String companionId;

  LBEvent(
      this.id,
      this.timestamp,
      this.message,
      this.type,
      this.initUser,
      this.targetUser,
      this.affectedModerator,
      this.affectedAdmin,
      this.companionTable,
      this.companionId);

  LBEvent.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        timestamp = DateTime.parse(json['timestamp']),
        message = json['message'],
        type = json['type'].toEventType,
        initUser = DiscreteUser.fromJson(json['initUser']),
        targetUser = DiscreteUser.fromJson(json['targetUser']),
        affectedModerator = json['affectedModerator'] != null
            ? DiscreteUser.fromJson(json['affectedModerator'])
            : null,
        affectedAdmin = json['affectedAdmin'] != null
            ? DiscreteUser.fromJson(json['affectedAdmin'])
            : null,
        companionTable = json['companionTable'].toTable,
        companionId = json['companionId'];

  Map<String, dynamic> toJson() => {
        'id': id,
        'timestamp': timestamp.toIso8601String(),
        'message': message,
        'type': type.name,
        'initUser': initUser.toJson(),
        'targetUser': targetUser.toJson(),
        'affectedModerator': affectedModerator?.toJson(),
        'affectedAdmin': affectedAdmin?.toJson(),
        'companionTable': companionTable.name,
        'companionId': companionId,
      };
}

enum MatchStatus {
  pending,
  started,
  ended,
  invalidated,
  disputed,
  expired,
}

extension MatchStatusExtension on MatchStatus {
  String get name =>
      (toString().split('.')[1])[0].toUpperCase() +
      toString().split('.')[1].substring(1);
}

extension MatchStatusExtension2 on String {
  MatchStatus get toMatchStatus => MatchStatus
      .values[MatchStatus.values.indexWhere((element) => element.name == this)];
}

enum MatchResult {
  challengerWin,
  challengedWin,
  tie,
  invalid,
  pending,
  pendingReview,
  disputed,
}

extension MatchResultExtension on MatchResult {
  String get name =>
      (toString().split('.')[1])[0].toUpperCase() +
      (toString().split('.')[1])
          .substring(1)
          .split(RegExp(r'(?=[A-Z])'))
          .join(' ');
}

extension MatchResultExtension2 on String {
  MatchResult get toMatchResult => MatchResult
      .values[MatchResult.values.indexWhere((element) => element.name == this)];
}

class LBMatch {
  String id;
  DateTime timestamp;
  DateTime modifiedAt;
  DiscreteUser challenger;
  DiscreteUser challenged;
  DiscreteUser moderator;
  DiscreteUser admin;
  MatchStatus status;
  MatchResult result;
  bool isMandatory;
  bool isTopCut;
  DateTime? expiresAt;
  List<String> challengerProof;
  List<String> challengedProof;

  LBMatch(
      this.id,
      this.timestamp,
      this.modifiedAt,
      this.challenger,
      this.challenged,
      this.moderator,
      this.admin,
      this.status,
      this.result,
      this.isMandatory,
      this.isTopCut,
      this.expiresAt,
      this.challengerProof,
      this.challengedProof);

  LBMatch.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        timestamp = DateTime.parse(json['timestamp']),
        modifiedAt = DateTime.parse(json['modifiedAt']),
        challenger = DiscreteUser.fromJson(json['challenger']),
        challenged = DiscreteUser.fromJson(json['challenged']),
        moderator = DiscreteUser.fromJson(json['moderator']),
        admin = DiscreteUser.fromJson(json['admin']),
        status = (json['status'] as String).toMatchStatus,
        result = (json['result'] as String).toMatchResult,
        isMandatory = json['isMandatory'],
        isTopCut = json['isTopCut'],
        expiresAt = json['expiresAt'] != null
            ? DateTime.parse(json['expiresAt'])
            : null,
        challengerProof = json['challengerProof'].cast<String>(),
        challengedProof = json['challengedProof'].cast<String>();

  Map<String, dynamic> toJson() => {
        'id': id,
        'timestamp': timestamp.toIso8601String(),
        'modifiedAt': modifiedAt.toIso8601String(),
        'challenger': challenger.toJson(),
        'challenged': challenged.toJson(),
        'moderator': moderator.toJson(),
        'admin': admin.toJson(),
        'status': status.name,
        'result': result.name,
        'isMandatory': isMandatory,
        'isTopCut': isTopCut,
        'expiresAt': expiresAt?.toIso8601String(),
        'challengerProof': challengerProof,
        'challengedProof': challengedProof,
      };
}

class CompanionItem {
  Table table;
  String id;

  CompanionItem(this.table, this.id);

  CompanionItem.fromJson(Map<String, dynamic> json)
      : table = Table.values
            .where((element) => element.name == json['table'])
            .first,
        id = json['id'];

  Map<String, dynamic> toJson() => {
        'table': table.name,
        'id': id,
      };
}

class User {
  String id;
  DateTime timestamp;
  String username;
  String email;
  String password;
  String profileImage;
  int? rank;
  UserStatus status;
  DateTime lastSeen;
  Role role;
  int wins;
  int losses;
  DateTime? mandatoryChallengeImmunity;
  DiscreteUser? latestWin;
  DiscreteUser? latestLoss;
  List<CompanionItem> matchHistory;
  List<CompanionItem> eventHistory;

  User(
      this.id,
      this.timestamp,
      this.username,
      this.email,
      this.password,
      this.profileImage,
      this.rank,
      this.status,
      this.lastSeen,
      this.role,
      this.wins,
      this.losses,
      this.mandatoryChallengeImmunity,
      this.latestWin,
      this.latestLoss,
      this.matchHistory,
      this.eventHistory);

  User.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        timestamp = DateTime.parse(json['timestamp']),
        username = json['username'],
        email = json['email'],
        password = json['password'],
        profileImage = json['profileImage'],
        rank = json['rank'],
        status = (json['status'] as String).toUserStatus,
        lastSeen = DateTime.parse(json['lastSeen']),
        role = (json['role'] as String).toRole,
        wins = json['wins'],
        losses = json['losses'],
        mandatoryChallengeImmunity = json['mandatoryChallengeImmunity'] != null
            ? DateTime.parse(json['mandatoryChallengeImmunity'])
            : null,
        latestWin = json['latestWin'] != null
            ? DiscreteUser.fromJson(json['latestWin'])
            : null,
        latestLoss = json['latestLoss'] != null
            ? DiscreteUser.fromJson(json['latestLoss'])
            : null,
        matchHistory = List<CompanionItem>.from(
          json['matchHistory']?.map((e) => CompanionItem.fromJson(e)),
        ),
        eventHistory = List<CompanionItem>.from(
          json['eventHistory']?.map((e) => CompanionItem.fromJson(e)),
        );

  Map<String, dynamic> toJson() => {
        'id': id,
        'timestamp': timestamp.toIso8601String(),
        'username': username,
        'email': email,
        'password': password,
        'profileImage': profileImage,
        'rank': rank,
        'status': status.name,
        'lastSeen': lastSeen.toIso8601String(),
        'role': role.name,
        'wins': wins,
        'losses': losses,
        'mandatoryChallengeImmunity':
            mandatoryChallengeImmunity?.toIso8601String(),
        'latestWin': latestWin?.toJson(),
        'latestLoss': latestLoss?.toJson(),
        'matchHistory': matchHistory.map((e) => e.toJson()).toList(),
        'eventHistory': eventHistory.map((e) => e.toJson()).toList(),
      };
}

enum TaskType {
  singleExec,
  cronExec,
}

extension TaskTypeExtension on TaskType {
  String get name =>
      (toString().split('.')[1])[0].toUpperCase() +
      (toString().split('.')[1])
          .substring(1)
          .split(RegExp(r'(?=[A-Z])'))
          .join(' ');
}

extension StringToTaskType on String {
  TaskType get toTaskType {
    switch (this) {
      case 'singleExec':
        return TaskType.singleExec;
      case 'cronExec':
        return TaskType.cronExec;
      default:
        return TaskType.singleExec;
    }
  }
}

enum TaskStatus {
  pending,
  running,
  completed,
  failed,
  canceled,
  skipped,
}

extension TaskStatusExtension on TaskStatus {
  String get name =>
      (toString().split('.')[1])[0].toUpperCase() +
      (toString().split('.')[1])
          .substring(1)
          .split(RegExp(r'(?=[A-Z])'))
          .join(' ');
}

extension StringToTaskStatus on String {
  TaskStatus get toTaskStatus {
    switch (this) {
      case 'pending':
        return TaskStatus.pending;
      case 'running':
        return TaskStatus.running;
      case 'completed':
        return TaskStatus.completed;
      case 'failed':
        return TaskStatus.failed;
      case 'canceled':
        return TaskStatus.canceled;
      case 'skipped':
        return TaskStatus.skipped;
      default:
        return TaskStatus.pending;
    }
  }
}

class CallbackInfo {
  String groupId;
  String id;
  Map<String, dynamic>? args;

  CallbackInfo(this.groupId, this.id, this.args);

  CallbackInfo.fromJson(Map<String, dynamic> json)
      : groupId = json['groupId'],
        id = json['id'],
        args = json['args'] != null
            ? Map<String, dynamic>.from(json['args'])
            : null;

  Map<String, dynamic> toJson() => {
        'groupId': groupId,
        'id': id,
        'args': args,
      };
}

class LBTask {
  String id;
  DateTime timestamp;
  DateTime modifiedAt;
  DateTime runtime;
  TaskType type;
  TaskStatus status;
  String title;
  String details;
  LBEvent? event;
  CallbackInfo callback;

  LBTask(this.id, this.timestamp, this.modifiedAt, this.runtime, this.type,
      this.status, this.title, this.details, this.event, this.callback);

  LBTask.fromJson(Map<String, dynamic> json)
      : id = json['id'],
        timestamp = DateTime.parse(json['timestamp']),
        modifiedAt = DateTime.parse(json['modifiedAt']),
        runtime = DateTime.parse(json['runtime']),
        type = (json['type'] as String).toTaskType,
        status = (json['status'] as String).toTaskStatus,
        title = json['title'],
        details = json['details'],
        event = json['event'] != null ? LBEvent.fromJson(json['event']) : null,
        callback = CallbackInfo.fromJson(json['callback']);

  Map<String, dynamic> toJson() => {
        'id': id,
        'timestamp': timestamp.toIso8601String(),
        'modifiedAt': modifiedAt.toIso8601String(),
        'runtime': runtime.toIso8601String(),
        'type': type.name,
        'status': status.name,
        'title': title,
        'details': details,
        'event': event?.toJson(),
        'callback': callback.toJson(),
      };

  bool isRunning() => status == TaskStatus.running;

  bool isCompleted() => status == TaskStatus.completed;

  bool isFailed() => status == TaskStatus.failed;

  bool isCanceled() => status == TaskStatus.canceled;

  bool isSkipped() => status == TaskStatus.skipped;

  bool isPending() => status == TaskStatus.pending;

  bool isScheduled() => type == TaskType.cronExec;

  bool isSingleExec() => type == TaskType.singleExec;

  bool isCronExec() => type == TaskType.cronExec;
}
