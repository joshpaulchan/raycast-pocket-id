import { getApiOidcClients, getApiOidcClientsByIdLogo } from "./generated";
import type { DtoOidcClientWithAllowedGroupsDto } from "./generated";
import { normalizeHost } from "../urls";

export type OidcClient = DtoOidcClientWithAllowedGroupsDto & { id: string; name: string };

export interface ApiConfig {
  host: string;
  apiKey: string;
}

export const PAGE_SIZE = 20;

export class PocketIdError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message);
    this.name = "PocketIdError";
  }
}

function requestOptions({ host, apiKey }: ApiConfig) {
  return { baseUrl: normalizeHost(host), headers: { "X-API-KEY": apiKey } };
}

function toError(error: unknown, response?: Response): PocketIdError {
  const message = (error as { error?: string } | undefined)?.error;
  return new PocketIdError(message || response?.statusText || "Request to Pocket ID failed", response?.status);
}

export async function listClients(
  config: ApiConfig,
  { search, page }: { search?: string; page: number },
): Promise<{ clients: OidcClient[]; hasMore: boolean }> {
  let result;
  try {
    result = await getApiOidcClients({
      ...requestOptions(config),
      query: { search: search || undefined, "pagination[page]": page, "pagination[limit]": PAGE_SIZE },
    });
  } catch (e) {
    throw new PocketIdError(`Could not reach Pocket ID: ${(e as Error).message}`);
  }
  if (result.error !== undefined || !result.data) throw toError(result.error, result.response);
  const { data, pagination } = result.data;
  return {
    clients: (data ?? []).filter((c): c is OidcClient => !!c.id && !!c.name),
    hasMore: (pagination?.currentPage ?? page) < (pagination?.totalPages ?? 0),
  };
}

/** Fetches the client's logo bytes, or undefined if the client has none. */
export async function getClientLogo(
  config: ApiConfig,
  id: string,
): Promise<{ data: ArrayBuffer; extension: string } | undefined> {
  const result = await getApiOidcClientsByIdLogo({
    ...requestOptions(config),
    path: { id },
    query: { light: true },
    parseAs: "arrayBuffer",
  });
  if (result.error !== undefined || !result.data) return undefined;
  const type = result.response?.headers.get("content-type") ?? "";
  const extension = type.includes("svg") ? "svg" : type.includes("jpeg") ? "jpg" : "png";
  return { data: result.data as unknown as ArrayBuffer, extension };
}
