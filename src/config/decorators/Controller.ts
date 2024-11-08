export function Controller(prefix: string = ""): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata("controller", true, target);
    Reflect.defineMetadata("prefix", prefix, target);
  };
}
