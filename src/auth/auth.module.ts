import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "src/users/users.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { LocalStrategy } from "./local.strategy";



@Module({
    imports: [
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>('SECRET_KEY'),
                signOptions: { expiresIn: String(config.get<string>('EXPIRES_IN')) }
            })
        }),
        UsersModule, PassportModule
    ],
    controllers: [ AuthController ],
    providers: [ AuthService, LocalStrategy, JwtStrategy ],
})
export class AuthModule {}