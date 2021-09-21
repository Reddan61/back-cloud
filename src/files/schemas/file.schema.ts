import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose"
import { Document } from "mongoose";
import { User } from "src/users/schema/user.schema";
import { Folder } from "./folder.schema";

export type FileDocument = File & Document

@Schema()
export class File {
    @Prop({
        required:true
    })
    filename: string

    @Prop({
        required:true
    })
    mimetype:string

    @Prop({
        required:true
    })
    uploadname:string

    @Prop({
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required:true
    })
    user: User

    @Prop({
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Folder',
        required:false
    })
    folder: Folder
}

export const FileSchema = SchemaFactory.createForClass(File)