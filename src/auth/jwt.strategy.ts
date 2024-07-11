import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: (req) => {
        const token = req.cookies?.Authorization?.split(' ')[1] ?? "";

        return token;
      },
      ignoreExpiration: false,
      secretOrKey: process.env.SECRET_KEY,
    });
  }

  async validate(payload: any):Promise<IValidateJWT> {
    return { userId: payload.userId, username: payload.username };
  }
}

export interface IValidateJWT {
    userId:string,
    username:string
}