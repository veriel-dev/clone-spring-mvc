export abstract class BaseDocument {
    _id?: any;

    constructor(data?: Partial<BaseDocument>) {
        if (data) {
            Object.assign(this, data);
        }
    }

    // En lugar de ser abstracto, proporcionamos una implementación base
    getCollectionName(): string {
        // Obtenemos el nombre de la colección de los metadata
        const metadata = Reflect.getMetadata('custom:model', this.constructor);
        if (!metadata || !metadata.collectionName) {
            throw new Error(`Model ${this.constructor.name} must be decorated with @Model`);
        }
        return metadata.collectionName;
    }

    toJSON(): Record<string, any> {
        const obj: Record<string, any> = {};
        Object.entries(this).forEach(([key, value]) => {
            if (value !== undefined) {
                obj[key] = value;
            }
        });
        return obj;
    }
}
