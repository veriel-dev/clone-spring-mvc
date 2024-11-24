import { LoggerService } from "../../config/logs/LoggerService";
import { Service } from "../../config/decorators";
import { DatabaseService } from "../../odm/database.service";
import { User } from "../../config/models/user.model";
import { Product } from "../../config/models/product.model";
import { hash, hashSync } from "bcrypt";

@Service()
export class SeedService {
    private readonly logger = new LoggerService()
    private readonly db:DatabaseService

    constructor() {
        this.db = DatabaseService.getInstance()
    }

    async seedDatabase(): Promise<void> {
        try {
            await this.clearDatabase();
            await Promise.all([
                this.seedUsers(),
                this.seedProducts()
            ]);
            this.logger.info('Database seeded successfully');
        } catch (error) {
            this.logger.error('Error seeding database:', error);
            throw error;
        }
    }
    private async clearDatabase(): Promise<void> {
        const userManager = this.db.getManager(User);
        const productManager = this.db.getManager(Product);

        await Promise.all([
            userManager.collection.deleteMany({}),
            productManager.collection.deleteMany({})
        ]);

        this.logger.info('Database cleared');
    }
    private async seedUsers(): Promise<void> {
        const userManager = this.db.getManager(User);
        
        const users = [
            new User({
                name: 'John Doe',
                email: 'john@example.com',
                password: hashSync("Veriel1234!", 10)
                
            }),
            new User({
                name: 'Jane Smith',
                email: "Veriel1234!",
                password: hashSync("Veriel1234!", 10)
            }),
            new User({
                name: 'Reina Smith',
                email: 'Reina@example.com',
                password: hashSync("Veriel1234!", 10)
            }),
            new User({
                name: 'Sparky Smith',
                email: 'sparky@example.com',
                password: hashSync("Veriel1234!", 10)
            }),
            new User({
                name: 'Dado Smith',
                email: 'dado@example.com',
                password: hashSync("Veriel1234!", 10)
            }),
        ];

        for (const user of users) {
            await userManager.create(user);
        }

        this.logger.info(`Seeded ${users.length} users`);
    }

    private async seedProducts(): Promise<void> {
        const productManager = this.db.getManager(Product);
        
        const products = [
            new Product({
                name: 'Laptop Pro',
                price: 1299.99,
                stock: 10,
            }),
            new Product({
                name: 'Smartphone X',
                price: 699.99,
                stock: 15,
                description: 'Latest smartphone model',
                category: 'Electronics'
            }),
            new Product({
                name: 'Office Chair',
                price: 199.99,
                stock: 20,
                description: 'Ergonomic office chair',
                category: 'Furniture'
            }),
            // Añade más productos según necesites
        ];

        for (const product of products) {
            await productManager.create(product);
        }

        this.logger.info(`Seeded ${products.length} products`);
    }

    async getDatabaseStatus(): Promise<object> {
        const userManager = this.db.getManager(User);
        const productManager = this.db.getManager(Product);

        const [userCount, productCount] = await Promise.all([
            userManager.collection.countDocuments(),
            productManager.collection.countDocuments()
        ]);

        return {
            users: userCount,
            products: productCount,
            lastSeeded: new Date().toISOString()
        };
    }

}
