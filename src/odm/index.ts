import { DatabaseService } from './database.service';
import { ModelScanner } from './model.scanner';

export const initializeDatabase = async (
    mongoUri: string,
    dbName: string,
    modelsPath: string
) => {
    await ModelScanner.scanAndRegisterModels(modelsPath);

    const db = DatabaseService.getInstance();
    await db.connect(mongoUri, dbName);

    return db;
};
