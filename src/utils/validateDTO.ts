import { NextFunction, Request, Response } from "express";
import { validate } from "../config/decorators";

export function validateDTO(dtoClass: any) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!dtoClass) return next();

    const instance = new dtoClass();

    Object.keys(req.body).forEach((key) => {
      if (key in instance) {
        instance[key] = req.body[key];
      }
    });

    const validationResult = validate(instance);

    if (!validationResult.isValid) {
      return res.status(400).json({ errors: validationResult.errors });
    }
    req.body = instance;
    next();
  };
}
