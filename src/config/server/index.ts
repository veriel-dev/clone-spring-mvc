import express, { Express, NextFunction, Request, Response } from "express";
import { AddressInfo } from "net";
import { AppRouter } from "../routes/AppRoute";
import { GlobalConfig } from "../GlobalConfig";
import path from "path";
import { LoggerService } from "../logs/LoggerService";
import { Value } from "../decorators/Value";
import { validate } from "../decorators";

class Server {
  private app: Express;

  @Value("PORT", 3000)
  private port!: number;

  @Value("MAX_PORT_ATTEMPTS", 10)
  private maxPortAttempts!: number;

  private config: GlobalConfig;
  private logger: LoggerService;

  constructor() {
    this.app = express();
    this.middleware();
    this.routes();
    this.config = GlobalConfig.getInstance();
    this.scanAndRegister();
    this.logger = new LoggerService();
  }
  private middleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(this.loggingMiddleware.bind(this));
  }
  private routes(): void {
    this.app.use("/api", AppRouter.getInstance());
  }
  private scanAndRegister(): void {
    this.config.scanAndRegister(path.join(__dirname, "../../"));
  }
  private loggingMiddleware(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    res.on("finish", () => {
      const duration = Date.now() - start;
      this.logger.info(
        `${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`
      );
    });
    next();
  }
  public async start(): Promise<void> {
    let currentPort = this.port;
    let attempts = 0;

    while (attempts < this.maxPortAttempts) {
      try {
        await this.listen(currentPort);
        this.logger.info(`Server running on port ${currentPort}`);
        return;
      } catch (error: any) {
        if (error.code === "EADDRINUSE") {
          this.logger.warn(
            `Port ${currentPort} is in use, trying next port...`
          );
          currentPort++;
          attempts++;
        } else {
          throw error;
        }
      }
    }

    throw new Error(
      `Unable to find an available port after ${this.maxPortAttempts} attempts`
    );
  }

  private listen(port: number): Promise<void> {
    return new Promise((resolve, reject) => {
      this.app
        .listen(port)
        .once("listening", () => resolve())
        .once("error", reject);
    });
  }
}

export default Server;
