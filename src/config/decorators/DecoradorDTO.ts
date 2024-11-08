import "reflect-metadata";

export function DTO(dtoClass: new (...args: any[]) => any) {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    Reflect.defineMetadata("dto", dtoClass, target, propertyKey);
  };
}
