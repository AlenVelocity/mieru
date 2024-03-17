import { ChatOpenAI } from '@langchain/openai'

const openai = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo',
    temperature: 0
})

export default openai
