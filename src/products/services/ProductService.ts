import { LoggerService } from "../../config/logs/LoggerService";
import { Service } from "../../config/decorators";
import { DatabaseService } from "../../odm/database.service";
import { Product } from "../../config/models/product.model";

@Service()
export class ProductService {
  private readonly logger = new LoggerService();
  private readonly db: DatabaseService;

  constructor() {
    this.db = DatabaseService.getInstance();
  }

  async getAllProducts(
    options: {
      page?: number;
      limit?: number;
      sort?: { [key: string]: 1 | -1 };
      filter?: { [key: string]: any };
      category?: string;
      minPrice?: number;
      maxPrice?: number;
      inStock?: boolean;
    } = {}
  ): Promise<{
    products: Product[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const productManager = this.db.getManager(Product);
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      filter = {},
      category,
      minPrice,
      maxPrice,
      inStock,
    } = options;

    // Construir filtro compuesto
    const composedFilter: any = { ...filter };

    if (category) {
      composedFilter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      composedFilter.price = {};
      if (minPrice !== undefined) composedFilter.price.$gte = minPrice;
      if (maxPrice !== undefined) composedFilter.price.$lte = maxPrice;
    }

    if (inStock !== undefined) {
      composedFilter.stock = inStock ? { $gt: 0 } : { $lte: 0 };
    }

    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      productManager.collection
        .find(composedFilter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray(),
      productManager.collection.countDocuments(composedFilter),
    ]);

    return {
      //@ts-ignore
      products,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getProductById(id: string): Promise<Product> {
    const productManager = this.db.getManager(Product);
    const product = await productManager.findById(id);

    if (!product) {
      const error = new Error("Product not found");
      error.name = "NotFoundError";
      throw error;
    }

    return product;
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    const productManager = this.db.getManager(Product);

    // Validar datos requeridos
    if (!productData.name || !productData.price) {
      const error = new Error("Name and price are required");
      error.name = "ValidationError";
      throw error;
    }

    // Validar precio
    if (productData.price < 0) {
      const error = new Error("Price must be greater than or equal to 0");
      error.name = "ValidationError";
      throw error;
    }

    // Crear el producto con valores por defecto
    const product = new Product({
      ...productData,
      stock: productData.stock ?? 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    const createdProduct = await productManager.create(product);
    this.logger.info(`Product created successfully: ${createdProduct._id}`);

    return createdProduct;
  }
}
