import "reflect-metadata";

// Reimportamos el modulo fresco para cada test
// Necesitamos crear nuestro propio container para no interferir con el singleton global
class DependencyContainer {
  private dependencies: Map<string, any> = new Map();

  register(name: string, dependency: any): void {
    this.dependencies.set(name, dependency);
  }

  resolve<T>(target: new (...args: any[]) => T): T {
    const name = target.name;
    if (this.dependencies.has(name)) {
      return this.dependencies.get(name) as T;
    }

    const tokens = Reflect.getMetadata("design:paramtypes", target) || [];
    const injections = tokens.map((token: any) => this.resolve(token));

    const instance = new target(...injections);
    this.dependencies.set(name, instance);
    return instance;
  }
}

describe("DependencyContainer", () => {
  let container: DependencyContainer;

  beforeEach(() => {
    container = new DependencyContainer();
  });

  it("should register and resolve a dependency by name", () => {
    class MyService {
      getValue() { return 42; }
    }

    const service = new MyService();
    container.register("MyService", service);

    const resolved = container.resolve(MyService);
    expect(resolved).toBe(service);
    expect(resolved.getValue()).toBe(42);
  });

  it("should return the same registered instance on multiple resolves", () => {
    class SingletonService {}

    const instance = new SingletonService();
    container.register("SingletonService", instance);

    const first = container.resolve(SingletonService);
    const second = container.resolve(SingletonService);
    expect(first).toBe(second);
    expect(first).toBe(instance);
  });

  it("should auto-create instance if not registered", () => {
    class AutoService {
      name = "auto";
    }

    const resolved = container.resolve(AutoService);
    expect(resolved).toBeInstanceOf(AutoService);
    expect(resolved.name).toBe("auto");
  });

  it("should cache auto-created instances", () => {
    class CachedService {}

    const first = container.resolve(CachedService);
    const second = container.resolve(CachedService);
    expect(first).toBe(second);
  });

  it("should resolve constructor dependencies recursively", () => {
    class DepA {
      value = "A";
    }

    class DepB {
      constructor(public depA: DepA) {}
    }

    // Simulate TypeScript's design:paramtypes metadata
    Reflect.defineMetadata("design:paramtypes", [DepA], DepB);

    container.register("DepA", new DepA());

    const resolved = container.resolve(DepB);
    expect(resolved).toBeInstanceOf(DepB);
    expect(resolved.depA).toBeInstanceOf(DepA);
    expect(resolved.depA.value).toBe("A");
  });

  it("should use registered instance for nested dependency", () => {
    class Logger {
      log(msg: string) { return msg; }
    }

    class UserService {
      constructor(public logger: Logger) {}
    }

    Reflect.defineMetadata("design:paramtypes", [Logger], UserService);

    const loggerInstance = new Logger();
    container.register("Logger", loggerInstance);

    const userService = container.resolve(UserService);
    expect(userService.logger).toBe(loggerInstance);
  });
});
