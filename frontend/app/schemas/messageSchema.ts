// npm install zod

import z from "zod"

export const messageSchema = z.object({
    text: z
        .string()
        .trim()
        .min(1, { message: "Please enter a message to analyze" })
        .max(5000, { message: "Message must not exceed 5000 characters" })
})
