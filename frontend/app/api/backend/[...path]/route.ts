const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:8081";

async function proxy(request, context) {
  const { path } = await context.params;
  const target = `${BACKEND_URL}/${path.join("/")}`;
  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  const authorization = request.headers.get("authorization");

  if (contentType) headers.set("content-type", contentType);
  if (authorization) headers.set("authorization", authorization);

  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await request.text();

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    const responseType = response.headers.get("content-type");
    if (responseType) responseHeaders.set("content-type", responseType);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    return Response.json(
      { message: "Backend is unavailable. Start Spring Boot on port 8081." },
      { status: 503 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const DELETE = proxy;
export const PUT = proxy;
export const PATCH = proxy;
