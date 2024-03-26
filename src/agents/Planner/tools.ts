import { GPT_3_5_TURBO } from '../../llms/OpenAI'
import { z } from 'zod'

import { WebBrowser } from 'langchain/tools/webbrowser'
import { SerpAPI } from '@langchain/community/tools/serpapi'
import { OpenAIEmbeddings } from '@langchain/openai'

import { type BaseMessage, AIMessage, FunctionMessage, type AgentFinish, type AgentStep } from 'langchain/schema'
import { FunctionsAgentAction } from 'langchain/dist/agents/openai_functions/output_parser'
import zodToJsonSchema from 'zod-to-json-schema'

export const searchTool = new SerpAPI(process.env.SERPAPI_KEY)
export const browser = new WebBrowser({
    model: GPT_3_5_TURBO,
    embeddings: new OpenAIEmbeddings()
})

const schema = z.object({
    projectName: z.string().min(5).describe('The name of the project based on the user input'),
    response: z.string().min(10).describe("AI's response to the user, describing how the project will be planned"),
    steps: z.array(z.string()).min(1).describe('The steps that the AI will take to plan the project')
})

export const responseOpenAIFunction = {
    name: 'response',
    description: 'Return the response to the user',
    parameters: zodToJsonSchema(schema)
}

export const structuredOutputParser = (message: AIMessage): FunctionsAgentAction | AgentFinish => {
    if (message.content && typeof message.content !== 'string') {
        throw new Error('This agent cannot parse non-string model responses.')
    }
    if (message.additional_kwargs.function_call) {
        const { function_call } = message.additional_kwargs
        try {
            const toolInput = function_call.arguments ? JSON.parse(function_call.arguments) : {}
            if (function_call.name === 'response') {
                return { returnValues: { ...toolInput }, log: message.content }
            }
            return {
                tool: function_call.name,
                toolInput,
                log: `Invoking "${function_call.name}" with ${function_call.arguments ?? '{}'}\n${message.content}`,
                messageLog: [message]
            }
        } catch (error) {
            throw new Error(
                `Failed to parse function arguments from chat model response. Text: "${function_call.arguments}". ${error}`
            )
        }
    } else {
        return {
            returnValues: { output: message.content },
            log: message.content
        }
    }
}

export const formatAgentSteps = (steps: AgentStep[]): BaseMessage[] =>
    steps.flatMap(({ action, observation }) => {
        if ('messageLog' in action && action.messageLog !== undefined) {
            const log = action.messageLog as BaseMessage[]
            return log.concat(new FunctionMessage(observation, action.tool))
        } else {
            return [new AIMessage(action.log)]
        }
    })
