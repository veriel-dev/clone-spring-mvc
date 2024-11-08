import "reflect-metadata";

export function Service(): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata("service", true, target);
  };
}
