// ignore_for_file: unnecessary_this

import 'package:backend_v2/backend_v2.dart';
import 'package:backend_v2/data/db/db.dart';
import 'package:backend_v2/data/models/models.dart';
import 'package:backend_v2/features/lb/lb.dart';
import 'package:cron/cron.dart';
import 'package:sembast/sembast.dart';

extension DateTimeExtension on DateTime {
  String get toCronString => '$second $minute $hour $day $month $weekday';
}

class SchedulerService {
  final cron = Cron();

  final Map<String, Map<String, Future<void> Function(Map<String, dynamic>)>>
      callbacks = {
    'lb': {
      'expireMatch': (Map<String, dynamic> params) async =>
          await Function.apply(
              LBFeatures().expireChallenge, [params['companionId']]),
    },
  };

  Future<void> rememberTasks() async {
    if (db == null) {
      throw Exception("Database not initialized");
    }

    var store = DbFeatures().getStore(Table.tasks.name);

    var tasks = await store
        .find(db!, finder: Finder(sortOrders: [SortOrder('timestamp')]))
        .then((value) => value.map((e) => LBTask.fromJson(e.value)).toList());

    for (var task in tasks) {
      if (task.status == TaskStatus.canceled) {
        continue;
      } else if (task.runtime.isBefore(DateTime.now()) &&
          task.status != TaskStatus.completed) {
        await this.callbacks[task.callback.groupId]![task.callback.id]!(
            task.callback.args ?? {});

        if (task.type == TaskType.singleExec) {
          cancelTask(task);
        }

        task.status = TaskStatus.completed;
        task.modifiedAt = DateTime.now();
        await store.update(db!, task.toJson(),
            finder: Finder(filter: Filter.equals('id', task.id)));
      } else if (task.runtime.isAtSameMomentAs(DateTime.now()) &&
          task.status == TaskStatus.completed) {
        await this.callbacks[task.callback.groupId]![task.callback.id]!(
            task.callback.args ?? {});

        if (task.type == TaskType.singleExec) {
          cancelTask(task);
        }

        task.status = TaskStatus.completed;
        task.modifiedAt = DateTime.now();
        await store.update(db!, task.toJson(),
            finder: Finder(filter: Filter.equals('id', task.id)));
      } else if (task.runtime.isAfter(DateTime.now())) {
        cron.schedule(Schedule.parse(task.runtime.toCronString), () async {
          await this.callbacks[task.callback.groupId]![task.callback.id]!(
              task.callback.args ?? {});
        });

        task.status = TaskStatus.pending;
        task.modifiedAt = DateTime.now();
        await store.update(db!, task.toJson(),
            finder: Finder(filter: Filter.equals('id', task.id)));
      }
    }
  }

  SchedulerService() {
    print("Scheduler initialized");
    print("Remembering tasks");

    rememberTasks().then(
      (value) => print("Remembering tasks completed"),
    );
  }

  Future<void> cancelTask(LBTask task, {bool remember = false}) async {
    cron.close();

    task.status = TaskStatus.canceled;
    task.modifiedAt = DateTime.now();

    var store = DbFeatures().getStore(Table.tasks.name);
    await store
        .update(db!, task.toJson(),
            finder: Finder(filter: Filter.equals('id', task.id)))
        .then((value) => print("Task canceled. Remembering tasks"));

    if (!remember) {
      return;
    }

    rememberTasks().then((value) => print("Remembering tasks completed"));
  }

  Future<void> scheduleTask(LBTask task) async {
    if (db == null) {
      throw Exception("Database not initialized");
    }

    if (scheduler == null) {
      throw Exception("Scheduler not initialized");
    }

    print("Scheduling task: ${task.runtime}");
    // print("Cron expression: ${task.runtime.toCronString}");

    cron.schedule(Schedule.parse(task.runtime.toCronString), () async {
      await this.callbacks[task.callback.groupId]![task.callback.id]!(
          task.callback.args ?? {});
      if (task.type == TaskType.singleExec) {
        cancelTask(task);
      }
    });

    task.status = TaskStatus.pending;
    task.modifiedAt = DateTime.now();
    var store = DbFeatures().getStore(Table.tasks.name);
    var taskJson = await store
        .findFirst(db!, finder: Finder(filter: Filter.equals('id', task.id)))
        .then((value) => value?.value);

    if (taskJson == null) {
      await store.add(db!, task.toJson());
    } else {
      await store.update(db!, task.toJson(),
          finder: Finder(filter: Filter.equals('id', task.id)));
    }
  }
}
