import "reflect-metadata";

// Decorators
export {
  Controller,
  Service,
  Get,
  Post,
  Put,
  Delete,
  Inject,
  DTO,
  Value,
  Model,
  IsRequired,
  MinLength,
  MaxLength,
  IsEmail,
  IsNumber,
  validate,
} from "./config/decorators";

// Dependency Injection
export { Container } from "./config/dependency/DependencyContainer";

// ODM
export { BaseDocument } from "./odm/base-document";
export { DocumentManager } from "./odm/document-manager";
export { DatabaseService } from "./odm/database.service";
export { ModelsRegistry } from "./odm/models.registry";
export { ModelScanner } from "./odm/model.scanner";
export { initializeDatabase } from "./odm";
export type { DocumentType } from "./odm/type";

// Server & Routing
export { default as Server } from "./config/server";
export type { ServerOptions } from "./config/server";
export { AppRouter } from "./config/routes/AppRoute";
export { GlobalConfig } from "./config/GlobalConfig";

// Logging
export { LoggerService } from "./config/logs/LoggerService";

// Utilities
export { validateDTO } from "./utils/validateDTO";
