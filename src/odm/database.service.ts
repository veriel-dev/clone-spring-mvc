import { MongoClient, Db } from 'mongodb';
import { DocumentManager } from './document-manager';
import { ModelsRegistry } from './models.registry';
import { BaseDocument } from './base-document';

export class DatabaseService {
    private static instance: DatabaseService;
    private _client: MongoClient | null = null;
    private _db: Db | null = null;
    private _managers: Map<string, DocumentManager<any>> = new Map();

    private constructor() {}

    static getInstance(): DatabaseService {
        if (!DatabaseService.instance) {
            DatabaseService.instance = new DatabaseService();
        }
        return DatabaseService.instance;
    }

    get client(): MongoClient {
        if (!this._client) {
            throw new Error('Database not connected. Call connect() first');
        }
        return this._client;
    }

    get db(): Db {
        if (!this._db) {
            throw new Error('Database not connected. Call connect() first');
        }
        return this._db;
    }

    get managers(): Map<string, DocumentManager<any>> {
        return this._managers;
    }

    async connect(uri: string, dbName: string): Promise<void> {
        if (this._client) {
            return; // Ya conectado
        }

        try {
            this._client = await MongoClient.connect(uri);
            this._db = this._client.db(dbName);

            // Inicializar managers para todos los modelos registrados
            ModelsRegistry.getModels().forEach((modelClass, collectionName) => {
                this._managers.set(
                    collectionName,
                    new DocumentManager(this._db!, modelClass)
                );
            });
        } catch (error) {
            this._client = null;
            this._db = null;
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        if (this._client) {
            await this._client.close();
            this._client = null;
            this._db = null;
            this._managers.clear();
        }
    }

    getManager<T extends BaseDocument>(modelClass: new (...args: any[]) => T): DocumentManager<T> {
        const instance = new modelClass();
        const manager = this._managers.get(instance.getCollectionName());
        
        if (!manager) {
            throw new Error(`No manager found for collection ${instance.getCollectionName()}`);
        }
        
        return manager as DocumentManager<T>;
    }

    isConnected(): boolean {
        return this._client !== null && this._db !== null;
    }
}