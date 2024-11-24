import { DatabaseService } from './database.service';
import { ModelScanner } from './model.scanner';

export const initializeDatabase = async (
    mongoUri: string,
    dbName: string,
    modelsPath?: string
) => {
    // Escanear y registrar modelos automáticamente
    await ModelScanner.scanAndRegisterModels(modelsPath);
    
    // Inicializar la base de datos
    const db = DatabaseService.getInstance();
    await (await db).connect(mongoUri, dbName);
    
    return db;
};