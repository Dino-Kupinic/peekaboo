import { describe, expect, test } from "bun:test"
import withCors from "../../src/utils/withCors.ts"

describe("withCors", () => {
  test("should add CORS headers to the response", () => {
    const corsResponse = withCors("Test")

    expect(corsResponse.headers.get("Access-Control-Allow-Origin")).toBe("*")
    expect(corsResponse.headers.get("Access-Control-Allow-Methods")).toBe(
      "GET, POST, PUT, DELETE, OPTIONS",
    )
    expect(corsResponse.headers.get("Access-Control-Allow-Headers")).toBe(
      "Content-Type, Authorization",
    )
  })

  test("should return the correct response body", async () => {
    const corsResponse = withCors("Test", 200)
    const text = await corsResponse.text()
    expect(text).toBe("Test")
    expect(corsResponse.status).toBe(200)
  })
})
