import { Action, ActionPanel, Detail, getPreferenceValues, Icon, openExtensionPreferences } from "@raycast/api";
import type { OidcClient } from "./api";
import { useClientLogo } from "./use-client-logo";
import { adminClientUrl, primaryUrl } from "./urls";

export function ClientActions({ client }: { client: OidcClient }) {
  const { host } = getPreferenceValues<Preferences>();
  const hasLaunchUrl = primaryUrl(client, host) !== adminClientUrl(host, client.id);
  const admin = <Action.OpenInBrowser key="admin" title="Open in Pocket ID" url={adminClientUrl(host, client.id)} />;
  return (
    <ActionPanel>
      {hasLaunchUrl ? (
        <>
          <Action.OpenInBrowser title="Open Launch URL" url={primaryUrl(client, host)} />
          {admin}
        </>
      ) : (
        admin
      )}
      <Action.CopyToClipboard title="Copy Client ID" content={client.id} />
      {client.callbackURLs?.length ? (
        <Action.CopyToClipboard title="Copy Callback URLs" content={client.callbackURLs.join("\n")} />
      ) : null}
      <Action title="Open Extension Preferences" icon={Icon.Gear} onAction={openExtensionPreferences} />
    </ActionPanel>
  );
}

function list(urls?: string[]) {
  return urls?.length ? urls.map((u) => `- ${u}`).join("\n") : "_None_";
}

export default function ClientDetail({ client }: { client: OidcClient }) {
  const logo = useClientLogo(client);
  const markdown = [
    logo ? `<img src="file://${encodeURI(logo)}" alt="logo" width="96" height="96" />` : "",
    `# ${client.name}`,
    client.description ?? "",
    "## Callback URLs",
    list(client.callbackURLs),
    "## Logout Callback URLs",
    list(client.logoutCallbackURLs),
  ]
    .filter(Boolean)
    .join("\n\n");

  const { Metadata } = Detail;
  return (
    <Detail
      navigationTitle={client.name}
      markdown={markdown}
      actions={<ClientActions client={client} />}
      metadata={
        <Metadata>
          <Metadata.Label title="Client ID" text={client.id} />
          {client.launchURL ? (
            <Metadata.Link title="Launch URL" text={client.launchURL} target={client.launchURL} />
          ) : null}
          <Metadata.Label
            title="Client Type"
            text={client.clientType || (client.isPublic ? "public" : "confidential")}
          />
          <Metadata.Label title="PKCE" text={client.pkceEnabled ? "Enabled" : "Disabled"} />
          <Metadata.Label title="Skip Consent" text={client.skipConsent ? "Yes" : "No"} />
          {client.backchannelLogoutURL ? (
            <Metadata.Label title="Back-channel Logout" text={client.backchannelLogoutURL} />
          ) : null}
          <Metadata.Separator />
          <Metadata.Label title="Group Restricted" text={client.isGroupRestricted ? "Yes" : "No"} />
          {client.allowedUserGroups?.length ? (
            <Metadata.TagList title="Allowed Groups">
              {client.allowedUserGroups.map((g) => (
                <Metadata.TagList.Item key={g.id} text={g.name ?? g.id ?? ""} />
              ))}
            </Metadata.TagList>
          ) : null}
        </Metadata>
      }
    />
  );
}
