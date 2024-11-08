import { ProductService } from "../services/ProductService";
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Inject,
} from "../../config/decorators";
@Controller("/products")
export class ProductController {
  constructor(@Inject() private productService: ProductService) {}

  @Get("/")
  getAllProducts() {
    return this.productService.getAllProducts();
  }

  @Get("/:id")
  getProductById(req: any, res: any) {
    const id = parseInt(req.params.id);
    const product = this.productService.getProductById(id);
    if (product) {
      return product;
    } else {
      res.status(404).send("Producto no encontrado");
    }
  }

  @Post("/")
  createProduct(req: any, res: any) {
    const newProduct = req.body;
    const createdProduct = this.productService.createProduct(newProduct);
    res.status(201).json(createdProduct);
  }
}
