import { Action, ActionPanel, getPreferenceValues, Icon, List, openExtensionPreferences } from "@raycast/api";
import { usePromise } from "@raycast/utils";
import { useState } from "react";
import { listClients, type OidcClient } from "./api";
import ClientDetail, { ClientActions } from "./client-detail";
import { useClientLogo } from "./use-client-logo";

function ClientItem({ client }: { client: OidcClient }) {
  const logo = useClientLogo(client);
  return (
    <List.Item
      title={client.name}
      subtitle={client.description}
      icon={logo ?? Icon.Globe}
      accessories={[{ tag: client.isPublic ? "public" : "confidential" }]}
      actions={
        <ActionPanel>
          <ClientActions client={client} />
          <Action.Push title="Show Details" icon={Icon.Sidebar} target={<ClientDetail client={client} />} />
        </ActionPanel>
      }
    />
  );
}

export default function Command() {
  const { host, apiKey } = getPreferenceValues<Preferences>();
  const [search, setSearch] = useState("");

  const { data, isLoading, pagination, error } = usePromise(
    (query: string) =>
      async ({ page }: { page: number }) => {
        const { clients, hasMore } = await listClients({ host, apiKey }, { search: query, page: page + 1 });
        return { data: clients, hasMore };
      },
    [search],
  );

  return (
    <List
      isLoading={isLoading}
      pagination={pagination}
      onSearchTextChange={setSearch}
      throttle
      searchBarPlaceholder="Search OIDC clients"
    >
      {error ? (
        <List.EmptyView
          icon={Icon.ExclamationMark}
          title="Could not load OIDC clients"
          description={error.message}
          actions={
            <ActionPanel>
              <Action title="Open Extension Preferences" icon={Icon.Gear} onAction={openExtensionPreferences} />
            </ActionPanel>
          }
        />
      ) : (
        <>
          <List.EmptyView title="No OIDC clients found" />
          {data?.map((client) => (
            <ClientItem key={client.id} client={client} />
          ))}
        </>
      )}
    </List>
  );
}
