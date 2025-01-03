import express, { Express, NextFunction, Request, Response } from "express";
import { AddressInfo } from "net";
import { AppRouter } from "../routes/AppRoute";
import { GlobalConfig } from "../GlobalConfig";
import path from "path";
import { LoggerService } from "../logs/LoggerService";
import { Value } from "../decorators/Value";
import { DatabaseService } from "../../odm/database.service";
import { ModelScanner } from "../../odm/model.scanner";

class Server {
  private app: Express;

  @Value("PORT", 3000)
  private port!: number;

  @Value("MAX_PORT_ATTEMPTS", 10)
  private maxPortAttempts!: number;

  @Value("MONGODB_URI", "mongodb://localhost:27017")
  private mongoUri!: string;

  @Value("MONGODB_DB_NAME", "your_database")
  private dbName!: string;

  private config: GlobalConfig;
  private logger: LoggerService;
  private db: DatabaseService;

  constructor() {
    this.app = express();
    this.db = DatabaseService.getInstance();
    this.config = GlobalConfig.getInstance();
    this.middleware();
    this.scanAndRegister();
    this.logger = new LoggerService();
    this.routes();
  }
  private middleware(): void {
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(this.loggingMiddleware.bind(this));
    this.app.use(express.static(path.join(__dirname, 'public')));
  }
  private routes(): void {
    this.app.get("/", (req, res) => {
      res.sendFile(path.join(__dirname, 'public', 'index.html'));
    });
    

    this.app.use("/api", AppRouter.getInstance());

    this.app.use('*', (req, res) => {
      this.logger.warn(`Route not found: ${req.originalUrl}`);
      res.sendFile(path.join(__dirname, 'public', '404.html'));
    });
  }
  private scanAndRegister(): void {
    this.config.scanAndRegister(path.join(__dirname, "../../"));
  }
  private async initializeDatabase(): Promise<void> {
    try {
      // Escanear y registrar modelos
      await ModelScanner.scanAndRegisterModels(
        path.join(__dirname, "../models")
      );

      // Conectar a la base de datos
      await this.db.connect(this.mongoUri, this.dbName);
      
      this.logger.info(
        `Connected to MongoDB at ${this.mongoUri}`
      );
    } catch (error) {
      this.logger.error("Failed to connect to MongoDB:", error);
      throw error;
    }
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

    await this.initializeDatabase();
    
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
