import { Body, Controller, Delete, Get, Param, Post, Query, Req, Res, UploadedFiles, UseGuards, UseInterceptors } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import * as express from "express"
import { JwtAuthGuard } from "src/auth/guards/jwt-auth.guard";
import { ControllerType } from "src/interfaces/controller";
import { DeleteFilesDto } from "./dto/delete-files.dto";
import { DeleteFoldersDto } from "./dto/delete-folders.dto";
import { DownloadDto } from "./dto/download.dto";
import { FilesService } from "./files.service";



@Controller("/files")
export class FilesController {
    constructor(
        private filesService: FilesService
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get("/")
    async getFilesAndFolders(@Query() query, @Req() request): ControllerType {
        return this.filesService.getFiles(query.folder, request.user)
    }

    @UseGuards(JwtAuthGuard)
    @Post("/upload")
    @UseInterceptors(FilesInterceptor('files'))
    async uploadFile(@UploadedFiles() files: Array<Express.Multer.File>, @Req() request, @Body() body): ControllerType {
        return this.filesService.uploadFiles(request.user,body.folder,files)
    }

    @UseGuards(JwtAuthGuard)
    @Post("/folder")
    async createFolder(@Req() request, @Body() body): ControllerType {
        return this.filesService.createFolder(request.user,body.folder,body.foldername)
    }

    @UseGuards(JwtAuthGuard)
    @Delete("/files")
    async deleteFiles(@Body() body:DeleteFilesDto, @Req() request): ControllerType  {
        return this.filesService.deleteFiles(body.files, request.user)
    }

    @UseGuards(JwtAuthGuard)
    @Delete("/folder")
    async deleteFolders(@Body() body:DeleteFoldersDto, @Req() request): ControllerType {
        return this.filesService.deleteFolder(body.folders, request.user)
    }

    @UseGuards(JwtAuthGuard)
    @Post("/download")
    async download(@Body() body:DownloadDto,@Res() response:express.Response, @Req() request) {
        return this.filesService.download(body,request.user,response)
    }
}