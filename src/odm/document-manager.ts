import { Collection, Db, ObjectId } from 'mongodb';
import { DocumentType } from './type';
import { BaseDocument } from './base-document';
import { throws } from 'assert';

export class DocumentManager<T extends BaseDocument> {
    public collection: Collection

    constructor(
        private readonly db:Db,
        private readonly documentClass: new (data?: Partial<DocumentType>) => T
    ) {
        const document = new documentClass();
        this.collection = db.collection(document.getCollectionName());
    }
    async create(document: T): Promise<T> {
        const results = await this.collection.insertOne(document.toJSON())
        document._id = results.insertedId
        return document
    }
    async findById(id: string): Promise<T | null> {
        const result = await this.collection.findOne({ _id: new ObjectId(id) });
        return result ? new this.documentClass(result) : null;
    }
    async find(query: object = {}): Promise<T[]> {
        const results = await this.collection.find(query).toArray();
        return results.map(result => new this.documentClass(result));
    }
    async update(id: string, document: Partial<T>): Promise<T | null> {
        const result = await this.collection.findOneAndUpdate(
            { _id: new ObjectId(id) },
            { $set: document },
            { returnDocument: 'after' }
        );
        return result!!.value ? new this.documentClass(result!!.value) : null;
    }
}