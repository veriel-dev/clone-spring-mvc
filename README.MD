# Clone Spring MVC

Proyecto backend basado en arquitectura MVC (Modelo-Vista-Controlador) implementado con Node.js y TypeScript.


Proyecto que implementa un sistema de decoradores similar a Spring MVC utilizando TypeScript y Express.
Tecnologías Utilizadas

## Express
Framework minimalista y flexible para Node.js que permite crear APIs REST de forma rápida y sencilla. Se eligió por:

- Su simplicidad y rendimiento
- Gran comunidad y documentación
- Fácil integración con middleware
- Flexibilidad para crear rutas y endpoints

## TypeScript
Superconjunto de JavaScript que añade tipado estático. Se utiliza para:

- Proporcionar mejor autocompletado y detección de errores
- Mejorar el mantenimiento del código
- Facilitar el desarrollo de decoradores
- Hacer el código más robusto y predecible

## reflect-metadata
Biblioteca que permite añadir y leer metadatos de clases y métodos. Fundamental para:

- Implementar decoradores similares a Spring
- Inyección de dependencias
- Lectura de metadatos en tiempo de ejecución
- Crear una estructura similar a frameworks como Spring MVC

## ts-node-dev
Utilidad de desarrollo que:

- Reinicia automáticamente la aplicación cuando hay cambios
- Compila TypeScript al vuelo
- Mejora la experiencia de desarrollo

## Objetivo del Proyecto
Este proyecto busca implementar un sistema de decoradores similar a Spring MVC pero en el ecosistema Node.js, combinando la flexibilidad de Express con el poder del tipado estático de TypeScript y la metaprogramación mediante decoradores.


## Estado Actual del Proyecto

Actualmente se ha implementado una API REST básica con las siguientes características:

### Implementaciones Realizadas

- **Configuración ODM MongoDB**: Implementación básica para la conexión y manejo de datos con MongoDB.
- **Endpoints CRUD Básicos**: Se han desarrollado operaciones CRUD para las siguientes entidades:
  - Seeds (datos de prueba)
  - Users (gestión de usuarios)
  - Products (gestión de productos)

## Próximas Implementaciones

### Mejoras Prioritarias

1. **Validación de Modelos**
   - Implementar validación de esquemas
   - Agregar reglas de negocio específicas
   - Validación de tipos de datos y formatos

2. **Manejo Global de Errores**
   - Implementar middleware de errores centralizado
   - Estandarizar respuestas de error
   - Logging de errores
   - Manejo de excepciones personalizado

3. **Mejoras en Operaciones CRUD**
   - Implementar paginación
   - Agregar filtros avanzados
   - Optimizar consultas
   - Implementar soft delete
   - Añadir historial de cambios

### Mejoras Futuras

- **Seguridad**
  - Implementación de autenticación
  - Sistema de roles y permisos
  - Protección contra ataques comunes

- **Documentación**
  - Documentación detallada de API con Swagger/OpenAPI
  - Guías de desarrollo
  - Ejemplos de uso

- **Performance**
  - Implementación de caché
  - Optimización de consultas
  - Indexación avanzada


## Autor 
Víctor Manuel Ordiales García

## Licencia
MIT
