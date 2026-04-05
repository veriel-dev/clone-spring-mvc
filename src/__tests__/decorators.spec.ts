import "reflect-metadata";
import { Controller } from "../config/decorators/Controller";
import { Service } from "../config/decorators/Service";
import { Get, Post, Put, Delete } from "../config/decorators/HttpMethods";
import { Inject } from "../config/decorators/Inject";
import { DTO } from "../config/decorators/DecoradorDTO";
import { IsRequired, MinLength, MaxLength, IsEmail, IsNumber, validate } from "../config/decorators/Validation";
import { Value } from "../config/decorators/Value";

describe("@Controller decorator", () => {
  it("should set controller metadata to true", () => {
    @Controller("/test")
    class TestController {}

    expect(Reflect.getMetadata("controller", TestController)).toBe(true);
  });

  it("should set prefix metadata", () => {
    @Controller("/api/users")
    class UserController {}

    expect(Reflect.getMetadata("prefix", UserController)).toBe("/api/users");
  });

  it("should default prefix to empty string", () => {
    @Controller()
    class RootController {}

    expect(Reflect.getMetadata("prefix", RootController)).toBe("");
  });
});

describe("@Service decorator", () => {
  it("should set service metadata to true", () => {
    @Service()
    class TestService {}

    expect(Reflect.getMetadata("service", TestService)).toBe(true);
  });

  it("should not set controller metadata", () => {
    @Service()
    class TestService {}

    expect(Reflect.getMetadata("controller", TestService)).toBeUndefined();
  });
});

describe("HTTP method decorators", () => {
  it("@Get should register a GET route", () => {
    class TestController {
      @Get("/items")
      getItems() {}
    }

    const routes = Reflect.getMetadata("routes", TestController);
    expect(routes).toHaveLength(1);
    expect(routes[0]).toEqual({ method: "GET", path: "/items", handlerName: "getItems" });
  });

  it("@Post should register a POST route", () => {
    class TestController {
      @Post("/items")
      createItem() {}
    }

    const routes = Reflect.getMetadata("routes", TestController);
    expect(routes[0].method).toBe("POST");
  });

  it("@Put should register a PUT route", () => {
    class TestController {
      @Put("/items/:id")
      updateItem() {}
    }

    const routes = Reflect.getMetadata("routes", TestController);
    expect(routes[0]).toEqual({ method: "PUT", path: "/items/:id", handlerName: "updateItem" });
  });

  it("@Delete should register a DELETE route", () => {
    class TestController {
      @Delete("/items/:id")
      deleteItem() {}
    }

    const routes = Reflect.getMetadata("routes", TestController);
    expect(routes[0].method).toBe("DELETE");
  });

  it("should accumulate multiple routes on the same class", () => {
    class TestController {
      @Get("/")
      getAll() {}

      @Get("/:id")
      getById() {}

      @Post("/")
      create() {}
    }

    const routes = Reflect.getMetadata("routes", TestController);
    expect(routes).toHaveLength(3);
  });
});

describe("@Inject decorator", () => {
  it("should store injection metadata", () => {
    class TestClass {
      constructor(@Inject() private dep: any) {}
    }

    const injections = Reflect.getMetadata("injections", TestClass);
    expect(injections).toBeDefined();
    expect(injections).toHaveLength(1);
    expect(injections[0].parameterIndex).toBe(0);
  });
});

describe("@DTO decorator", () => {
  it("should set dto metadata on method", () => {
    class MyDTO {}

    class TestController {
      @DTO(MyDTO)
      createItem() {}
    }

    const instance = new TestController();
    const dtoClass = Reflect.getMetadata("dto", instance as Object, "createItem");
    expect(dtoClass).toBe(MyDTO);
  });
});

describe("Validation decorators", () => {
  class TestDTO {
    @IsRequired()
    @MinLength(3)
    @MaxLength(10)
    name: string;

    @IsRequired()
    @IsEmail()
    email: string;

    @IsRequired()
    @IsNumber()
    age: number;

    constructor(name: string = "", email: string = "", age: number = 0) {
      this.name = name;
      this.email = email;
      this.age = age;
    }
  }

  it("should pass validation with valid data", () => {
    const dto = new TestDTO("John", "john@test.com", 25);
    const result = validate(dto);
    expect(result.isValid).toBe(true);
    expect(Object.keys(result.errors)).toHaveLength(0);
  });

  it("should fail @IsRequired for empty string", () => {
    const dto = new TestDTO("", "john@test.com", 25);
    const result = validate(dto);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toContain("Field is required");
  });

  it("should fail @MinLength", () => {
    const dto = new TestDTO("ab", "john@test.com", 25);
    const result = validate(dto);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toContain("Minimum length is 3");
  });

  it("should fail @MaxLength", () => {
    const dto = new TestDTO("abcdefghijk", "john@test.com", 25);
    const result = validate(dto);
    expect(result.isValid).toBe(false);
    expect(result.errors.name).toContain("Maximum length is 10");
  });

  it("should fail @IsEmail for invalid email", () => {
    const dto = new TestDTO("John", "not-an-email", 25);
    const result = validate(dto);
    expect(result.isValid).toBe(false);
    expect(result.errors.email).toContain("Invalid email format");
  });

  it("should fail @IsNumber for non-numeric value", () => {
    const dto = new TestDTO("John", "john@test.com", "abc" as any);
    const result = validate(dto);
    expect(result.isValid).toBe(false);
    expect(result.errors.age).toContain("Must be a number");
  });

  it("should collect multiple errors on the same field", () => {
    const dto = new TestDTO("", "john@test.com", 25);
    const result = validate(dto);
    expect(result.errors.name.length).toBeGreaterThanOrEqual(2);
  });
});

describe("@Value decorator", () => {
  it("should read environment variable", () => {
    process.env.TEST_VALUE_KEY = "hello";

    class TestConfig {
      @Value("TEST_VALUE_KEY")
      testProp!: string;
    }

    const config = new TestConfig();
    expect(config.testProp).toBe("hello");

    delete process.env.TEST_VALUE_KEY;
  });

  it("should use default value when env var is not set", () => {
    delete process.env.NONEXISTENT_KEY;

    class TestConfig {
      @Value("NONEXISTENT_KEY", "default_val")
      testProp!: string;
    }

    const config = new TestConfig();
    expect(config.testProp).toBe("default_val");
  });

  it("should convert numeric strings to numbers", () => {
    process.env.TEST_NUM = "42";

    class TestConfig {
      @Value("TEST_NUM")
      port!: number;
    }

    const config = new TestConfig();
    expect(config.port).toBe(42);

    delete process.env.TEST_NUM;
  });

  it("should convert 'true'/'false' to booleans", () => {
    process.env.TEST_BOOL = "true";

    class TestConfig {
      @Value("TEST_BOOL")
      flag!: boolean;
    }

    const config = new TestConfig();
    expect(config.flag).toBe(true);

    delete process.env.TEST_BOOL;
  });
});
