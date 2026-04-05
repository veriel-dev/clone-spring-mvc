import "reflect-metadata";
import * as fs from "fs";
import path from "path";
import { Container } from "./dependency/DependencyContainer";
import { AppRouter } from "./routes/AppRoute";
import { Request, Response } from "express";
import { validateDTO } from "../utils/validateDTO";

export class GlobalConfig {
  private static instance: GlobalConfig;
  private controllers: any[] = [];
  private services: any[] = [];

  private constructor() {}

  static getInstance(): GlobalConfig {
    if (!GlobalConfig.instance) {
      GlobalConfig.instance = new GlobalConfig();
    }
    return GlobalConfig.instance;
  }
  scanAndRegister(baseDir: string): void {
    this.scanDirectory(baseDir);
    this.registerServices();
    this.registerControllers();
  }
  private static readonly EXCLUDED_DIRS = new Set([
    "node_modules", "__tests__", "dist", ".git",
  ]);

  private scanDirectory(dir: string): void {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        if (!GlobalConfig.EXCLUDED_DIRS.has(file)) {
          this.scanDirectory(filePath);
        }
      } else if (
        (file.endsWith(".ts") || file.endsWith(".js")) &&
        !file.endsWith(".spec.ts") &&
        !file.endsWith(".test.ts") &&
        !file.endsWith(".spec.js") &&
        !file.endsWith(".test.js") &&
        !file.endsWith(".d.ts")
      ) {
        this.processFile(filePath);
      }
    }
  }
  private processFile(filePath: string) {
    // Importamos el archivos para ese filePath
    const module = require(filePath);
    for (const exportName in module) {
      const exportedItem = module[exportName];
      if (typeof exportedItem === "function") {
        if (Reflect.getMetadata("controller", exportedItem)) {
          this.controllers.push(exportedItem);
        } else if (Reflect.getMetadata("service", exportedItem)) {
          this.services.push(exportedItem);
        }
      }
    }
  }
  private registerServices(): void {
    for (const service of this.services) {
      const serviceName = service.name;
      Container.register(serviceName, new service());
    }
  }
  private registerControllers(): void {
    const router = AppRouter.getInstance();

    for (const controller of this.controllers) {
      const instance = Container.resolve(controller);
      const prefix = Reflect.getMetadata("prefix", controller) || "";
      const routes = Reflect.getMetadata("routes", controller) || [];

      routes.forEach((route: any) => {
        const method = route.method.toLowerCase();
        const path = prefix + route.path;

        const dtoClass = Reflect.getMetadata(
          "dto",
          instance as Object,
          route.handlerName
        );
        const handlers = [
          validateDTO(dtoClass),
          (req: Request, res: Response) => {
            try {
              const result = (instance as any)[route.handlerName](req, res);
              if (result instanceof Promise) {
                result.then((data) => {
                  if (!res.headersSent && data !== undefined) {
                    res.send(data);
                  }
                }).catch((error) => {
                  if (!res.headersSent) {
                    const status = error.name === "NotFoundError" ? 404
                      : error.name === "ValidationError" ? 400
                      : 500;
                    res.status(status).json({ error: error.message });
                  }
                });
              } else if (!res.headersSent && result !== undefined) {
                res.send(result);
              }
            } catch (error: any) {
              if (!res.headersSent) {
                res.status(500).json({ error: error.message });
              }
            }
          },
        ];

        (router as any)[method](path, ...handlers);
      });
    }
  }
}
