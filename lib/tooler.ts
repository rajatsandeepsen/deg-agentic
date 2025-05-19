import type { Tool, ToolExecutionOptions } from "ai"
import type { z } from "zod"

export const ToolRunner = <T extends Record<string, Tool>>(tools: T) =>
    async <N extends keyof T>(toolName: N | string, data: z.infer<T[N]["parameters"]>) => {

        const tool = tools[toolName]

        if (!tool)
            throw new Error("Tool not found")

        const parsedData = tool.parameters.safeParse(Object.values(data).flat())

        if (!parsedData.success)
            throw new Error("Invalid data")

        if (!tool.execute)
            throw new Error("Tool not executable")

        const result = await tool.execute(parsedData.data, toolExecutionOptions)

        return result
    }

export const toolExecutionOptions: ToolExecutionOptions = {
    messages: [],
    toolCallId: "",
}