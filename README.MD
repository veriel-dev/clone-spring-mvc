# Clone Spring MVC

Framework backend para Node.js inspirado en Spring MVC. Proporciona un sistema de decoradores, inyeccion de dependencias, ODM para MongoDB y validacion de DTOs usando TypeScript y Express.

> **Objetivo**: convertirse en una libreria npm reutilizable para construir APIs REST con arquitectura MVC basada en decoradores.

## Caracteristicas

- **Decoradores de routing**: `@Controller`, `@Get`, `@Post`, `@Put`, `@Delete`
- **Inyeccion de dependencias**: `@Service`, `@Inject` con contenedor IoC
- **ODM para MongoDB**: `@Model` con DocumentManager generico (CRUD completo)
- **Validacion de DTOs**: `@IsRequired`, `@IsEmail`, `@MinLength`, `@MaxLength`, `@IsNumber`
- **Inyeccion de variables de entorno**: `@Value("KEY", default)`
- **Auto-discovery**: escaneo automatico de controllers y services
- **Logging estructurado**: Winston con salida coloreada y archivos
- **Error handling centralizado**: mapeo automatico de errores a codigos HTTP

## Stack Tecnologico

| Categoria | Tecnologia |
|-----------|-----------|
| Runtime | Node.js + TypeScript 5.x |
| HTTP | Express 4.x |
| Base de datos | MongoDB 6.x (driver nativo + ODM custom) |
| Metaprogramacion | reflect-metadata |
| Seguridad | bcryptjs |
| Logging | Winston |
| Testing | Jest + ts-jest + supertest |
| Linting | ESLint + @typescript-eslint |

## Inicio Rapido

### Requisitos previos

- Node.js >= 18
- pnpm
- MongoDB (local o Atlas)

### Instalacion

```bash
pnpm install
```

### Configuracion

Crear un archivo `.env` en la raiz del proyecto:

```env
PORT=3000
MAX_PORT_ATTEMPTS=10
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=spring-mvc-clone
```

### Desarrollo

```bash
pnpm dev
```

### Build y produccion

```bash
pnpm build
pnpm start
```

## Uso

### Crear un servicio

```typescript
import { Service } from "./config/decorators";

@Service()
export class ProductService {
  async getAll() {
    // logica de negocio
  }
}
```

### Crear un controller

```typescript
import { Controller, Get, Post, Inject } from "./config/decorators";
import { ProductService } from "../services/ProductService";
import { Request, Response } from "express";

@Controller("/products")
export class ProductController {
  constructor(@Inject() private productService: ProductService) {}

  @Get("/")
  async getAll() {
    return await this.productService.getAll();
  }

  @Post("/")
  async create(req: Request, res: Response) {
    const product = await this.productService.create(req.body);
    res.status(201).json(product);
  }
}
```

### Definir un modelo

```typescript
import { Model } from "./config/decorators/Model";
import { BaseDocument } from "./odm/base-document";

@Model("products")
export class Product extends BaseDocument {
  name: string;
  price: number;
  stock: number;

  constructor(data?: Partial<Product>) {
    super(data);
    this.name = data?.name ?? "";
    this.price = data?.price ?? 0;
    this.stock = data?.stock ?? 0;
  }
}
```

### Validacion con DTOs

```typescript
import { IsRequired, MinLength, IsEmail } from "./config/decorators";

export class UserDTO {
  @IsRequired()
  @MinLength(3)
  name: string;

  @IsRequired()
  @IsEmail()
  email: string;
}
```

Aplicar en un controller con `@DTO(UserDTO)`:

```typescript
@Post("/")
@DTO(UserDTO)
async createUser(req: Request, res: Response) {
  // req.body ya esta validado
}
```

## Arquitectura

```
src/
├── config/
│   ├── decorators/        # @Controller, @Service, @Get, @Post, @Inject, @Value, @DTO, validaciones
│   ├── dependency/        # Contenedor IoC (DependencyContainer)
│   ├── routes/            # Router singleton de Express
│   ├── logs/              # Logger con Winston
│   ├── models/            # Definiciones de modelos MongoDB
│   ├── server/            # Clase Server (Express + middleware + boot)
│   └── GlobalConfig.ts    # Auto-discovery y registro de controllers/services
├── odm/                   # Object Document Mapper custom para MongoDB
│   ├── base-document.ts   # Clase base abstracta
│   ├── document-manager.ts # CRUD generico (create, find, update, delete)
│   ├── database.service.ts # Conexion y registry de managers
│   └── models.registry.ts  # Registro de modelos @Model
├── users/                 # Modulo ejemplo: Users
├── products/              # Modulo ejemplo: Products
├── seed/                  # Modulo ejemplo: Seed de BD
├── utils/                 # Middleware validateDTO
└── app.ts                 # Entry point
```

## API Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| POST | /api/seed/run | Poblar BD con datos de prueba |
| GET | /api/seed/status | Estado del seed |
| GET | /api/users | Listar usuarios (paginado) |
| GET | /api/users/:id | Obtener usuario por ID |
| POST | /api/users | Crear usuario |
| PUT | /api/users/:id | Actualizar usuario |
| DELETE | /api/users/:id | Eliminar usuario |
| GET | /api/products | Listar productos (paginado, filtros) |
| GET | /api/products/:id | Obtener producto por ID |
| POST | /api/products | Crear producto |
| PUT | /api/products/:id | Actualizar producto |
| DELETE | /api/products/:id | Eliminar producto |

## Scripts

```bash
pnpm dev              # Desarrollo con hot-reload
pnpm build            # Compilar TypeScript
pnpm start            # Ejecutar version compilada
pnpm test             # Ejecutar tests
pnpm test:watch       # Tests en modo watch
pnpm test:coverage    # Tests con cobertura
pnpm lint             # Ejecutar ESLint
pnpm lint:fix         # ESLint con auto-fix
```

## Tests

El proyecto incluye tests unitarios para los componentes core del framework:

- **Decoradores**: `@Controller`, `@Service`, `@Get/@Post/@Put/@Delete`, `@Inject`, `@DTO`, `@Value`, validaciones
- **DependencyContainer**: registro, resolucion, cache, DI recursiva
- **validateDTO middleware**: validacion de request body

```bash
pnpm test
```

## Roadmap

- [ ] Publicar como paquete npm
- [ ] Documentacion OpenAPI/Swagger
- [ ] Soporte para middleware custom por ruta
- [ ] Transacciones MongoDB
- [ ] CI/CD con GitHub Actions
- [ ] Docker

## Autor

Victor Manuel Ordiales Garcia

## Licencia

MIT
