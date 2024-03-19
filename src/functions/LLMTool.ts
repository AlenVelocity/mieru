import { StructuredTool } from 'langchain/tools'
import { z } from 'zod'

export type LLMToolOptions<T> = {
    name: string
    description: string
    schema: T
}

/*
    Base class for LLM Tools
    This class is meant to be extended by the user to create a new LLM Tool.
*/
export class LLMTool<T extends z.ZodObject<any, any, any, any>> extends StructuredTool<T> {
    public name: string
    public description: string
    public schema: T

    constructor(options: LLMToolOptions<T>) {
        super()
        this.name = options.name
        this.description = options.description
        this.schema = options.schema
    }

    public async _call(_params: z.infer<(typeof this)['schema']>): Promise<string> {
        throw new Error('Method not implemented.')
    }
}
