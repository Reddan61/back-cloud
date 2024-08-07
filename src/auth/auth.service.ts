import { BadRequestException, HttpException, HttpStatus, Injectable, Response } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt"
import { UsersService } from "src/users/users.service";
import { RegisterDto } from "./dto/register.dto";
import { IValidateJWT } from "./jwt.strategy";

const AUTH_COOKIE_NAME = "Authorization";

@Injectable()
export class AuthService {
    constructor(
        private usersService:UsersService,
        private jwtService: JwtService
    ) {}

    async validateUser(username:string,password:string) {
        const user = await this.usersService.findByUsername(username)

        if(!user) {
            throw new HttpException("Пользователя не существует",HttpStatus.FORBIDDEN)
        }

        const isCurrect = await bcrypt.compare(password, user.password)
        if(user && isCurrect) {
            return {
                _id: user._id,
                username: user.username
            }
        }
        return null
    }

    async register(body:RegisterDto) {
        const userFound = await this.usersService.findByUsername(body.username)

        if(userFound) {
            throw new BadRequestException({
                error:"Пользователь существует"
            })
        }
        const user = await this.usersService.create(body)
       
        return {
            message:"success",
            payload: {
                data:user
            }
        }
    }

    async login(req,res) {
        const user = req.user
        const payload = { username: user.username, userId: user._id }

        const access_token = this.jwtService.sign(payload)
        
        res.cookie(AUTH_COOKIE_NAME, `bearer ${access_token}`, { 
            httpOnly:true,
            sameSite: "none",
            secure: true
        })
       
        return {
            message: "success",
            payload: {
                data: user
            }
        }
    }

    async logout(res) {
        res.cookie(AUTH_COOKIE_NAME, "", {
            httpOnly:true,
            maxAge: 0,
            sameSite: "none",
            secure: true
        })

        return {
            message:"success",
            payload:{}
        }
    }

    async me(user:IValidateJWT) {
        const userFound = this.usersService.findByUsername(user.username)

        if(!userFound) {
            throw new BadRequestException()
        }

        return {
            message:"success",
            payload: {
                data:user
            }
        }
    }
}