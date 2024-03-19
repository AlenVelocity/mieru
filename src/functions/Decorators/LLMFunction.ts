import { LLMToolOptions } from '../LLMTool'

/**
 * Class Decorator to be used for Callable LLM Functions
 * @param name Name of the function
 * @param options Options for the function
 * @returns
 */
export const LLMFunction = (name: string, options: Omit<LLMToolOptions<any>, 'name'>) => {
    return <T extends { new (...args: any[]): {} }>(constructor: T) => {
        return class extends constructor {
            constructor(...args: any[]) {
                super({
                    name,
                    ...options
                })
            }
        }
    }
}
