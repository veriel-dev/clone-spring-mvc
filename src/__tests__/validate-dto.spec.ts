import "reflect-metadata";
import { Request, Response, NextFunction } from "express";
import { validateDTO } from "../utils/validateDTO";
import { IsRequired, MinLength, IsEmail } from "../config/decorators/Validation";

class TestDTO {
  @IsRequired()
  @MinLength(3)
  name: string;

  @IsRequired()
  @IsEmail()
  email: string;

  constructor() {
    this.name = "";
    this.email = "";
  }
}

function createMockReqResNext(body: Record<string, any>) {
  const req = { body } as Request;
  const mockRes: Record<string, any> = {
    statusCode: 200,
    jsonData: null,
    status(code: number) {
      mockRes.statusCode = code;
      return mockRes;
    },
    json(data: any) {
      mockRes.jsonData = data;
      return mockRes;
    },
  };
  const next = jest.fn() as jest.Mock & NextFunction;
  return { req, res: mockRes as any, next };
}

describe("validateDTO middleware", () => {
  it("should call next() when no DTO class is provided", () => {
    const middleware = validateDTO(undefined);
    const { req, res, next } = createMockReqResNext({});

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should call next() with valid data", () => {
    const middleware = validateDTO(TestDTO);
    const { req, res, next } = createMockReqResNext({
      name: "John",
      email: "john@test.com",
    });

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it("should return 400 with validation errors for invalid data", () => {
    const middleware = validateDTO(TestDTO);
    const { req, res, next } = createMockReqResNext({
      name: "",
      email: "invalid",
    });

    middleware(req, res, next);

    const mockRes = res as any;
    expect(mockRes.statusCode).toBe(400);
    expect(mockRes.jsonData.errors).toBeDefined();
    expect(mockRes.jsonData.errors.name).toBeDefined();
    expect(mockRes.jsonData.errors.email).toBeDefined();
    expect(next).not.toHaveBeenCalled();
  });

  it("should ignore body keys not present in DTO", () => {
    const middleware = validateDTO(TestDTO);
    const { req, res, next } = createMockReqResNext({
      name: "John",
      email: "john@test.com",
      extraField: "should be ignored",
    });

    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.body.extraField).toBeUndefined();
  });

  it("should assign validated body to req.body", () => {
    const middleware = validateDTO(TestDTO);
    const { req, res, next } = createMockReqResNext({
      name: "John",
      email: "john@test.com",
    });

    middleware(req, res, next);

    expect(req.body).toBeInstanceOf(TestDTO);
    expect(req.body.name).toBe("John");
    expect(req.body.email).toBe("john@test.com");
  });
});
