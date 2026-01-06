import { LoggerService } from "../../config/logs/LoggerService";
import { Service } from "../../config/decorators";
import { DatabaseService } from "../../odm/database.service";
import { hash, compare } from "bcryptjs";
import { User } from "../../config/models/user.model";
import { ObjectId } from "mongodb";

@Service()
export class UserService {
  private readonly logger = new LoggerService();
  private readonly db: DatabaseService;
  private readonly SALT_ROUNDS = 10;
  constructor() {
    this.db = DatabaseService.getInstance();
  }
  /* Create User */
  async createUser(userData: Partial<User>): Promise<User> {
    try {
      const userManager = this.db.getManager(User);

      // Verificar si el email ya existe
      const existingUser = await userManager.collection.findOne({
        email: userData.email,
      });

      if (existingUser) {
        const error = new Error("Email already exists");
        error.name = "ValidationError";
        throw error;
      }

      // Hash de la contraseña
      if (userData.password) {
        userData.password = await hash(userData.password, this.SALT_ROUNDS);
      }

      // Crear el usuario
      const user = new User({
        ...userData,
        createdAt: new Date(),
      });

      const createdUser = await userManager.create(user);

      this.logger.info(`User created successfully: ${createdUser._id}`);

      // Excluir la contraseña de la respuesta
      const { password, ...userWithoutPassword } = createdUser;
      return userWithoutPassword as User;
    } catch (error) {
      this.logger.error("Error creating user:", error);
      throw error;
    }
  }
  /* Get user By  Id*/
  async getUserById(id: string): Promise<User> {
    console.log({id})
    const userManager = this.db.getManager(User);
    const user = await userManager.findById(id);

    if (!user) {
      const error = new Error("User not found");
      error.name = "NotFoundError";
      throw error;
    }

    // Excluir la contraseña
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as User;
  }
  /* Get User By Pagiantion And Filters */
  async getUsers(
    options: {
      page?: number;
      limit?: number;
      sort?: { [key: string]: 1 | -1 };
      filter?: { [key: string]: any };
    } = {}
  ): Promise<{
    users: Partial<User>[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const userManager = this.db.getManager(User);
    const {
      page = 1,
      limit = 10,
      sort = { createdAt: -1 },
      filter = {},
    } = options;

    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      userManager.collection
        .find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .toArray(),
      userManager.collection.countDocuments(filter),
    ]);

    // Excluir contraseñas
    const usersWithoutPassword = users.map((user) => {
      const { password, ...rest } = user;
      return rest;
    });

    return {
      users: usersWithoutPassword,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
  /* Update Users */

  async updateUser(id: string, updateData: Partial<User>): Promise<User> {
    const userManager = this.db.getManager(User);

    // Si se intenta actualizar el email, verificar que no exista
    if (updateData.email) {
      const existingUser = await userManager.collection.findOne({
        email: updateData.email,
        _id: { $ne: new ObjectId(id) },
      });

      if (existingUser) {
        const error = new Error("Email already exists");
        error.name = "ValidationError";
        throw error;
      }
    }

    // Si se actualiza la contraseña, hashearla
    if (updateData.password) {
      updateData.password = await hash(updateData.password, this.SALT_ROUNDS);
    }

    const updatedUser = await userManager.update(id, updateData);

    if (!updatedUser) {
      const error = new Error("User not found");
      error.name = "NotFoundError";
      throw error;
    }

    // Excluir la contraseña
    const { password, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword as User;
  }
}
