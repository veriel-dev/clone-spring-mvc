import { UserService } from "../services/UserService";

import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Inject,
  DTO,
} from "../../config/decorators";
import { UserDTO } from "../dto/UserDTO";

import { Request, Response } from "express";

@Controller("/users")
export class UserController {
  constructor(@Inject() private userService: UserService) {}

  @Get("/")
  async getAllUsers() {
    return await this.userService.getUsers();
  }

  @Get("/:id")
  async getUserById(req: Request, res: Response) {
    const id = req.params.id;
    const user = await this.userService.getUserById(id);
    if (user) {
      return user;
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  }

  @Post("/")
  @DTO(UserDTO)
  async createUser(req: Request, res: Response) {
    const createdUser = await this.userService.createUser(req.body);
    res.status(201).json(createdUser);
  }

  @Put("/:id")
  async updateUser(req: Request, res: Response) {
    const id = req.params.id;
    const updatedUser = await this.userService.updateUser(id, req.body);
    if (updatedUser) {
      return updatedUser;
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  }

  @Delete("/:id")
  async deleteUser(req: Request, res: Response) {
    const id = req.params.id;
    const deleted = await this.userService.deleteUser(id);
    if (deleted) {
      res.status(204).send();
    } else {
      res.status(404).json({ error: "Usuario no encontrado" });
    }
  }
}
