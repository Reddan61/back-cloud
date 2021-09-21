import { IsMongoId } from 'class-validator';

export class DeleteFoldersDto {
    @IsMongoId({
        each:true
    })
    folders: string[]
}