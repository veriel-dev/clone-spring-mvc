import 'reflect-metadata';
import { BaseDocument } from '../../odm/base-document';


export const MODEL_METADATA_KEY = 'custom:model';

export function Model(collectionName: string) {
    return function <T extends { new (...args: any[]): BaseDocument }>(constructor: T) {
        // Guardamos los metadata
        Reflect.defineMetadata(MODEL_METADATA_KEY, { collectionName }, constructor);
        
        // Creamos una nueva clase que extiende el constructor original
        return class extends constructor {
            // Implementamos el método abstracto
            getCollectionName(): string {
                return collectionName;
            }
        } as T;
    };
}