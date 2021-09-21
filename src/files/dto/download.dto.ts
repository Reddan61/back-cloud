import { IsMongoId } from "class-validator";

export class DownloadDto {
    @IsMongoId({
        each:true
    })
    files: string[]

    @IsMongoId({
        each:true
    })
    folders: string[]
}