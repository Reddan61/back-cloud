import { AuthService } from './auth.service';
import { Body, Controller, Post, Req, Res, UseGuards, Response, Delete, Get } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { ControllerType } from 'src/interfaces/controller';

@Controller("/auth")
export class AuthController {
    constructor(
      readonly authService:AuthService  
    ) {}
    
    //check authorized
    @UseGuards(JwtAuthGuard)
    @Get("/me")
    async me(@Req() req) : ControllerType {
        return this.authService.me(req.user)
    }

    @Post("/register")
    async register(@Body() body: RegisterDto): ControllerType {
        return this.authService.register(body) 
    }

    @UseGuards(LocalAuthGuard)
    @Post("/login")
    async login(@Req() request, @Res({ passthrough: true }) response: Response) : ControllerType {
        return this.authService.login(request, response)
    }

    @UseGuards(JwtAuthGuard)
    @Delete("/logout")
    async logout(@Res({ passthrough: true }) response: Response) : ControllerType {
        return this.authService.logout(response)
    }
}