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
    const tokens = Reflect.getMetadata("design:paramtypes", target) || [];
    const injections = tokens.map((token: any) => this.resolve(token));

    return new target(...injections);
  }
}

export const Container = DependencyContainer.getInstance();
