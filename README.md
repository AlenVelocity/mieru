# LLM SWE

## Workspace

The basic idea is to have an AI Agent who is an equivalent of a Human Software engineer.

- The agent will have its own docker container. The idea is to have the agent set up the specific environment based on the task given.

## Memory

Short-term memory implementation to keep track of the tasks and the progress of the tasks.

## Layers

1. **I/O Layer**: 
    - This is the layer where the Agent will interact with the user. 
    - The agent will keep the user updated about the progress of the project. 
    - The user can also ask the agent to perform certain tasks. 
    - The agent will also ask the user for certain inputs.

2. **Planning Layer**: 
    - Plans and the sequence of the tasks to be performed.

3. **Control Layer**: 
    - Control the execution of the tasks. 
    - The agent will make decisions based on the input and task outcomes.

4. **Execution Layer**: 
    - This is the layer where the agent will execute the tasks. 
    - Creates a sub plan focusing on the current task and executes it.

## Function Calling

- The agent will have access to the entire workspace without any restrictions (Terminal, File I/O, Network I/O, etc.). 
- Agent will be able to directly interact with the system and perform tasks.

## Flow

User asks the agent to perform a task

1. **Layer 1: I/O Layer**
    - Agent asks for the details of the task
    - Agent asks for the inputs required to perform the task

2. **Layer 2: Planning Layer**
    - Agent plans the tasks to be performed
    - Agent plans the sequence of the tasks to be performed

3. **Layer 3: Control Layer**
    - Agent controls the execution of the tasks
    - Agent makes decisions based on the input and task outcomes

4. **Layer 4: Execution Layer**
    - Agent executes the tasks
    - Creates a sub plan (planning layer) -> controls the execution (control layer) -> executes the sub plan (execution layer)
        - Function calling
        - File I/O
        - Network I/O
        - Terminal I/O
        - etc

---

## Browser Automation

The idea is to have an agent that will be able to perform tasks on the web browser. The agent will be able to perform tasks like:
- Open a web page
- Click on a button
- Fill a form
- etc.

This isn't your standard web crawler. Here we won't be manually defining the DOM elements to interact with. LLMs would take in a cleaned-up version of the web page and then decide what to do based on the task. This can be really complex.

### Challenges:

- How to handle loading/progress states. (When you click on a button, the page might take a few seconds to load a certain section)
- How to handle dynamic content.
- Proper authentication. (Logging in to a website)

### Problems:

It is not ideal to pass in the entire DOM to the agent. It'd make everything really slow and costly.

I was thinking to use an object detection model to detect the DOM elements and then identify elements like forms, buttons, etc. But again, this would make it even slower than it needs to be.

### Examples:

- **User:** "Close all the issues created before last week on my last updated GitHub repository"
    - The agent would go to GitHub, login, find the last updated repository, find the issues created before last week, and close them.

- **User:** "Book a flight ticket from Delhi to Mumbai."
    - The agent would use a search engine to search for the flight tickets, then open the relevant website, fill the form with the available data of the user (prompt the user for the data if not available), and then book the ticket.

**Note:** THESE ARE NOT THE USE CASES. THESE ARE JUST EXAMPLES TO GIVE AN IDEA OF WHAT THE AGENT WOULD BE ABLE TO DO. The actual use case would be to have the agent perform tasks that a software engineer would do, like setting up API Keys on specific services, setting up a server on AWS, etc.