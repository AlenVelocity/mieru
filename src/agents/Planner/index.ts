import { AgentExecutor } from 'langchain/agents'

import { runnableAgent } from './agent'
import { browser, searchTool } from './tools'

export const planner = AgentExecutor.fromAgentAndTools({
    agent: runnableAgent,
    tools: [searchTool, browser],
    verbose: true
})
