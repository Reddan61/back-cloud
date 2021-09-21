import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MulterModule } from "@nestjs/platform-express";
import * as moment from 'moment';
import { diskStorage } from "multer";
import { FilesController } from "./files.controller";
import { FilesService } from "./files.service";
import { FileSchema, File } from "./schemas/file.schema";
import { Folder, FolderSchema } from "./schemas/folder.schema";



@Module({
    imports: [
        MongooseModule.forFeature([{name: File.name, schema: FileSchema}]),
        MongooseModule.forFeature([{name: Folder.name, schema: FolderSchema}]),
        MulterModule.register({
            storage: diskStorage({
                destination: "uploads",
                filename(req,file: Express.Multer.File,cb) {
                    const date = moment().format("DDMMYYYY-HHmmss-SSS");
                    cb(null, `${date}--${file.originalname}`)
                }
            }),
            limits: {
                fileSize: 1 * 1024 * 1024 * 10 //10 MB
            }
        })
    ],
    controllers: [FilesController],
    providers: [FilesService]
})
export class FilesModule {}