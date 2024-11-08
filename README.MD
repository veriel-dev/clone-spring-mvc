# Comparación de `target` en Decoradores de TypeScript

| Aspecto | ClassDecorator | MethodDecorator | ParameterDecorator |
|---------|----------------|-----------------|---------------------|
| **Tipo de `target`** | `Function` (constructor de la clase) | `Object` (prototipo de la clase para métodos de instancia, constructor para métodos estáticos) | `Object` (prototipo de la clase para métodos de instancia, constructor para métodos estáticos) |
| **Representa** | La clase decorada | El objeto que contiene el método decorado | El objeto que contiene el método con el parámetro decorado |
| **Uso común** | Modificar o aumentar la definición de la clase | Modificar o reemplazar la implementación del método | Recopilar información sobre los parámetros del método |
| **Acceso a metadatos** | Directo en la clase | En el prototipo para métodos de instancia, en la clase para métodos estáticos | En el prototipo para métodos de instancia, en la clase para métodos estáticos |
| **Ejemplo de código** | ```typescript
@ClassDecorator
class MyClass {}
``` | ```typescript
class MyClass {
  @MethodDecorator
  myMethod() {}
}
``` | ```typescript
class MyClass {
  myMethod(@ParamDecorator param: string) {}
}
