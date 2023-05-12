import { Color, Icon, List } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { EstimatedCall, TransportMode } from "./types";
import { formatAsClock, getTransportIcon } from "./utils";

type DetailProps = {
  ec: EstimatedCall;
};

export function Detail({ ec }: DetailProps) {
  return (
    <List.Item.Detail
      metadata={
        <List.Item.Detail.Metadata>
          <List.Item.Detail.Metadata.Label title="Code" text={ec.serviceJourney.line.publicCode} />
          <List.Item.Detail.Metadata.Label
            title="Front text"
            text={ec.destinationDisplay?.frontText}
          />
          <List.Item.Detail.Metadata.Label
            title="Transport mode"
            text={getModeText(
              ec.serviceJourney.line.transportMode,
              ec.serviceJourney.line.transportSubmode
            )}
            icon={{
              ...getTransportIcon(
                ec.serviceJourney.line.transportMode,
                ec.serviceJourney.line.transportSubmode
              ),
              tintColor: Color.PrimaryText,
            }}
          />
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label
            title="Date"
            text={new Date(ec.aimedDepartureTime).toLocaleDateString("no-no")}
          />
          <List.Item.Detail.Metadata.Label
            title="Scheduled departure"
            text={new Date(ec.aimedDepartureTime).toLocaleTimeString("no-no")}
          />
          <List.Item.Detail.Metadata.Label
            title={`Estimated departure (${ec.realtime ? "real time" : "inaccurate"})`}
            text={new Date(ec.expectedDepartureTime).toLocaleTimeString("no-no")}
            icon={
              ec.realtime
                ? { source: Icon.CircleProgress100, tintColor: Color.Green }
                : { source: Icon.Signal1, tintColor: Color.SecondaryText }
            }
          />
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label
            title="Authority"
            text={ec.serviceJourney.line.authority?.name}
            icon={
              ec.serviceJourney.line.authority?.url
                ? getFavicon(ec.serviceJourney.line.authority?.url)
                : undefined
            }
          />
        </List.Item.Detail.Metadata>
      }
      markdown={ec.serviceJourney.estimatedCalls
        .map((e) => {
          return e.quay.id === ec.quay.id
            ? `\n\n---\n\n\`${formatAsClock(e.expectedDepartureTime)}\` **${
                e.quay.name
              }**\n\n---\n\n`
            : `\`${formatAsClock(e.expectedDepartureTime)}\` ${e.quay.name}`;
        })
        .join("\n\n")}
    />
  );
}

function getModeText(transportMode?: TransportMode, transportSubmode?: string) {
  return transportSubmode === "unknown" ? transportMode : `${transportMode} / ${transportSubmode}`;
}
