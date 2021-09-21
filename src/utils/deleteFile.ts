import { unlink } from "fs/promises"
import { join } from 'path'


async function deleteFile(filename:string) : Promise<"success" | "error"> {
    try {
        await unlink(join(process.cwd(),filename))
        return "success"
    } catch(e) {
        return "error"
    }
}

export default deleteFile