import { afterEach, describe, expect, it, vi } from "vitest";
import { listClients, PocketIdError } from "./index";

const config = { host: "https://id.example.com/", apiKey: "secret" };

function mockFetch(body: unknown, init: ResponseInit = {}) {
  const fn = vi.fn(
    async () => new Response(JSON.stringify(body), { headers: { "content-type": "application/json" }, ...init }),
  );
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => vi.unstubAllGlobals());

describe("listClients", () => {
  it("sends the API key, search and pagination and reports hasMore", async () => {
    const fn = mockFetch({
      data: [{ id: "1", name: "Grafana" }, { name: "no id" }],
      pagination: { currentPage: 1, totalPages: 2, itemsPerPage: 20, totalItems: 25 },
    });
    const result = await listClients(config, { search: "graf", page: 1 });

    const request = (fn.mock.calls[0] as unknown as [Request])[0];
    expect(request.headers.get("X-API-KEY")).toBe("secret");
    const url = new URL(request.url);
    expect(url.origin + url.pathname).toBe("https://id.example.com/api/oidc/clients");
    expect(url.searchParams.get("search")).toBe("graf");
    expect(url.searchParams.get("pagination[page]")).toBe("1");
    expect(result.clients.map((c) => c.id)).toEqual(["1"]);
    expect(result.hasMore).toBe(true);
  });

  it("throws a PocketIdError on non-2xx", async () => {
    mockFetch({ error: "API key is invalid" }, { status: 401 });
    await expect(listClients(config, { page: 1 })).rejects.toMatchObject({
      name: "PocketIdError",
      status: 401,
      message: "API key is invalid",
    });
    expect(PocketIdError).toBeDefined();
  });
});
