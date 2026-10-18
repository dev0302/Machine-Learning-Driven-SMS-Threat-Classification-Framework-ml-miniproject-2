import { messageSchema } from "@/app/schemas/messageSchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest){

    try {
        // 1. Read incoming JSON
        const body = await req.json();

        // 2. Validate input
        const result = messageSchema.safeParse(body);

        // 3. Stop if validation fails
        if (!result.success) {
            return NextResponse.json(
                { error: result.error.issues[0].message },
                { status: 400 }
            );
        }

        // 4. Send validated text to FastAPI
        const response = await fetch(
            `${process.env.ML_API_URL}/predict`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    text: result.data.text,
                }),
                cache: "no-store",
            }
        );

        // 5. Handle unsuccessful ML responses
        if (!response.ok) {
            const errorData = await response.json().catch(() => null);

            return NextResponse.json(
                {
                    error: "Failed to analyze the message.",
                    details: errorData?.detail || errorData || "Unknown ML API error",
                },
                { status: 502 }
            );
        }

        // 6. Read the prediction
        const prediction = await response.json();

        // 7. Return the result to the frontend
        return NextResponse.json(prediction);

    } catch (error) {

        console.error("Prediction API error:", error);

        return NextResponse.json(
            { error: "Unable to process the prediction request." },
            { status: 500 }
        );
    }


}
