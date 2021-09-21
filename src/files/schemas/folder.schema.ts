import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import * as mongoose from "mongoose"
import { Document } from "mongoose";
import { File } from "./file.schema";

export type FolderDocument = Folder & Document

@Schema()
export class Folder {
    @Prop({
        required:true
    })
    foldername: string

    @Prop({
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'File',
        required:true
    })
    user: File

    @Prop({
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Folder',
        required:false
    })
    folder: Folder
}

export const FolderSchema = SchemaFactory.createForClass(Folder)