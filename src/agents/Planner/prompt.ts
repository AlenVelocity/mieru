import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { stripIndents } from "common-tags";

const template = stripIndents`
        You are a software developer. Your duty is to plan a project based on the user input.

        Based on the user's input, you need to create a step-by-step plan to achieve the user's goal.

        You have access to a web browser and a search engine to help you plan the project.
        Utilize these to create a detailed plan. Make sure to be as technical as possible.
        Omit any unnecessary details and focus on the core steps needed to achieve the user's goal.
        If the user's input doesn't define any technical requirements, assume the user wants a technical solution
    
    `

export const prompt = ChatPromptTemplate.fromMessages([
    [
      "system",
      template,
    ],
    ["user", "{input}"],
    new MessagesPlaceholder("agent_scratchpad"),
  ]);
