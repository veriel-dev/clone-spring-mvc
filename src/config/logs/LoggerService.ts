import winston from "winston";
import { Service } from "../decorators";
import colors from "colors/safe";

@Service()
export class LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: "info",
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.printf(({ level, message, timestamp }) => {
          let coloredLevel: string;
          const upperCaseLevel = level.toUpperCase();
          switch (level) {
            case "info":
              coloredLevel = colors.green(upperCaseLevel);
              break;
            case "warn":
              coloredLevel = colors.yellow(upperCaseLevel);
              break;
            case "error":
              coloredLevel = colors.red(upperCaseLevel);
              break;
            case "debug":
              coloredLevel = colors.blue(upperCaseLevel);
              break;
            default:
              coloredLevel = upperCaseLevel;
          }
          const formattedDate = this.formatDate(new Date(timestamp as string));
          return `${colors.cyan(formattedDate)} [${coloredLevel}]: ${message}`;
        })
      ),
      transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: "logs/error.log", level: "error" }),
        new winston.transports.File({ filename: "logs/combined.log" }),
      ],
    });
  }
  private formatDate(date: Date): string {
    const pad = (num: number) => num.toString().padStart(2, "0");

    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    const seconds = pad(date.getSeconds());

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  }
  info(message: string, meta?: any) {
    this.logger.info(colors.green(message), meta);
  }

  warn(message: string, meta?: any) {
    this.logger.warn(colors.yellow(message), meta);
  }

  error(message: string, meta?: any) {
    this.logger.error(colors.red(message), meta);
  }

  debug(message: string, meta?: any) {
    this.logger.debug(colors.blue(message), meta);
  }
}
