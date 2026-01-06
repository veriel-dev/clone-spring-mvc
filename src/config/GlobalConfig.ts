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
  private scanDirectory(dir: string): void {
    const files = fs.readdirSync(dir);
    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      if (stat.isDirectory()) {
        this.scanDirectory(filePath);
      } else if (file.endsWith(".ts") || file.endsWith(".js")) {
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
            const result = (instance as any)[route.handlerName](req, res);
            if (result instanceof Promise) {
              result.then((result) => res.send(result));
            } else {
              res.send(result);
            }
          },
        ];

        (router as any)[method](path, ...handlers);
      });
    }
  }
}
