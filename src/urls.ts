export function normalizeHost(host: string): string {
  const trimmed = host.trim().replace(/\/+$/, "");
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

export function adminClientUrl(host: string, clientId: string): string {
  return `${normalizeHost(host)}/settings/admin/oidc-clients/${encodeURIComponent(clientId)}`;
}

/** The launch URL if the client has one, otherwise the client's page in the Pocket ID admin UI. */
export function primaryUrl(client: { id: string; launchURL?: string }, host: string): string {
  const launch = client.launchURL?.trim();
  return launch ? launch : adminClientUrl(host, client.id);
}
