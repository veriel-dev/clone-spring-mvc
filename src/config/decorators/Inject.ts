import "reflect-metadata";

export function Inject(): ParameterDecorator {
  return (
    target: Object,
    propertyKey: string | symbol | undefined,
    parameterIndex: number
  ) => {
    const existingInjections = Reflect.getMetadata("injections", target) || [];
    existingInjections.push({ propertyKey, parameterIndex });
    Reflect.defineMetadata("injections", existingInjections, target);
  };
}
