import 'dart:convert';

import 'package:backend_v2/backend_v2.dart';
import 'package:backend_v2/data/db/db.dart';
import 'package:backend_v2/data/models/models.dart';
import 'package:crypto/crypto.dart';
import 'package:aescryptojs/aescryptojs.dart';
import 'package:dart_jsonwebtoken/dart_jsonwebtoken.dart';
import 'package:sembast/sembast.dart';
import 'package:uuid/uuid.dart';

class AccountFeatures {
  // Database? db;

  // Future<void> init() async {
  //   Database db = await DbFeatures().init();
  //   this.db = db;
  // }

  var appSecret = env["APP_SECRET"];
  var appSecret2 = env["APP_SECRET_2"];

  // Generate Default PFP
  String generateDefaultPFP() {
    return "https://api.dicebear.com/7.x/pixel-art/png?seed=${Uuid().v4()}&background=%23000000";
  }

  String secretKey =
      sha256.convert(utf8.encode("${env["APP_SECRET"]}")).toString();
  String secretKey2 =
      sha256.convert(utf8.encode("${env["APP_SECRET_2"]}")).toString();
  int minutesTillTokenExpiry = 5;
  // int minutesTillRefreshTokenExpiry = 3;
  int daysTillRefreshTokenExpiry = 7;

  // Generate Token
  Map<String, dynamic> generateToken(String userId) {
    var jwt = JWT({"id": userId});
    var tokenInfo = {
      "accessToken": jwt.sign(SecretKey(secretKey),
          expiresIn: Duration(minutes: minutesTillTokenExpiry)),
      // "tokenExpires": DateTime.now()
      //     .add(Duration(minutes: minutesTillTokenExpiry))
      //     .toIso8601String()
    };
    return tokenInfo;
  }

  // Generate Refresh Token
  Map<String, dynamic> generateRefreshToken(String userId) {
    var jwt = JWT({"id": userId});
    var tokenInfo = {
      "refreshToken": jwt.sign(SecretKey(secretKey2),
          expiresIn: Duration(days: daysTillRefreshTokenExpiry)),
      // expiresIn: Duration(minutes: minutesTillRefreshTokenExpiry)),
      // "refreshTokenExpires": DateTime.now()
      //     .add(Duration(minutes: minutesTillRefreshTokenExpiry))
      //     .toIso8601String()
    };
    return tokenInfo;
  }

  // Verify Token
  bool verifyToken(String token) {
    try {
      JWT.verify(token, SecretKey(secretKey));
      return true;
    } on JWTExpiredException {
      return false;
    } catch (err) {
      return false;
    }
  }

  // Verify Refresh Token
  bool verifyRefreshToken(String token) {
    try {
      JWT.verify(token, SecretKey(secretKey2));
      return true;
    } on JWTExpiredException {
      return false;
    } catch (err) {
      return false;
    }
  }

  // Decode Token
  User decodeToken(String token) {
    var jwt = JWT.verify(token, SecretKey(secretKey));

    var userStore = DbFeatures().getStore(Table.users.name);
    var userJson = userStore
        .findFirstSync(db!,
            finder: Finder(filter: Filter.equals("id", jwt.payload["id"])))
        ?.value;

    // ignore: unnecessary_null_comparison
    if (userJson == null) {
      throw Exception("User not found");
    }

    return User.fromJson(userJson);
  }

  // Decode Refresh Token
  User decodeRefreshToken(String token) {
    var jwt = JWT.verify(token, SecretKey(secretKey2));

    var userStore = DbFeatures().getStore(Table.users.name);
    var userJson = userStore
        .findFirstSync(db!,
            finder: Finder(filter: Filter.equals("id", jwt.payload["id"])))
        ?.value;

    // ignore: unnecessary_null_comparison
    if (userJson == null) {
      throw Exception("User not found");
    }
    return User.fromJson(userJson);
  }

  // Refresh Token
  Map<String, dynamic> refreshToken(String userId, String refreshToken) {
    var userStore = DbFeatures().getStore(Table.users.name);

    var userJson = userStore
        .findFirstSync(db!, finder: Finder(filter: Filter.equals("id", userId)))
        ?.value;

    if (userJson == null) {
      return {"status": "error", "message": "User not found", "data": null};
    }

    var user = User.fromJson(userJson);

    if (!verifyRefreshToken(refreshToken)) {
      return {
        "status": "error",
        "message": "Invalid refresh token",
        "data": null
      };
    }

    // var newRefreshToken = generateRefreshToken(user.id);
    var newToken = generateToken(user.id);

    return {
      "status": "success",
      "message": "Token refreshed",
      "data": {
        // "user": user.toJson(),
        "accessToken": newToken["accessToken"],
        // "tokenExpires": newToken["tokenExpires"],
        // "refreshToken": newRefreshToken["refreshToken"],
        // "refreshTokenExpires": newRefreshToken["refreshTokenExpires"]
      }
    };
  }

  // Encrypt Password
  String encryptPassword(String password) {
    var enc = encryptAESCryptoJS(password, secretKey);
    return enc;
  }

  // Decrypt Password
  String decryptPassword(String passwordDigest) {
    var dec = decryptAESCryptoJS(passwordDigest, secretKey);
    return dec;
  }

  // Sign Up
  Future<Map<String, dynamic>> signUp(
      String username, String email, String password) async {
    try {
      // await init();

      if (db == null) {
        throw Exception("Database not initialized");
      }

      if (logger == null) {
        throw Exception("Logger not initialized");
      }

      // add user to database

      var userStore = DbFeatures().getStore(Table.users.name);

      // create defaultRank if it doesn't exist
      if (await userStore.count(db!) == 0) {
        await userStore.add(db!, {
          "id": 0,
          "name": "defaultRank",
          "rank": 1,
        });
      }

      // var defaultUser = await userStore.findFirst(db!,
      //     finder: Finder(filter: Filter.equals('id', 0)));
      var defaultData = await userStore.findFirst(db!,
          finder: Finder(filter: Filter.equals('name', 'defaultRank')));
      var defaultRank = defaultData?.value['rank'] ?? 1;

      // check if user already exists
      var existingUser = await userStore.find(db!,
          finder: Finder(filter: Filter.equals('email', email)));
      if (existingUser.isNotEmpty) {
        throw Exception("User already exists");
      }

      // check if username is available
      var existingUsername = await userStore.find(db!,
          finder: Finder(
              filter: Filter.matchesRegExp(
                  'username', RegExp("^$username\$", caseSensitive: false))));
      if (existingUsername.isNotEmpty) {
        throw Exception("Username already exists");
      }

      var user = User(
        Uuid().v4(),
        DateTime.now(),
        username,
        email,
        encryptPassword(password),
        generateDefaultPFP(),
        defaultRank,
        UserStatus.online,
        DateTime.now(),
        Role.user,
        0,
        0,
        null,
        null,
        null,
        [],
        [],
      );

      // create log
      var initUser = DiscreteUser.fromJson(user.toJson());
      LBEvent event = LBEvent(
        Uuid().v4(),
        DateTime.now(),
        "User ${user.username} signed up on ${user.timestamp} and was assigned rank ${user.rank}",
        EventType.join,
        initUser,
        initUser,
        null,
        null,
        Table.users,
        user.id,
      );
      logger!.log(event);

      // add companion item to user eventHistory
      CompanionItem companionItem = CompanionItem(
        Table.logs,
        event.id,
      );

      // add user to database
      userStore.add(db!, user.toJson());

      var newEventHistory = [...user.eventHistory, companionItem.toJson()];

      // add companion item to user eventHistory
      userStore.update(db!, {'eventHistory': newEventHistory},
          finder: Finder(filter: Filter.equals('id', user.id)));

      // generate token
      // var token = generateToken(user);

      // increment default rank
      userStore.record(1).update(db!, {'rank': defaultRank + 1});

      return {
        'status': 'success',
        'message': 'Account created successfully',
        'data': null
        // 'data': token
      };
    } catch (err) {
      return {'status': 'error', 'message': err.toString(), 'data': null};
    }
  }

  // Sign In
  Future<Map<String, dynamic>> signIn(String email, String password) async {
    // try {
    // await init();
    if (db == null) {
      throw Exception("Database not initialized");
    }

    // check if user exists

    var userStore = DbFeatures().getStore(Table.users.name);
    var user = await userStore
        .findFirst(db!, finder: Finder(filter: Filter.equals('email', email)))
        .then((value) => value?.value);

    if (user == null) {
      throw Exception("User not found");
    }

    // check if password is correct

    if (decryptPassword(user['password']) != password) {
      throw Exception("Invalid username or password");
    }

    // generate token
    var token = generateToken(user['id']);

    // generate refresh token
    var refreshToken = generateRefreshToken(user['id']);

    // print("token: $token");

    // create log
    var initUser = DiscreteUser.fromJson(user);
    LBEvent event = LBEvent(
      Uuid().v4(),
      DateTime.now(),
      "User ${user['username']} signed in on ${DateTime.now()}",
      EventType.join,
      initUser,
      initUser,
      null,
      null,
      Table.users,
      user['id'],
    );
    logger!.log(event);

    // Add companion item to user eventHistory
    CompanionItem companionItem = CompanionItem(
      Table.logs,
      event.id,
    );

    var newEventHistory = [...user['eventHistory'], companionItem.toJson()];

    // add companion item to user
    await userStore.update(db!, {'eventHistory': newEventHistory},
        finder: Finder(filter: Filter.equals('id', user['id'])));

    var discreteUser = DiscreteUser.fromJson(user);

    return {
      'status': 'success',
      'message': 'Sign in successful',
      'data': {
        'user': discreteUser.toJson(),
        'accessToken': token['accessToken'],
        // 'tokenExpires': token['tokenExpires'],
        'refreshToken': refreshToken['refreshToken'],
        // 'refreshTokenExpires': refreshToken['refreshTokenExpires'],
      },
    };
    // } catch (err) {
    //   return {'status': 'error', 'message': err.toString(), 'data': null};
    // }
  }

  // Match history

  // Get users most recent match
  Future<Map<String, dynamic>> getUsersMostRecentMatch(String userId) async {
    // try {
    // await init();
    if (db == null) {
      throw Exception("Database not initialized");
    }

    var userStore = DbFeatures().getStore(Table.users.name);

    var user = await userStore
        .findFirst(db!, finder: Finder(filter: Filter.equals('id', userId)))
        .then((value) => value?.value);

    var recentMatchRaw = ((user?['matchHistory'] ?? []) as List).lastOrNull;

    if (recentMatchRaw == null) {
      return {'status': 'error', 'message': 'No recent matches', 'data': []};
    }

    var matchesStore = DbFeatures().getStore(Table.matches.name);
    var recentMatch = await matchesStore
        .findFirst(db!,
            finder: Finder(filter: Filter.equals('id', recentMatchRaw['id'])))
        .then((value) => value?.value);

    if (recentMatch == null) {
      return {'status': 'error', 'message': 'Match not found', 'data': []};
    }

    return {'status': 'success', 'message': 'User found', 'data': recentMatch};
    // } catch (err) {
    //   return {'status': 'error', 'message': err.toString(), 'data': null};
    // }
  }

  // Get users most recent event
  Future<Map<String, dynamic>> getUsersMostRecentEvent(String userId) async {
    // try {
    // await init();
    if (db == null) {
      throw Exception("Database not initialized");
    }

    var userStore = DbFeatures().getStore(Table.users.name);

    var user = await userStore
        .findFirst(db!, finder: Finder(filter: Filter.equals('id', userId)))
        .then((value) => value?.value);

    if (user == null) {
      return {'status': 'error', 'message': 'User not found', 'data': []};
    }

    var logsStore = DbFeatures().getStore(Table.logs.name);

    var recentLog = await logsStore
        .findFirst(db!,
            finder: Finder(
                filter: Filter.equals('id', user['eventHistory']?.last['id'])))
        .then((value) => value?.value);

    if (recentLog == null) {
      return {'status': 'error', 'message': 'Log not found', 'data': []};
    }

    return {'status': 'success', 'message': 'User found', 'data': recentLog};
    // } catch (err) {
    //   return {'status': 'error', 'message': err.toString(), 'data': null};
    // }
  }

  // Get discrete user
  Future<Map<String, dynamic>> getUserDiscrete(User user, String userId) async {
    // try {
    if (db == null) {
      throw Exception("Database not initialized");
    }

    var userStore = DbFeatures().getStore(Table.users.name);
    var userRaw = await userStore
        .findFirst(db!, finder: Finder(filter: Filter.equals('id', userId)))
        .then((value) => value?.value);

    if (userRaw == null) {
      return {'status': 'error', 'message': 'User not found', 'data': null};
    }

    return {
      'status': 'success',
      'message': 'User found',
      'data': DiscreteUser.fromJson(userRaw)
    };
    // } catch (err) {
    //   return {'status': 'error', 'message': err.toString(), 'data': null};
    // }
  }

  // Get all users
  Future<Map<String, dynamic>> getAllUsersDiscrete(User user,
      {bool playersOnly = true}) async {
    // try {
    if (db == null) {
      throw Exception("Database not initialized");
    }

    var rolesAllowedToGetAll = [
      'Admin',
      'Owner',
      'Developer',
    ];

    var userStore = DbFeatures().getStore(Table.users.name);

    if (playersOnly == true) {
      if (rolesAllowedToGetAll.contains(user.role.name)) {
        var users = await userStore
            .find(db!,
                finder: Finder(
                    filter: Filter.or(
                  [
                    Filter.equals('role', 'User'),
                    Filter.equals('role', 'Vip'),
                    Filter.equals('role', 'Moderator'),
                    Filter.equals('role', 'Owner'),
                    Filter.equals('role', 'Admin'),
                    Filter.equals('role', 'Developer'),
                  ],
                )))
            .then((value) => value.map((e) => e.value).toList());

        if (users.isEmpty) {
          return {'status': 'error', 'message': 'User not found', 'data': []};
        }

        List<DiscreteUser> discreteUsers = [];

        for (var user in users) {
          discreteUsers.add(DiscreteUser.fromJson(user));
        }

        return {
          'status': 'success',
          'message': 'User found',
          'data': discreteUsers
        };
      } else {
        return {'status': 'error', 'message': 'Unauthorized', 'data': []};
      }
    } else {
      var users = await userStore
          .find(db!,
              finder: Finder(
                filter: Filter.or(
                  [
                    Filter.equals('role', 'User'),
                    Filter.equals('role', 'Vip'),
                    Filter.equals('role', 'Moderator'),
                  ],
                ),
              ))
          .then((value) => value.map((e) => e.value).toList());

      if (users.isEmpty) {
        return {'status': 'error', 'message': 'User not found', 'data': []};
      }

      List<DiscreteUser> discreteUsers = [];

      for (var user in users) {
        discreteUsers.add(DiscreteUser.fromJson(user));
      }

      return {
        'status': 'success',
        'message': 'User found',
        'data': discreteUsers
      };
    }
  }
  // } catch (err) {
  //   return {'status': 'error', 'message': err.toString(), 'data': null};
  // }

  // Get user from token
  Future<Map<String, dynamic>> getAccountInfoFromToken(String token) async {
    // try {
    if (db == null) {
      throw Exception("Database not initialized");
    }

    var user = decodeToken(token);

    return {
      'status': 'success',
      'message': 'User found',
      'data': user.toJson()
    };
    // } catch (err) {
    //   return {'status': 'error', 'message': err.toString(), 'data': null};
    // }
  }

  // Promote User
  Future<Map<String, dynamic>> promoteUser(
      String token, String userId, String role) async {
    // try {
    if (db == null) {
      throw Exception("Database not initialized");
    }

    var user = decodeToken(token);

    var rolesAllowedToPromote = [
      'Admin',
      'Owner',
      'Developer',
    ];

    var allRoles = Role.values.map((e) => e.name).toList();

    if (!rolesAllowedToPromote.contains(user.role.name) ||
        !allRoles.contains(role) ||
        allRoles.indexOf(role) <= allRoles.indexOf(user.role.name)) {
      return {'status': 'error', 'message': 'Unauthorized', 'data': null};
    }

    var userStore = DbFeatures().getStore(Table.users.name);

    var userRaw = await userStore
        .findFirst(db!, finder: Finder(filter: Filter.equals('id', userId)))
        .then((value) => value?.value);

    if (userRaw == null) {
      return {'status': 'error', 'message': 'User not found', 'data': null};
    }

    var companionId = const Uuid().v4();

    var event = LBEvent(
      const Uuid().v4(),
      DateTime.now(),
      'User ${user.username} promoted ${userRaw['username']} to $role',
      EventType.promoteUser,
      DiscreteUser.fromJson(user.toJson()),
      DiscreteUser.fromJson(userRaw),
      null,
      null,
      Table.logs,
      companionId,
    );

    var companionItem = CompanionItem(
      Table.logs,
      companionId,
    );

    logger?.log(event);

    // Update target user
    await userStore
        .update(
          db!,
          {
            'eventHistory': [
              ...userRaw['eventHistory'],
              companionItem.toJson()
            ],
            'role': role
          },
          finder: Finder(filter: Filter.equals('id', userId)),
        )
        .then((value) => value);

    var initUserJson = user.toJson();

    // Update user
    await userStore
        .update(
          db!,
          {
            'eventHistory': [
              ...initUserJson['eventHistory'],
              companionItem.toJson()
            ]
          },
          finder: Finder(filter: Filter.equals('id', user.id)),
        )
        .then((value) => value);

    return {
      'status': 'success',
      'message': 'User promoted to $role',
      'data': null
    };
  }

  // Demote User
  Future<Map<String, dynamic>> demoteUser(
      String token, String userId, String role) async {
    // try {
    if (db == null) {
      throw Exception("Database not initialized");
    }

    var user = decodeToken(token);

    var rolesAllowedToDemote = [
      'Admin',
      'Owner',
      'Developer',
    ];

    var allRoles = Role.values.map((e) => e.name).toList();

    if (!rolesAllowedToDemote.contains(user.role.name) ||
        !allRoles.contains(role) ||
        allRoles.indexOf(role) <= (allRoles.indexOf(user.role.name) + 1)) {
      return {'status': 'error', 'message': 'Unauthorized', 'data': null};
    }

    var userStore = DbFeatures().getStore(Table.users.name);

    var userRaw = await userStore
        .findFirst(db!, finder: Finder(filter: Filter.equals('id', userId)))
        .then((value) => value?.value);

    if (userRaw == null) {
      return {'status': 'error', 'message': 'User not found', 'data': null};
    }

    var companionId = const Uuid().v4();

    var event = LBEvent(
      const Uuid().v4(),
      DateTime.now(),
      'User ${user.username} promoted ${userRaw['username']} to $role',
      EventType.promoteUser,
      DiscreteUser.fromJson(user.toJson()),
      DiscreteUser.fromJson(userRaw),
      null,
      null,
      Table.logs,
      companionId,
    );

    var companionItem = CompanionItem(
      Table.logs,
      companionId,
    );

    logger?.log(event);

    // Update target user
    await userStore
        .update(
          db!,
          {
            'eventHistory': [
              ...userRaw['eventHistory'],
              companionItem.toJson()
            ],
            'role': role
          },
          finder: Finder(filter: Filter.equals('id', userId)),
        )
        .then((value) => value);

    var initUserJson = user.toJson();

    // Update user
    await userStore
        .update(
          db!,
          {
            'eventHistory': [
              ...initUserJson['eventHistory'],
              companionItem.toJson()
            ]
          },
          finder: Finder(filter: Filter.equals('id', user.id)),
        )
        .then((value) => value);

    return {
      'status': 'success',
      'message': 'User demoted to $role',
      'data': null
    };
  }

  // Delete User
  Future<Map<String, dynamic>> deleteUser(String token, String userId) async {
    // try {
    if (db == null) {
      throw Exception("Database not initialized");
    }

    var user = decodeToken(token);

    var rolesAllowedToDelete = [
      'Owner',
      'Developer',
    ];

    if (!rolesAllowedToDelete.contains(user.role.name)) {
      return {'status': 'error', 'message': 'Unauthorized', 'data': null};
    }

    var userStore = DbFeatures().getStore(Table.users.name);

    var userRaw = await userStore
        .findFirst(db!, finder: Finder(filter: Filter.equals('id', userId)))
        .then((value) => value?.value);

    if (userRaw == null) {
      return {'status': 'error', 'message': 'User not found', 'data': null};
    }

    var companionId = const Uuid().v4();

    var event = LBEvent(
      const Uuid().v4(),
      DateTime.now(),
      'User ${user.username} deleted ${userRaw['username']}',
      EventType.deleteUser,
      DiscreteUser.fromJson(user.toJson()),
      DiscreteUser.fromJson(userRaw),
      null,
      null,
      Table.logs,
      companionId,
    );

    var companionItem = CompanionItem(
      Table.logs,
      companionId,
    );

    logger?.log(event);

    var initUserUpdate = user.toJson();

    // initUserUpdate['eventHistory'] = [
    //   ...userRaw['eventHistory'],
    //   companionItem.toJson()
    // ];

    // Update user
    await userStore
        .update(
          db!,
          {
            'eventHistory': [
              ...initUserUpdate['eventHistory'],
              companionItem.toJson()
            ],
          },
          finder: Finder(filter: Filter.equals('id', user.id)),
        )
        .then((value) => value);

    // Delete user
    await userStore
        .delete(
          db!,
          finder: Finder(filter: Filter.equals('id', userId)),
        )
        .then((value) => value);

    return {'status': 'success', 'message': 'User deleted', 'data': null};
    // } catch (err) {
    //   return {'status': 'error', 'message': err.toString(), 'data': null};
    // }
  }

  // Update Profile
  Future<Map<String, dynamic>> updateProfile(String token,
      {String? username,
      String? email,
      String? password,
      String? confirmPassword,
      String? profileImage}) async {
    // try {
    if (db == null) {
      throw Exception("Database not initialized");
    }

    var user = decodeToken(token);

    var userStore = DbFeatures().getStore(Table.users.name);

    var userRaw = await userStore
        .findFirst(db!, finder: Finder(filter: Filter.equals('id', user.id)))
        .then((value) => value?.value);

    if (userRaw == null) {
      return {'status': 'error', 'message': 'User not found', 'data': null};
    }

    var companionId = const Uuid().v4();

    var event = LBEvent(
      const Uuid().v4(),
      DateTime.now(),
      'User ${user.username} updated ${userRaw['username']}',
      EventType.updateProfile,
      DiscreteUser.fromJson(user.toJson()),
      DiscreteUser.fromJson(userRaw),
      null,
      null,
      Table.logs,
      companionId,
    );

    logger?.log(event);

    var companionItem = CompanionItem(
      Table.logs,
      companionId,
    );

    var initUserUpdate = user.toJson();

    // Update user
    await userStore
        .update(
          db!,
          {
            'eventHistory': [
              ...initUserUpdate['eventHistory'],
              companionItem.toJson()
            ],
            'username': username ?? userRaw['username'],
            'email': email ?? userRaw['email'],
            'password': password == confirmPassword && password != null
                ? encryptPassword(password)
                : userRaw['password'],
            'profileImage': profileImage ?? userRaw['profileImage'],
          },
          finder: Finder(filter: Filter.equals('id', user.id)),
        )
        .then((value) => value);

    return {'status': 'success', 'message': 'User updated', 'data': null};
  }
}
