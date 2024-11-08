import "reflect-metadata";

function createHttppMethodDecorator(method: string) {
  return (path: string): MethodDecorator => {
    return (
      target: Object,
      propertyKey: string | symbol,
      descriptor: PropertyDescriptor
    ) => {
      const routes = Reflect.getMetadata("routes", target.constructor) || [];
      routes.push({ method, path, handlerName: propertyKey });
      Reflect.defineMetadata("routes", routes, target.constructor);
    };
  };
}

export const Get = createHttppMethodDecorator("GET");
export const Post = createHttppMethodDecorator("POST");
export const Put = createHttppMethodDecorator("PUT");
export const Delete = createHttppMethodDecorator("DELETE");
