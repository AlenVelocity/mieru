import * as os from 'os'
import * as path from 'path'
import fs from 'fs'
import { z } from 'zod'
import { LLMFunction } from '../Decorators/LLMFunction'
import { LLMTool } from '../LLMTool'
import { findFiles, rindex } from '../../common/utils'

/*
    This is the schema for the LLM Function call.
    The LLM would output something like { 
        "path": "/home/user",
        "depth": 1
    }
    The agent would then call the function with the given parameters.
*/
const dirTreeSchema = z.object({
    path: z.string().describe('The path to the directory to be listed.'),
    depth: z.number().default(1).describe('The depth to list the directory to.')
})

@LLMFunction('DirectoryTree', {
    description: 'List the contents of a directory.',
    schema: dirTreeSchema
})
export class DirectoryTree extends LLMTool<typeof dirTreeSchema> {
    public basePath: string = os.homedir()

    /*
        This is the implementation of the function call.
        The function call is passed the parameters from the LLM.
        The function should return a string.
    */
    public async _call(params: z.infer<typeof dirTreeSchema>) {
        const { path: givenPath, depth } = params

        if (!fs.existsSync(this.basePath)) {
            return 'Base path does not exist'
        }

        const pathParts = givenPath.split(path.sep)
        let effectivePath: string

        if (pathParts.includes('.')) {
            const remaining_path = pathParts.slice(rindex(pathParts, '.') + 1)
            effectivePath = path.join(this.basePath, ...remaining_path)
        } else {
            effectivePath = path.relative(this.basePath, givenPath)
        }

        if (givenPath.includes('~')) return 'Path cannot contain ~'

        if (!path.relative(this.basePath, effectivePath).startsWith('..')) return 'Path is not within the base path'

        try {
            const listed_paths = findFiles(effectivePath, depth)
            return JSON.stringify({ paths: listed_paths })
        } catch (e) {
            return JSON.stringify(e)
        }
    }
}

const createFileSchema = z.object({
    path: z.string().describe('The path to the file to be created.'),
    content: z.string().describe('The content to write to the file.'),
})

@LLMFunction('CreateFile', {
    description: 'Create a file with the given content.',
    schema: createFileSchema
})
export class CreateFile extends LLMTool<typeof createFileSchema> {
    public basePath: string = os.homedir()

    public async _call(params: z.infer<typeof createFileSchema>) {
        const { path: givenPath, content } = params

        if (!fs.existsSync(this.basePath)) {
            return 'Base path does not exist'
        }

        const pathParts = givenPath.split(path.sep)
        let effectivePath: string

        if (pathParts.includes('.')) {
            const remaining_path = pathParts.slice(rindex(pathParts, '.') + 1)
            effectivePath = path.join(this.basePath, ...remaining_path)
        } else {
            effectivePath = path.relative(this.basePath, givenPath)
        }

        if (givenPath.includes('~')) return 'Path cannot contain ~'

        if (!path.relative(this.basePath, effectivePath).startsWith('..')) return 'Path is not within the base path'

        try {
            fs.writeFileSync(effectivePath, content)
            return 'File created'
        } catch (e) {
            return JSON.stringify(e)
        }
    }
}

const readFileSchema = z.object({
    path: z.string().describe('The path to the file to be read.')
})

