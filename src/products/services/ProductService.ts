import { Service } from "../../config/decorators";

@Service()
export class ProductService {
  private products: any[] = [];

  getAllProducts() {
    return this.products;
  }

  getProductById(id: number) {
    return this.products.find((product) => product.id === id);
  }

  createProduct(productData: any) {
    const newProduct = { id: this.products.length + 1, ...productData };
    this.products.push(newProduct);
    return newProduct;
  }
}
