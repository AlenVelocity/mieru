import 'dotenv/config'
import { planner } from './agents/Planner'

const main = async () => {
    const task = 'Make a tic tac toe app'

    const plan = await planner.invoke({ input: task })

    console.log(plan)
}

main()
