import 'dart:convert';
import 'dart:io';

import 'package:alfred/alfred.dart';
import 'package:backend_v2/data/db/db.dart';
import 'package:backend_v2/data/models/models.dart';
import 'package:backend_v2/features/acc/account.dart';
import 'package:backend_v2/features/lb/lb.dart';
import 'package:backend_v2/services/logger/logger.dart';
import 'package:backend_v2/services/scheduler/scheduler.dart';
import 'package:dotenv/dotenv.dart';
import 'package:sembast/sembast.dart';

Future<void> authorizedRequest(HttpRequest req, HttpResponse res) async {
  // print(req.headers.value("Authorization"));
  var auth = req.headers.value("Authorization");
  if (auth == null) {
    res.statusCode = 401;
    res.write("Unauthorized");
    return;
  }

  var accountFeatures = AccountFeatures();

  String? token;
  try {
    token = auth.split(" ")[1];
  } catch (err) {
    res.statusCode = 401;
    res.write("Unauthorized");
    return;
  }

  try {
    bool validToken = accountFeatures.verifyToken(token);
    if (!validToken) {
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }
  } catch (err) {
    res.statusCode = 401;
    res.write("Unauthorized");
    return;
  }

  return;
}

Future<void> authorizedRefreshRequest(HttpRequest req, HttpResponse res) async {
  var auth = req.headers.value("Authorization");
  if (auth == null) {
    res.statusCode = 401;
    res.write("Unauthorized");
    return;
  }

  var accountFeatures = AccountFeatures();

  String? token;
  try {
    token = auth.split(" ")[1];
  } catch (err) {
    res.statusCode = 401;
    res.write("Unauthorized");
    return;
  }

  try {
    bool validToken = accountFeatures.verifyRefreshToken(token);
    if (!validToken) {
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }
  } catch (err) {
    res.statusCode = 401;
    res.write("Unauthorized");
    return;
  }

  return;
}

Database? db;
SchedulerService? scheduler;
LoggerService? logger;

var env = DotEnv(includePlatformEnvironment: false)..load();

Future<void> start() async {
  // Testing

  // var accountFeatures = AccountFeatures();
  // var encryptedPassword = accountFeatures.encryptPassword("password");
  // print(encryptedPassword);
  // var decryptedPassword = accountFeatures.decryptPassword(encryptedPassword);
  // print(decryptedPassword);

  // var encryptedPassword2 = accountFeatures.encryptPassword("password");
  // print(encryptedPassword2);
  // var decryptedPassword2 = accountFeatures.decryptPassword(encryptedPassword);
  // print(decryptedPassword2);
  // var defaultPFP = accountFeatures.generateDefaultPFP();
  // print(defaultPFP);
  // var defaultPFP2 = accountFeatures.generateDefaultPFP();
  // print(defaultPFP2);

  // init database
  var dbFeatures = DbFeatures();
  db = await dbFeatures.init();
  print("Database initialized");
  // print(db.toString());

  // init scheduler
  scheduler = SchedulerService();

  // init logger
  logger = LoggerService();

  final app = Alfred();
  const route = "/api";
  const port = 8000;

  // app.all('*', cors(origin: "http://localhost:3000"));
  app.all('*', cors(origin: "*"));

  // Default route

  app.get("$route/", (req, res) {
    res.headers.contentType = ContentType.json;
    res.send("{\"message\":\"You should not be here!\"}");
  });

  // Auth routes

  // Sign up
  app.post("$route/auth/signup", (req, res) async {
    res.headers.contentType = ContentType.json;
    var accountFeatures = AccountFeatures();
    var body = await req.bodyAsJsonMap;
    try {
      var result = await accountFeatures.signUp(
          body["username"], body["email"], body["password"]);
      if (result["status"] == "error" && result["message"] == "Unauthorized") {
        res.statusCode = 401;
        res.write("Unauthorized");
        return;
      }
      res.send(json.encode(result));
    } catch (err) {
      print(err);
      res.statusCode = 400;
      res.write("Bad request");
      return;
    }
  });

  // Sign in
  app.post("$route/auth/signin", (req, res) async {
    res.headers.contentType = ContentType.json;
    var accountFeatures = AccountFeatures();
    var body = await req.bodyAsJsonMap;
    try {
      var result =
          await accountFeatures.signIn(body["email"], body["password"]);
      if (result["status"] == "error" && result["message"] == "Unauthorized") {
        res.statusCode = 401;
        res.write("Unauthorized");
        return;
      }
      res.send(json.encode(result));
    } catch (err) {
      print(err);
      res.statusCode = 400;
      res.write("Bad request");
      return;
    }
  });

  // Refresh token
  app.post("$route/auth/refreshToken", (req, res) async {
    var body = await req.bodyAsJsonMap;
    // print(body);
    // var refreshToken = req.headers.value("Authorization")?.split(" ")[1];
    var refreshToken = body["refreshToken"];
    User? user;
    try {
      user = AccountFeatures().decodeRefreshToken(refreshToken ?? "");
    } catch (err) {
      print(err);
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }

    // print(user);

    res.headers.contentType = ContentType.json;
    var accountFeatures = AccountFeatures();
    try {
      var result = accountFeatures.refreshToken(user.id, refreshToken!);
      if (result["status"] == "error" && result["message"] == "Unauthorized") {
        res.statusCode = 401;
        res.write("Unauthorized");
        return;
      }
      res.send(json.encode(result));
    } catch (err) {
      print(err);
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }
  }, middleware: [authorizedRequest]);

  // Account routes

  // Get user most recent match
  app.post("$route/account/recentMatch", (req, res) async {
    var authToken = req.headers.value("Authorization")?.split(" ")[1];
    User? user;
    try {
      user = AccountFeatures().decodeToken(authToken ?? "");
    } catch (err) {
      print(err);
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }

    res.headers.contentType = ContentType.json;
    var accountFeatures = AccountFeatures();
    try {
      var result = await accountFeatures.getUsersMostRecentMatch(user.id);
      if (result["status"] == "error" && result["message"] == "Unauthorized") {
        res.statusCode = 401;
        res.write("Unauthorized");
        return;
      }
      res.send(json.encode(result));
    } catch (err) {
      print(err);
      res.statusCode = 500;
      res.write("Internal Server Error");
      return;
    }
  }, middleware: [authorizedRequest]);

  // Get user most recent event
  app.post("$route/account/recentEvent", (req, res) async {
    var authToken = req.headers.value("Authorization")?.split(" ")[1];
    User? user;
    try {
      user = AccountFeatures().decodeToken(authToken ?? "");
    } catch (err) {
      print(err);
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }

    res.headers.contentType = ContentType.json;
    var accountFeatures = AccountFeatures();
    try {
      var result = await accountFeatures.getUsersMostRecentEvent(user.id);
      if (result["status"] == "error" && result["message"] == "Unauthorized") {
        res.statusCode = 401;
        res.write("Unauthorized");
        return;
      }
      res.send(json.encode(result));
    } catch (err) {
      print(err);
      res.statusCode = 500;
      res.write("Internal Server Error");
      return;
    }
  }, middleware: [authorizedRequest]);

  // Get discrete user
  app.post("$route/account/discreteUser", (req, res) async {
    var authToken = req.headers.value("Authorization")?.split(" ")[1];
    User? user;
    try {
      user = AccountFeatures().decodeToken(authToken ?? "");
    } catch (err) {
      print(err);
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }

    res.headers.contentType = ContentType.json;
    var accountFeatures = AccountFeatures();
    var body = await req.bodyAsJsonMap;

    if (body["userId"] == null) {
      res.statusCode = 400;
      res.write("Bad request");
      return;
    }

    try {
      var result = await accountFeatures.getUserDiscrete(user, body["userId"]);
      if (result["status"] == "error" && result["message"] == "Unauthorized") {
        res.statusCode = 401;
        res.write("Unauthorized");
        return;
      }
      res.send(json.encode(result));
    } catch (err) {
      print(err);
      res.statusCode = 500;
      res.write("Internal Server Error");
      return;
    }
  }, middleware: [authorizedRequest]);

  // Get all users discrete
  app.post("$route/account/discreteUsers", (req, res) async {
    var authToken = req.headers.value("Authorization")?.split(" ")[1];
    User? user;
    try {
      user = AccountFeatures().decodeToken(authToken ?? "");
    } catch (err) {
      print(err);
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }

    res.headers.contentType = ContentType.json;
    var accountFeatures = AccountFeatures();
    var body = {};
    try {
      body = await req.bodyAsJsonMap;
    } catch (err) {
      body = {};
    }
    try {
      var result = await accountFeatures.getAllUsersDiscrete(user,
          playersOnly: body["all"] ?? false);
      if (result["status"] == "error" && result["message"] == "Unauthorized") {
        res.statusCode = 401;
        res.write("Unauthorized");
        return;
      }
      res.send(json.encode(result));
    } catch (err) {
      print(err);
      res.statusCode = 500;
      res.write("Internal Server Error");
      return;
    }
  }, middleware: [authorizedRequest]);

  // Get user Data from token
  app.post("$route/account/userData", (req, res) async {
    // print(req.headers.value("Authorization"));
    var authToken = req.headers.value("Authorization")?.split(" ")[1];

    if (authToken == null) {
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }

    var accountFeatures = AccountFeatures();
    try {
      // print("authToken: $authToken");
      var result = await accountFeatures.getAccountInfoFromToken(authToken);
      if (result["status"] == "error" && result["message"] == "Unauthorized") {
        res.statusCode = 401;
        res.write("Unauthorized");
        return;
      }
      res.send(json.encode(result));
    } catch (err) {
      print(err);
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }
  }, middleware: [authorizedRequest]);

  // Promote user
  app.post("$route/account/promote", (req, res) async {
    var body = await req.bodyAsJsonMap;
    var authToken = req.headers.value("Authorization")?.split(" ")[1];

    // try {
    var result = await AccountFeatures()
        .promoteUser(authToken ?? "", body["userId"], body["role"]);
    if (result["status"] == "error" && result["message"] == "Unauthorized") {
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }
    res.send(json.encode(result));
    // } catch (err) {
    //   print(err);
    //   res.statusCode = 401;
    //   res.write("Unauthorized");
    //   return;
    // }
  }, middleware: [authorizedRequest]);

  // Demote user
  app.post("$route/account/demote", (req, res) async {
    var body = await req.bodyAsJsonMap;
    var authToken = req.headers.value("Authorization")?.split(" ")[1];

    // try {
    var result = await AccountFeatures()
        .demoteUser(authToken ?? "", body["userId"], body["role"]);
    if (result["status"] == "error" && result["message"] == "Unauthorized") {
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }
    res.send(json.encode(result));
    // } catch (err) {
    //   print(err);
    //   res.statusCode = 401;
    //   res.write("Unauthorized");
    //   return;
    // }
  }, middleware: [authorizedRequest]);

  // Delete user
  app.post("$route/account/delete", (req, res) async {
    var body = await req.bodyAsJsonMap;
    var authToken = req.headers.value("Authorization")?.split(" ")[1];

    try {
      var result =
          await AccountFeatures().deleteUser(authToken ?? "", body["userId"]);
      res.send(json.encode(result));
    } catch (err) {
      print(err);
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }
  }, middleware: [authorizedRequest]);

  // Update Profile
  app.post("$route/account/updateProfile", (req, res) async {
    var body = await req.bodyAsJsonMap;
    var authToken = req.headers.value("Authorization")?.split(" ")[1];

    // try {
    var result = await AccountFeatures().updateProfile(authToken ?? "",
        username: body["username"],
        email: body["email"],
        password: body["password"],
        confirmPassword: body["confirmPassword"],
        profileImage: body["profileImage"]);
    res.send(json.encode(result));
    // } catch (err) {
    //   print(err);
    //   res.statusCode = 401;
    //   res.write("Unauthorized");
    //   return;
    // }
  }, middleware: [authorizedRequest]);

  // LB routes

  // Challenge
  app.post("$route/lb/challenge", (req, res) async {
    var authToken = req.headers.value("Authorization")?.split(" ")[1];
    User? user;
    try {
      user = AccountFeatures().decodeToken(authToken ?? "");
    } catch (err) {
      print(err);
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }

    res.headers.contentType = ContentType.json;
    var lbFeatures = LBFeatures();
    var body = await req.bodyAsJsonMap;
    var result = await lbFeatures.challenge(user.id, body["userId"]);
    if (result["status"] == "error" && result["message"] == "Unauthorized") {
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }
    res.send(json.encode(result));
  }, middleware: [authorizedRequest]);

  // Logger routes

  // Search Logs
  app.get("$route/logs/search/:query", (req, res) async {
    var authToken = req.headers.value("Authorization")?.split(" ")[1];
    User? user;
    try {
      user = AccountFeatures().decodeToken(authToken ?? "");
    } catch (err) {
      print(err);
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }

    res.headers.contentType = ContentType.json;
    var loggerFeatures = LoggerService();
    var query = req.params["query"];
    try {
      var result = await loggerFeatures.searchLogs(user, query);
      res.send(json.encode(result));
    } catch (err) {
      if (err.toString() == "Unauthorized") {
        res.statusCode = 401;
        res.write("Unauthorized");
        return;
      } else {
        print(err);
        res.statusCode = 500;
        res.write("Internal Server Error");
        return;
      }
    }
  }, middleware: [authorizedRequest]);

  // Get all logs
  app.get("$route/logs/all", (req, res) async {
    var authToken = req.headers.value("Authorization")?.split(" ")[1];
    User? user;
    try {
      user = AccountFeatures().decodeToken(authToken ?? "");
    } catch (err) {
      print(err);
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }

    res.headers.contentType = ContentType.json;
    var loggerFeatures = LoggerService();
    var result = await loggerFeatures.getLogs(user);
    if (result["status"] == "error" && result["message"] == "Unauthorized") {
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }
    res.send(json.encode(result));
  }, middleware: [authorizedRequest]);

  // Delete a log
  app.delete("$route/logs/delete/:id", (req, res) async {
    var authToken = req.headers.value("Authorization")?.split(" ")[1];
    User? user;
    try {
      user = AccountFeatures().decodeToken(authToken ?? "");
    } catch (err) {
      print(err);
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }

    res.headers.contentType = ContentType.json;
    var loggerFeatures = LoggerService();
    var id = req.params["id"];
    var result = await loggerFeatures.deleteLog(user, id);
    if (result["status"] == "error" && result["message"] == "Unauthorized") {
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }
    res.send(json.encode(result));
  }, middleware: [authorizedRequest]);

  // Clear all logs
  app.delete("$route/logs/clear", (req, res) async {
    var authToken = req.headers.value("Authorization")?.split(" ")[1];
    User? user;
    try {
      user = AccountFeatures().decodeToken(authToken ?? "");
    } catch (err) {
      print(err);
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }

    res.headers.contentType = ContentType.json;
    var loggerFeatures = LoggerService();
    var result = await loggerFeatures.clearLogs(user);
    if (result["status"] == "error" && result["message"] == "Unauthorized") {
      res.statusCode = 401;
      res.write("Unauthorized");
      return;
    }
    res.send(json.encode(result));
  }, middleware: [authorizedRequest]);

  app.listen(port);
  print("Listening on port $port");
}
