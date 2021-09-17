import { IsNotEmpty, MaxLength, MinLength } from "class-validator";
import { Match } from "src/decorators/match.decorator";


export class RegisterDto {
    @IsNotEmpty()
    @MinLength(3)
    @MaxLength(30)
    readonly username:string

    @IsNotEmpty()
    @MinLength(3)
    readonly password:string

    @Match("password")
    readonly confirmPassword:string
}