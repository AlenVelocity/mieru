import { ChatOpenAI } from '@langchain/openai'

export const GPT_3_5_TURBO = new ChatOpenAI({
    openAIApiKey: process.env.OPENAI_API_KEY,
    modelName: 'gpt-3.5-turbo',
    temperature: 0
})