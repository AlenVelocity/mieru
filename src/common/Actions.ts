export enum Action {

    // Task
    INIT = 'INIT',
    START = 'START',
    
    // Commands
    RUN = 'RUN',
    KILL = 'KILL',

    // Events
    COMPLETE = 'COMPLETE',
    ERROR = 'ERROR',
    TIMEOUT = 'TIMEOUT',

    // Agent
    CHAT = 'CHAT',
    THINK = 'THINK',

    // FS
    READ = 'READ',
    WRITE = 'WRITE',

    // DB
    QUERY = 'QUERY',

    // Misc
    LOG = 'LOG',
    NULL = 'NULL'

}