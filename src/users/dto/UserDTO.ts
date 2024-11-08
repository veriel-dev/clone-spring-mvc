import {
  IsRequired,
  MinLength,
  MaxLength,
  IsNumber,
  IsEmail,
} from "../../config/decorators";
export class UserDTO {
  @IsRequired()
  @MinLength(3)
  @MaxLength(50)
  name: string;

  @IsRequired()
  @IsEmail()
  email: string;

  @IsRequired()
  @IsNumber()
  age: number;

  constructor(name: string, email: string, age: number) {
    this.name = name;
    this.email = email;
    this.age = age;
  }
}
