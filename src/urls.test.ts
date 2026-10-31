import { describe, expect, it } from "vitest";
import { adminClientUrl, normalizeHost, primaryUrl } from "./urls";

describe("normalizeHost", () => {
  it("trims whitespace and trailing slashes", () => {
    expect(normalizeHost(" https://id.example.com// ")).toBe("https://id.example.com");
  });
  it("defaults to https", () => {
    expect(normalizeHost("id.example.com")).toBe("https://id.example.com");
  });
  it("keeps http", () => {
    expect(normalizeHost("http://localhost:1411")).toBe("http://localhost:1411");
  });
});

describe("primaryUrl", () => {
  it("prefers the launch URL", () => {
    expect(primaryUrl({ id: "a", launchURL: "https://app.example.com" }, "https://id.example.com")).toBe(
      "https://app.example.com",
    );
  });
  it("falls back to the admin page when launchURL is missing or blank", () => {
    expect(primaryUrl({ id: "a b" }, "id.example.com/")).toBe(
      "https://id.example.com/settings/admin/oidc-clients/a%20b",
    );
    expect(adminClientUrl("https://id.example.com", "x")).toBe("https://id.example.com/settings/admin/oidc-clients/x");
    expect(primaryUrl({ id: "x", launchURL: "  " }, "https://id.example.com")).toBe(
      "https://id.example.com/settings/admin/oidc-clients/x",
    );
  });
});
