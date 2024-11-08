import "reflect-metadata";

const VALIDATION_METADATA_KEY = Symbol("validation");

interface ValidationRule {
  validator: (value: any) => boolean;
  message: string;
}

export function IsRequired() {
  return addValidation({
    validator: (value: any) =>
      value !== undefined && value !== null && value !== "",
    message: "Field is required",
  });
}
export function MinLength(min: number) {
  return addValidation({
    validator: (value: string) => value.length >= min,
    message: `Minimum length is ${min}`,
  });
}

export function MaxLength(max: number) {
  return addValidation({
    validator: (value: string) => value.length <= max,
    message: `Maximum length is ${max}`,
  });
}

export function IsEmail() {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return addValidation({
    validator: (value: string) => emailRegex.test(value),
    message: "Invalid email format",
  });
}

export function IsNumber() {
  return addValidation({
    validator: (value: any) => !isNaN(Number(value)),
    message: "Must be a number",
  });
}

function addValidation(rule: ValidationRule) {
  return (target: any, propertyKey: string) => {
    const validations =
      Reflect.getMetadata(VALIDATION_METADATA_KEY, target.constructor) || {};
    validations[propertyKey] = [...(validations[propertyKey] || []), rule];
    Reflect.defineMetadata(
      VALIDATION_METADATA_KEY,
      validations,
      target.constructor
    );
  };
}

export function validate(obj: any): {
  isValid: boolean;
  errors: { [key: string]: string[] };
} {
  const validations = Reflect.getMetadata(
    VALIDATION_METADATA_KEY,
    obj.constructor
  );
  const errors: { [key: string]: string[] } = {};

  for (const [property, rules] of Object.entries(validations)) {
    for (const rule of rules as ValidationRule[]) {
      if (!rule.validator(obj[property])) {
        if (!errors[property]) {
          errors[property] = [];
        }
        errors[property].push(rule.message);
      }
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
}
