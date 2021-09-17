import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt"
import { RegisterDto } from "src/auth/dto/register.dto";
import { User, UserDocument } from "./schema/user.schema";


@Injectable()
export class UsersService {
    constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

    async findByUsername(username:string) {
        const user = this.userModel.findOne({
            username
        }).exec()

        return user
    }

    async create(body:RegisterDto) {
        const newUser = {
            username:body.username,
            password:body.password
        }

        const salt = await bcrypt.genSalt()

        newUser.password = await bcrypt.hash(body.password, salt)

        const user = new this.userModel(newUser)
        await user.save()

        return user
    }
}