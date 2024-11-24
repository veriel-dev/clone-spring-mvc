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
  getAllUsers() {
    return this.userService.getUsers();
  }

  @Get("/:id")
  getUserById(req: Request, res: Response) {
    const id = req.params.id
    const user = this.userService.getUserById(id);
    if (user) {
      return user;
    } else {
      res.status(404).send("Usuario no encontrado");
    }
  }

  @Post("/")
  @DTO(UserDTO)
  createUser(req: Request, res: Response) {
    const newUser = req.body;
    const createdUser = this.userService.createUser(newUser);
    res.status(201).json(createdUser);
  }

  @Put("/:id")
  updateUser(req: Request, res: Response) {
    const id = parseInt(req.params.id);
    const userData = req.body;
    const updatedUser = this.userService.updateUser(id as unknown as string, userData);
    if (updatedUser) {
      return updatedUser;
    } else {
      res.status(404).send("Usuario no encontrado");
    }
  }

  // @Delete("/:id")
  // deleteUser(req: Request, res: Response) {
  //   const id = parseInt(req.params.id);
  //   const success = this.userService.deleteUser(id);
  //   if (success) {
  //     res.status(204).send();
  //   } else {
  //     res.status(404).send("Usuario no encontrado");
  //   }
  // }
}
