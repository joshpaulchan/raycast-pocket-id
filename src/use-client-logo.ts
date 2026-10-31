import { environment, getPreferenceValues } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { mkdir, writeFile } from "fs/promises";
import { join } from "path";
import { getClientLogo, type OidcClient } from "./api";

async function downloadLogo(host: string, apiKey: string, id: string): Promise<string | undefined> {
  const logo = await getClientLogo({ host, apiKey }, id);
  if (!logo) return undefined;
  const dir = join(environment.supportPath, "logos");
  await mkdir(dir, { recursive: true });
  const path = join(dir, `${id.replace(/[^\w-]/g, "_")}.${logo.extension}`);
  await writeFile(path, Buffer.from(logo.data));
  return path;
}

/** Path of the downloaded logo file for a client, or undefined while loading / if it has none. */
export function useClientLogo(client: OidcClient): string | undefined {
  const { host, apiKey } = getPreferenceValues<Preferences>();
  const { data } = useCachedPromise(
    async (id: string, hasLogo: boolean) => (hasLogo ? downloadLogo(host, apiKey, id) : undefined),
    [client.id, !!client.hasLogo],
  );
  return data;
}
