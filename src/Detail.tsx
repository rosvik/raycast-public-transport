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
          <List.Item.Detail.Metadata.Label
            title="Authority"
            text={ec.serviceJourney.line.authority?.name}
            icon={
              ec.serviceJourney.line.authority?.url
                ? getFavicon(ec.serviceJourney.line.authority?.url)
                : undefined
            }
          />
          <List.Item.Detail.Metadata.Label
            title="Line"
            text={`${ec.serviceJourney.line.publicCode ?? ""} ${
              ec.destinationDisplay?.frontText ?? ""
            }`}
            icon={{
              ...getTransportIcon(
                ec.serviceJourney.line.transportMode,
                ec.serviceJourney.line.transportSubmode
              ),
              tintColor: Color.SecondaryText,
            }}
          />

          {ec.serviceJourney.line.transportSubmode !== "unknown" && (
            <List.Item.Detail.Metadata.Label
              title="Transport mode"
              text={getModeText(
                ec.serviceJourney.line.transportMode,
                ec.serviceJourney.line.transportSubmode
              )}
            />
          )}
          <List.Item.Detail.Metadata.Separator />
          <List.Item.Detail.Metadata.Label
            title="Scheduled departure"
            text={
              new Date(ec.aimedDepartureTime).toLocaleDateString("no-no") +
              " " +
              new Date(ec.aimedDepartureTime).toLocaleTimeString("no-no")
            }
          />
          {ec.realtime && (
            <List.Item.Detail.Metadata.Label
              title={`Estimated departure (${
                ec.predictionInaccurate ? "inaccurate" : "real time"
              })`}
              text={new Date(ec.expectedDepartureTime).toLocaleTimeString("no-no")}
              icon={
                ec.realtime
                  ? {
                      source: Icon.CircleProgress100,
                      tintColor: ec.predictionInaccurate ? Color.Yellow : Color.Green,
                    }
                  : { source: Icon.Signal1, tintColor: Color.SecondaryText }
              }
            />
          )}
        </List.Item.Detail.Metadata>
      }
      markdown={ec.serviceJourney.estimatedCalls
        .map((e) => {
          return e.quay.id === ec.quay.id
            ? `\n\n---\n\n**\`${formatAsClock(e.expectedDepartureTime)}\` ${
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
