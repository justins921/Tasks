import { NextRequest, NextResponse } from "next/server";

/**
 * API route proxy for external integration services.
 *
 * Receives: { provider, url, method, body, credentials }
 * Forwards the request to the external API with proper auth headers,
 * then returns the response. This avoids CORS issues since the
 * browser only talks to our own origin.
 *
 * When you move to Supabase, credentials will come from the DB
 * instead of the request body.
 */
export async function POST(req: NextRequest) {
  try {
    const { provider, url, method, body, credentials } = await req.json();

    if (!url || !provider) {
      return NextResponse.json({ error: "Missing url or provider" }, { status: 400 });
    }

    // Build headers based on provider
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    switch (provider) {
      case "trello":
        // Trello uses query params for auth (already in URL)
        break;

      case "clickup":
        headers["Authorization"] = credentials.apiToken || "";
        break;

      case "asana":
        headers["Authorization"] = `Bearer ${credentials.accessToken || ""}`;
        break;

      case "monday":
        headers["Authorization"] = credentials.apiToken || "";
        headers["API-Version"] = "2024-01";
        break;

      default:
        return NextResponse.json({ error: `Unknown provider: ${provider}` }, { status: 400 });
    }

    const fetchOpts: RequestInit = {
      method: method || "GET",
      headers,
    };

    if (body && method !== "GET") {
      fetchOpts.body = JSON.stringify(body);
    }

    const res = await fetch(url, fetchOpts);
    const contentType = res.headers.get("content-type") || "";

    if (!res.ok) {
      const errorText = contentType.includes("json")
        ? JSON.stringify(await res.json())
        : await res.text();
      return NextResponse.json(
        { error: `${provider} API returned ${res.status}: ${errorText}` },
        { status: res.status }
      );
    }

    if (contentType.includes("json")) {
      const data = await res.json();
      return NextResponse.json(data);
    }

    const text = await res.text();
    return new NextResponse(text, { status: 200 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
