import { DocumentType } from "../../odm/type";
import { Model } from "../../config/decorators/Model";
import { BaseDocument } from "../../odm/base-document";


@Model('products')
export class Product extends BaseDocument {
    name: string;
    price: number;
    stock: number;

    constructor(data?: Partial<DocumentType>) {
        super(data);
        this.stock = (data as any)?.stock ?? 0;
    }
}