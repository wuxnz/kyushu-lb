import 'package:backend_v2/backend_v2.dart';
import 'package:backend_v2/data/db/db.dart';
import 'package:backend_v2/data/models/models.dart';
import 'package:sembast/sembast.dart';

class LoggerService {
  LoggerService() {
    print("Initializing logger...");
  }

  Future<void> log(LBEvent event) async {
    if (db == null) {
      throw Exception("Database not initialized");
    }

    var store = DbFeatures().getStore(Table.logs.name);
    await store.add(db!, event.toJson());
  }

  Future<List<Map<String, dynamic>>> searchLogs(User user, String query) async {
    if (db == null) {
      throw Exception("Database not initialized");
    }

    var allowedUserRoles = [
      Role.developer,
      Role.owner,
      Role.admin,
    ];

    if (!allowedUserRoles.contains(user.role)) {
      throw Exception("Unauthorized");
    }

    var store = DbFeatures().getStore(Table.logs.name);
    return await store
        .find(db!,
            finder: Finder(
                filter: Filter.matchesRegExp(
                    'message', RegExp(query, caseSensitive: false))))
        .then((value) => value.map((e) => e.value).toList());
  }

  Future<Map<String, dynamic>> getLogs(User user) async {
    if (db == null) {
      throw Exception("Database not initialized");
    }

    var allowedUserRoles = [
      Role.developer,
      Role.owner,
      Role.admin,
    ];

    if (!allowedUserRoles.contains(user.role)) {
      return {"status": "error", "message": "Unauthorized", "data": null};
    }

    var store = DbFeatures().getStore(Table.logs.name);
    return {
      "status": "success",
      "message": "Logs retrieved",
      "data": await store
          .find(db!, finder: Finder(sortOrders: [SortOrder('timestamp')]))
          .then((value) => value.map((e) => e.value).toList()),
    };
  }

  Future<Map<String, dynamic>> deleteLog(User user, String logId) async {
    if (db == null) {
      throw Exception("Database not initialized");
    }

    var allowedUserRoles = [
      Role.developer,
      Role.owner,
    ];

    if (!allowedUserRoles.contains(user.role)) {
      return {"status": "error", "message": "Unauthorized", "data": null};
    }

    var store = DbFeatures().getStore(Table.logs.name);
    await store.delete(db!, finder: Finder(filter: Filter.equals('id', logId)));

    return {"status": "success", "message": "Log deleted", "data": null};
  }

  Future<Map<String, dynamic>> clearLogs(User user) async {
    if (db == null) {
      throw Exception("Database not initialized");
    }

    var allowedUserRoles = [
      Role.developer,
      Role.owner,
    ];

    var store = DbFeatures().getStore(Table.logs.name);

    if (!allowedUserRoles.contains(user.role)) {
      return {"status": "error", "message": "Unauthorized", "data": null};
    }

    await store.delete(db!);

    return {"status": "success", "message": "Logs cleared", "data": null};
  }
}
