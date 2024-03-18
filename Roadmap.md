## LLM SWE Development Roadmap

2 Week - Sprint 1

Goals

- **Implement Basic LLM Operations:**
    - At least Terminal and File System Operations.
- **SWE Workspace Configuration:**
    - Setup a highly modular and easily setupable workspace for the LLM SWE. 


### Operations // Callable Functions

These operations are directly accessible to the LLM:

#### File System (FS) Operations

- **Directory Retrieval:**
    - We can just store the entire code base in memory for now then build up on it later.
- **File Editing (Entire File)**
    - Edit the entire file at once. 
- **File Editing (Diff)**
    - Line by line diff based editing.

#### Browser Operations

- **Branch Website Navigation:** Ability to traverse through website branches.
- **Fully Automated Browser Interactions:** Execute interactions on web browsers autonomously.

#### Terminal Operations

- **Session Management:** Manage sessions within the terminal environment.
- **Single Command Execution:** Execute single commands within the terminal.

### Workspace Configuration

Docker Swarm- 

More details to be added.

### Agents (Layers)

These are individual LLM agents or chains designed for specific tasks. 

They should be subclasses of the same parent class to ensure consistency. All agents should follow a similar behavioral pattern.

Each agent is designed with a distinct goal and has access to same or different operations.


### Communication

Keep the communication sequential between the agents. I don't think we need to worry about this for now.

More details to be added.

### Memory

More details to be added.


### Forntend

Basic NextJS Frontend for the SWE

Main window would be split into two sections:

- Chat Section
   - This is where the user can interact with the LLM SWE

- Workspace Section
    - This would be split into two sections:
        - Terminal Section: Live feed of the Terminal the SWE is using.
    - Tabs: Navigate between Browser and File System Operations.

