import { IsMongoId } from 'class-validator';

export class DeleteFilesDto {
    @IsMongoId({
        each:true
    })
    files: string[]
}