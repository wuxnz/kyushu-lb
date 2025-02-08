// import 'package:backend_v2/data/models/models.dart';
import 'package:sembast/sembast.dart';
import 'package:sembast/sembast_io.dart';

class DbFeatures {
  Future<Database> init() async {
    print("Initializing database...");
    String dbPath = "lb.db";
    DatabaseFactory dbFactory = databaseFactoryIo;
    Database db = await dbFactory.openDatabase(dbPath);
    return db;
  }

  StoreRef<int, Map<String, dynamic>> getStore(String collectionName) {
    return intMapStoreFactory.store(collectionName);
  }
}
