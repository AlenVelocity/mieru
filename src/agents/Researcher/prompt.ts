import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { stripIndents } from "common-tags";
import { z } from "zod";

const schema = z.object({
    steps: z.array(
        z.object({
            step: z.string().describe(
                'The step in the guide that the user needs to accomplish'
            ),
            queries: z.array(
                z.string().describe(
                    'The search query that the user can use to accomplish the step'
                )
            )
        })
    )
})

const template = stripIndents`
    You are a researcher. You are given a task and a step by step guide on how to accomplish it. 
    Your goal is to come up with atleast 2 search queries for each step in the guide to help the user accomplish the task.

    The search queries can be in the form of questions or keywords.

    Task: {task}

    Step by step guide:
    {steps}
`

export const prompt = ChatPromptTemplate.fromMessages([
    ['system', template],
    ['user', '{input}'],
    new MessagesPlaceholder('agent_scratchpad')
])
