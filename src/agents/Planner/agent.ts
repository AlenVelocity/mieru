import { GPT_3_5_TURBO } from '../../llms/OpenAI'

import { RunnableSequence } from '@langchain/core/runnables'

import { type AgentStep } from 'langchain/schema'
import { convertToOpenAIFunction } from '@langchain/core/utils/function_calling'
import { browser, formatAgentSteps, responseOpenAIFunction, searchTool, structuredOutputParser } from './tools'
import { prompt } from './prompt'

const llmWithTools = GPT_3_5_TURBO.bind({
    functions: [convertToOpenAIFunction(searchTool), convertToOpenAIFunction(browser), responseOpenAIFunction]
})

export const runnableAgent = RunnableSequence.from<{
    input: string
    steps: Array<AgentStep>
}>([
    {
        input: (i) => i.input,
        agent_scratchpad: (i) => formatAgentSteps(i.steps)
    },
    prompt,
    llmWithTools,
    structuredOutputParser
])
