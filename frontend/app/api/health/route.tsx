import { NextResponse } from "next/server";

// no caching config needed: with cacheComponents on, route handlers are
// uncached by default, and fetch below also uses cache: "no-store"

export async function GET(){

    try {
        // 1. Ping the FastAPI health endpoint with a short timeout
        const response = await fetch(
            `${process.env.ML_API_URL}/health`,
            {
                method: "GET",
                cache: "no-store",
                signal: AbortSignal.timeout(8000),
            }
        );

        // 2. Render sends 502/503 while the instance is starting
        //    any other answer (even a 404 if /health is missing) means the app is up
        if (response.status >= 500) {
            return NextResponse.json(
                { status: "waking" },
                { status: 503 }
            );
        }

        // 3. Backend is awake and the model is loaded
        return NextResponse.json({ status: "ok" });

    } catch (error) {

        // 4. Timeout or connection error, backend is asleep or still booting
        //    (also lands here if ML_API_URL is missing, so check the terminal)
        console.error("Health check failed:", error);

        return NextResponse.json(
            { status: "waking" },
            { status: 503 }
        );
    }


}