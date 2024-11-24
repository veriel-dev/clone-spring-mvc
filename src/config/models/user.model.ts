import { Model } from "../../config/decorators/Model";
import { BaseDocument } from "../../odm/base-document";


@Model("users")
export class User extends BaseDocument {
    
    name: string;
    email: string;
    password: string
    createdAt: Date = new Date();

    constructor(data?: Partial<User>) {
        super(data);
        this.createdAt = new Date();
    }

}