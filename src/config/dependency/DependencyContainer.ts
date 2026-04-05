class DependencyContainer {
  private static instance: DependencyContainer;
  private dependencies: Map<string, any> = new Map();

  private constructor() {}

  static getInstance(): DependencyContainer {
    if (!DependencyContainer.instance) {
      DependencyContainer.instance = new DependencyContainer();
    }
    return DependencyContainer.instance;
  }

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

export const Container = DependencyContainer.getInstance();
