import { BaseDocument } from "./base-document";
import { DocumentType } from "./type";


export type ModelConstructor<T extends BaseDocument> = {
    new (data?: Partial<DocumentType>): T;
};
export class ModelsRegistry {
    private static models: Map<string, ModelConstructor<BaseDocument>> = new Map();

    static register<T extends BaseDocument>(modelClass: ModelConstructor<T>) {
        const instance = new modelClass();
        this.models.set(instance.getCollectionName(), modelClass as ModelConstructor<BaseDocument>);
    }

    static getModels(): Map<string, ModelConstructor<BaseDocument>> {
        return this.models;
    }

    static getModel(collectionName: string): ModelConstructor<BaseDocument> | undefined {
        return this.models.get(collectionName);
    }
}
