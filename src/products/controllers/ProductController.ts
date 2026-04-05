import { ProductService } from "../services/ProductService";
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Inject,
} from "../../config/decorators";
import { Request, Response } from "express";
@Controller("/products")
export class ProductController {
  constructor(@Inject() private productService: ProductService) {}

  @Get("/")
  async getAllProducts() {
    return await this.productService.getAllProducts();
  }

  @Get("/:id")
  async getProductById(req: Request, res: Response) {
    const id = req.params.id;
    const product = await this.productService.getProductById(id);
    if (product) {
      return product;
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  }

  @Post("/")
  async createProduct(req: Request, res: Response) {
    const createdProduct = await this.productService.createProduct(req.body);
    res.status(201).json(createdProduct);
  }

  @Put("/:id")
  async updateProduct(req: Request, res: Response) {
    const id = req.params.id;
    const updatedProduct = await this.productService.updateProduct(id, req.body);
    if (updatedProduct) {
      return updatedProduct;
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  }

  @Delete("/:id")
  async deleteProduct(req: Request, res: Response) {
    const id = req.params.id;
    const deleted = await this.productService.deleteProduct(id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Producto no encontrado" });
    }
  }
}
