import { OpenAI } from 'langchain/llms/openai'
import { DirectoryTree } from '../../functions/Functions/FSOPS'
import { GPT_3_5_TURBO } from '../../llms/OpenAI'
import { stripIndents } from 'common-tags'

const llm = GPT_3_5_TURBO.bind({
    functions: [DirectoryTree.asOpenAIFunction()]
})

const template = stripIndents`
    You are an AI assistant who is abl
`
