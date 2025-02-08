import 'dart:math';

import 'package:backend_v2/backend_v2.dart';
import 'package:backend_v2/data/db/db.dart';
import 'package:backend_v2/data/models/models.dart';
import 'package:sembast/sembast.dart';
import 'package:uuid/uuid.dart';

class LBFeatures {
  int mandatoryChallengeRange = 2;
  int mandatoryChallengeTopCutRanks = 5;
  int daysToPlayMandatoryChallenge = 2;
  int daysToPlayMandatoryChallengeTopCut = 3;
  int daysBeforeAnotherMandatoryChallenge = 3;
  int daysBeforeAnotherMandatoryChallengeTopCut = 4;
  // Database? db;

  // LBFeatures() {
  //   DbFeatures().init().then((value) {
  //     db = value;
  //   });
  // }

  bool isTopCut(int challengerRank, int challengedRank) {
    return challengerRank <= mandatoryChallengeTopCutRanks &&
        challengedRank <= mandatoryChallengeTopCutRanks;
  }

  bool isMandatoryChallenge(int challengerRank, int challengedRank) {
    return isTopCut(challengerRank, challengedRank)
        ? true
        : challengerRank < challengedRank &&
            challengerRank - challengedRank <= mandatoryChallengeRange;
  }

  Future<void> expireChallenge(String companionId) async {
    if (db == null) {
      throw Exception("Database not initialized");
    }

    if (logger == null) {
      throw Exception("Logger not initialized");
    }

    var store = DbFeatures().getStore(Table.matches.name);
    var match = await store
        .findFirst(db!,
            finder: Finder(filter: Filter.equals('id', companionId)))
        .then((value) => value?.value);

    if (match == null) {
      throw Exception("Match not found");
    }

    var matchParsed = LBMatch.fromJson(match);
    matchParsed.status = MatchStatus.expired;
    matchParsed.result = MatchResult.pendingReview;
    matchParsed.modifiedAt = DateTime.now();

    await store.update(db!, matchParsed.toJson(),
        finder: Finder(filter: Filter.equals('id', companionId)));

    // create log
    var initUser = DiscreteUser(
      matchParsed.challenger.id,
      matchParsed.challenger.timestamp,
      matchParsed.challenger.username,
      matchParsed.challenger.profileImage,
      matchParsed.challenger.rank,
      matchParsed.challenger.role,
      matchParsed.challenger.status,
      wins: matchParsed.challenger.wins,
      losses: matchParsed.challenger.losses,
    );
    var targetUser = DiscreteUser(
      matchParsed.challenged.id,
      matchParsed.challenged.timestamp,
      matchParsed.challenged.username,
      matchParsed.challenged.profileImage,
      matchParsed.challenged.rank,
      matchParsed.challenged.role,
      matchParsed.challenged.status,
      wins: matchParsed.challenged.wins,
      losses: matchParsed.challenged.losses,
    );
    var affectedModerator = DiscreteUser(
      matchParsed.moderator.id,
      matchParsed.moderator.timestamp,
      matchParsed.moderator.username,
      matchParsed.moderator.profileImage,
      matchParsed.moderator.rank,
      matchParsed.moderator.role,
      matchParsed.moderator.status,
      wins: matchParsed.moderator.wins,
      losses: matchParsed.moderator.losses,
    );
    var affectedAdmin = DiscreteUser(
      matchParsed.admin.id,
      matchParsed.admin.timestamp,
      matchParsed.admin.username,
      matchParsed.admin.profileImage,
      matchParsed.admin.rank,
      matchParsed.admin.role,
      matchParsed.admin.status,
      wins: matchParsed.admin.wins,
      losses: matchParsed.admin.losses,
    );

    LBEvent event = LBEvent(
      Uuid().v4(),
      DateTime.now(),
      "Match between ${matchParsed.challenger.username} and ${matchParsed.challenged.username} has expired",
      EventType.expireMatch,
      initUser,
      targetUser,
      affectedModerator,
      affectedAdmin,
      Table.matches,
      matchParsed.id,
    );
    logger!.log(event);

    // add companion item to user eventHistory
    CompanionItem companionEvent = CompanionItem(
      Table.logs,
      event.id,
    );

    // add companion item to user
    var userStore = DbFeatures().getStore(Table.users.name);
    var challenger = await userStore
        .findFirst(db!,
            finder:
                Finder(filter: Filter.equals('id', matchParsed.challenger.id)))
        .then((value) => value?.value);
    var challenged = await userStore
        .findFirst(db!,
            finder:
                Finder(filter: Filter.equals('id', matchParsed.challenged.id)))
        .then((value) => value?.value);
    var moderator = await userStore
        .findFirst(db!,
            finder:
                Finder(filter: Filter.equals('id', matchParsed.moderator.id)))
        .then((value) => value?.value);
    var admin = await userStore
        .findFirst(db!,
            finder: Finder(filter: Filter.equals('id', matchParsed.admin.id)))
        .then((value) => value?.value);

    var newChallengerEventHistory = [
      ...challenger!['eventHistory'],
      companionEvent.toJson()
    ];
    var newChallengedEventHistory = [
      ...challenged!['eventHistory'],
      companionEvent.toJson()
    ];
    var newModeratorEventHistory = [
      ...moderator!['eventHistory'],
      companionEvent.toJson()
    ];
    var newAdminEventHistory = [
      ...admin!['eventHistory'],
      companionEvent.toJson()
    ];

    userStore.update(db!, {"eventHistory": newChallengerEventHistory},
        finder: Finder(filter: Filter.equals('id', matchParsed.challenger.id)));
    userStore.update(db!, {"eventHistory": newChallengedEventHistory},
        finder: Finder(filter: Filter.equals('id', matchParsed.challenged.id)));
    userStore.update(db!, {"eventHistory": newModeratorEventHistory},
        finder: Finder(filter: Filter.equals('id', matchParsed.moderator.id)));
    userStore.update(db!, {"eventHistory": newAdminEventHistory},
        finder: Finder(filter: Filter.equals('id', matchParsed.admin.id)));
  }

  Future<Map<String, dynamic>> challenge(
      String challengerId, String challengedId) async {
    if (db == null) {
      throw Exception("Database not initialized");
    }

    if (scheduler == null) {
      throw Exception("Scheduler not initialized");
    }

    if (logger == null) {
      throw Exception("Logger not initialized");
    }

    var userStore = DbFeatures().getStore(Table.users.name);

    // get users
    var challenger = await userStore
        .findFirst(db!,
            finder: Finder(filter: Filter.equals('id', challengerId)))
        .then(
          (value) => value?.value,
        );
    var challenged = await userStore
        .findFirst(db!,
            finder: Finder(filter: Filter.equals('id', challengedId)))
        .then(
          (value) => value?.value,
        );

    if (challenger == null || challenged == null) {
      throw Exception("Challenger or challenged user not found");
    }

    // get random moderator and admin
    var moderators = await userStore.find(db!,
        finder: Finder(filter: Filter.equals('role', Role.moderator.name)));
    var admins = await userStore.find(db!,
        finder: Finder(filter: Filter.equals('role', Role.admin.name)));
    if (moderators.isEmpty || admins.isEmpty) {
      throw Exception("Moderator or admin not found");
    }

    // choose random moderator and admin
    var moderator = moderators[Random().nextInt(moderators.length)].value;
    var admin = admins[Random().nextInt(admins.length)].value;

    // create match
    bool isMandatoryMatch =
        isMandatoryChallenge(challenger['rank'], challenged['rank']);
    bool isTopCutMatch = isTopCut(challenger['rank'], challenged['rank']);

    var matchId = Uuid().v4();

    LBMatch match = LBMatch(
      matchId,
      DateTime.now(),
      DateTime.now(),
      DiscreteUser.fromJson(challenger),
      DiscreteUser.fromJson(challenged),
      DiscreteUser.fromJson(moderator),
      DiscreteUser.fromJson(admin),
      MatchStatus.pending,
      MatchResult.pending,
      isMandatoryMatch,
      isTopCutMatch,
      isMandatoryMatch
          ? isTopCutMatch
              ? DateTime.now()
                  .add(Duration(days: daysToPlayMandatoryChallengeTopCut))
              : DateTime.now().add(Duration(days: daysToPlayMandatoryChallenge))
          : null,
      [],
      [],
    );

    // schedule match expiration
    if (isMandatoryMatch) {
      scheduler!.scheduleTask(LBTask(
          Uuid().v4(),
          DateTime.now(),
          DateTime.now(),
          match.expiresAt!,
          // DateTime.now().add(Duration(seconds: 30)),
          TaskType.singleExec,
          TaskStatus.pending,
          "Expire Match",
          "Expire match $matchId: ${challenger['username']} vs ${challenged['username']}",
          null,
          CallbackInfo(
            'lb',
            'expireMatch',
            {'companionId': matchId},
          )));
    }

    // save match
    var matchStore = DbFeatures().getStore(Table.matches.name);
    await matchStore.add(db!, match.toJson());

    // create companion items
    var companionItem = CompanionItem(
      Table.matches,
      matchId,
    );

    // add companion item to users' matchHistory
    var updatedChallengerMatchHistory = [
      ...challenger['matchHistory'] ?? [],
      companionItem.toJson()
    ];
    var updatedChallengedMatchHistory = [
      ...challenged['matchHistory'] ?? [],
      companionItem.toJson()
    ];
    var updatedModeratorMatchHistory = [
      ...moderator['matchHistory'] ?? [],
      companionItem.toJson()
    ];
    var updatedAdminMatchHistory = [
      ...admin['matchHistory'] ?? [],
      companionItem.toJson()
    ];

    // add companion item to users
    await userStore.update(db!, {'matchHistory': updatedChallengerMatchHistory},
        finder: Finder(filter: Filter.equals('id', challenger['id'])));
    await userStore.update(db!, {'matchHistory': updatedChallengedMatchHistory},
        finder: Finder(filter: Filter.equals('id', challenged['id'])));
    await userStore.update(db!, {'matchHistory': updatedModeratorMatchHistory},
        finder: Finder(filter: Filter.equals('id', moderator['id'])));
    await userStore.update(db!, {'matchHistory': updatedAdminMatchHistory},
        finder: Finder(filter: Filter.equals('matchHistory', admin['id'])));

    // create log
    var initUser = DiscreteUser.fromJson(challenger);
    var targetUser = DiscreteUser.fromJson(challenged);
    var affectedModerator = DiscreteUser.fromJson(moderator);
    var affectedAdmin = DiscreteUser.fromJson(admin);
    LBEvent event = LBEvent(
      Uuid().v4(),
      DateTime.now(),
      "Match created on ${match.timestamp.toIso8601String()} between ${challenger['username']} and ${challenged['username']}",
      EventType.challenge,
      initUser,
      targetUser,
      affectedModerator,
      affectedAdmin,
      Table.matches,
      matchId,
    );
    await logger!.log(event);

    // add companion item to user eventHistory
    CompanionItem companionEvent = CompanionItem(
      Table.logs,
      event.id,
    );

    var newChallengerEventHistory = [
      ...challenger['eventHistory'],
      companionEvent.toJson()
    ];
    var newChallengedEventHistory = [
      ...challenged['eventHistory'],
      companionEvent.toJson()
    ];
    var newModeratorEventHistory = [
      ...moderator['eventHistory'],
      companionEvent.toJson()
    ];
    var newAdminEventHistory = [
      ...admin['eventHistory'],
      companionEvent.toJson()
    ];

    userStore.update(db!, {"eventHistory": newChallengerEventHistory},
        finder: Finder(filter: Filter.equals('id', match.challenger.id)));
    userStore.update(db!, {"eventHistory": newChallengedEventHistory},
        finder: Finder(filter: Filter.equals('id', match.challenged.id)));
    userStore.update(db!, {"eventHistory": newModeratorEventHistory},
        finder: Finder(filter: Filter.equals('id', match.moderator.id)));
    userStore.update(db!, {"eventHistory": newAdminEventHistory},
        finder: Finder(filter: Filter.equals('id', match.admin.id)));

    return {
      'status': 'success',
      'message': 'Match created successfully',
      'data': match.toJson(),
    };
  }
}
