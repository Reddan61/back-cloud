import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as mongoose from "mongoose"
import * as express from "express"
import * as JSZip from "jszip"
import * as moment from "moment";
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'
import { IValidateJWT } from "src/auth/jwt.strategy";
import { FileDocument, File } from "./schemas/file.schema";
import { Folder, FolderDocument } from "./schemas/folder.schema";
import deleteFile from "src/utils/deleteFile";
import { fstat } from "fs";
import { DownloadDto } from "./dto/download.dto";



@Injectable()
export class FilesService {
    constructor(
        @InjectModel(File.name) 
        private fileModel: Model<FileDocument>,
        @InjectModel(Folder.name) 
        private folderModel: Model<FolderDocument>
    ) {}

    async getFiles(folderId:string, user:IValidateJWT) {
        if(folderId && !mongoose.Types.ObjectId.isValid(folderId)) {
            throw new BadRequestException()
        }

        const folders = await this.folderModel.find({
            folder: folderId as any,
            user: user.userId as any
        }).exec()
        
        const files = await this.fileModel.find({
            folder: folderId as any,
            user: user.userId as any
        }).exec()

        return {
            message:"success",
            payload: {
                data: {
                    folders,
                    files
                }
            }
        }
    }

    async uploadFiles(user:IValidateJWT,folder:string | null, files: Array<Express.Multer.File>) {
        if(folder && !mongoose.Types.ObjectId.isValid(folder)) {
            throw new BadRequestException()
        }

        const result = []

        for(let i = 0; i < files.length; i++) {
            const newFile = {
                filename: files[i].originalname,
                mimetype: files[i].mimetype,
                user: user.userId,
                uploadname: files[i].path,
                folder
            }

            if(!folder) {
                delete newFile.folder
            }

            const file = new this.fileModel(newFile)
            await file.save()
            result.push(file)
        }

        return {
            message:"success",
            payload: {
                data: result
            }
        }
    }

    async createFolder(user:IValidateJWT,folder:string | null, foldername:string) {
        if(folder && !mongoose.Types.ObjectId.isValid(folder)) {
            throw new BadRequestException()
        }

        const newFolder = {
            foldername,
            user: user.userId,
            folder
        }

        if(!folder) {
            delete newFolder.folder
        }

        const result = new this.folderModel(newFolder)
        await result.save()

        return {
            message: "success",
            payload: {
                data:result
            }
        }
    }


    async deleteFiles(files:string[], user:IValidateJWT) {
        const result = await this.fileModel.find({
            _id: {
                $in: files
            },
            user: user.userId as any
        })
        for(let i = 0; i < result.length; i++) {
            const response = await deleteFile(result[i].uploadname)
            if(response === "success") {
                await result[i].deleteOne()
            }
        }
        
        return {
            message:"success",
            payload: {
                data: result
            }
        }
    }

    async deleteFolder(folders:string[], user:IValidateJWT) {
        //удалит все дочерние файлы и папки
        const chainDelete = async (folderId) => {
            if(!folderId) {
                return
            }

            const folders = await this.folderModel.find({
                $and: [
                    {
                        $or: [
                            {_id: folderId},
                            {folder: folderId}
                        ],
                        user: user.userId as any
                    }
                ]
                
            }).exec()

            const files = await this.fileModel.find({
                folder:folderId,
                user: user.userId as any
            }).exec()

            for(let i = 0; i < files.length; i++) {
                const response = await deleteFile(files[i].uploadname)
                if(response === "success") {
                    await files[i].deleteOne()
                }
            }

            folders.forEach(el => {
                el.deleteOne()
                if(String(el._id) !== String(folderId)) {
                    chainDelete(el._id)
                }
            })
            
        }

        folders.forEach(el => {
            chainDelete(el)
        })

        return {
            message:"success",
            payload: {
                data: {

                }
            }
        }
    }

    async download(body:DownloadDto, user:IValidateJWT, response: express.Response) {
        const zip = new JSZip()
        const files = await this.fileModel.find({
            _id:{
                $in: body.files
            },
            user: user.userId as any
        }).exec()

        const folders = await this.folderModel.find({
            _id: {
                $in: body.folders
            },
            user: user.userId as any
        }).exec()

        for(let i = 0; i < files.length; i++ ) {
            const fileContent = await readFile(join(process.cwd(), files[i].uploadname))
            zip.file(files[i].filename,fileContent)
        }

        //Пройдет всю вложенность
        const takeAllFilesFromFolder = async (folderId:string,root) => {
            if(!folderId) {
                return
            }
            const folders = await this.folderModel.find({
                $and: [
                    {
                        $or: [
                            {_id: folderId},
                            {
                                folder: folderId as any
                            }
                        ],
                        user: user.userId as any
                    }
                ]
                
            }).exec()


            const files = await this.fileModel.find({
                folder:folderId as any,
                user: user.userId as any
            }).exec()
           
            for(let i = 0; i < files.length; i++) {
                const fileContent = await readFile(join(process.cwd(), files[i].uploadname))
                root.file(files[i].filename, fileContent, { base64:true })
            }

            for(let i = 0; i < folders.length; i++) {
                if(String(folders[i]._id) !== String(folderId)) {
                    const newRoot = root.folder(folders[i].foldername)
                    await takeAllFilesFromFolder(folders[i]._id,newRoot)
                }
            }
        }

        for(let i = 0; i < folders.length; i++) {
            const newFolder = zip.folder(folders[i].foldername)
            await takeAllFilesFromFolder(folders[i]._id,newFolder)
        }

        const content = await zip.generateAsync({type:"nodebuffer"})
        const date = moment().format("DDMMYYYY-HHmmss-SSS")
        const path = `${join(process.cwd(),"/uploads/",date)}.zip`
        await writeFile(path,content)

        response.download(path, () => {
            deleteFile(`/uploads/${date}.zip`)
        })
    }
}