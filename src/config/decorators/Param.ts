import "reflect-metadata";

type TypePropertyKey = string | symbol;

type TypePropertyKeyParam = TypePropertyKey | undefined;

export function Param(paramName: string): ParameterDecorator {
  return (
    target: Object,
    propertyKey: TypePropertyKeyParam,
    parameterIndex: number
  ) => {
    const parameters =
      Reflect.getMetadata(
        "parameters",
        target,
        propertyKey as TypePropertyKey
      ) || [];
    parameters.push({ index: parameterIndex, name: paramName });
    Reflect.defineMetadata(
      "parameters",
      parameters,
      target,
      propertyKey as TypePropertyKey
    );
  };
}
