import "reflect-metadata";
import "dotenv/config";

export function Value(envKey: string, defaultValue: any = undefined) {
  return function (target: any, propertyKey: string) {
    let value = process.env[envKey];

    if (value === undefined && defaultValue !== undefined) value = defaultValue;

    if (value === undefined) {
      console.warn(
        `Environment variable ${envKey} is not set and no default value provided for ${target.constructor.name}.${propertyKey}`
      );
    }

    Object.defineProperty(target, propertyKey, {
      get: () => {
        if (value === "true") return true;
        if (value === "false") return false;
        if (!isNaN(Number(value))) return Number(value);
        return value;
      },
      enumerable: true,
      configurable: true,
    });
  };
}
