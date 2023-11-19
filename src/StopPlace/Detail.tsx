import { Color, Icon, Image, List } from "@raycast/api";
import { getFavicon } from "@raycast/utils";
import { EstimatedCall, SjEstimatedCall, TransportMode } from "../types";
import { formatAsClock, formatDestinationDisplay, getTransportIcon } from "../utils";

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
                ? getFavicon(ec.serviceJourney.line.authority?.url, {
                    mask: Image.Mask.RoundedRectangle,
                  })
                : undefined
            }
          />
          <List.Item.Detail.Metadata.Label
            title="Line"
            text={`${ec.serviceJourney.line.publicCode ?? ""} ${formatDestinationDisplay(
              ec.destinationDisplay
            )}`}
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
          {ec.realtime && ec.expectedDepartureTime && (
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
      markdown={getEstimatedCallsMarkdown(ec.serviceJourney.estimatedCalls, ec.quay.id)}
    />
  );
}

function getEstimatedCallsMarkdown(ec: Array<SjEstimatedCall>, quayId: string) {
  const currentIndex = ec.findIndex((a) => a.quay.id === quayId);
  if (!ec.length || currentIndex < 0) return;

  const upcomingEstimatedCalls = ec.slice(currentIndex);
  const numberOfTruncatedStops = currentIndex - 1;

  const lines: Array<string | false> = [
    currentIndex > 0 && `${estimatedCallText(ec[0])}`,
    numberOfTruncatedStops === 1 && `${estimatedCallText(ec[1])}`,
    numberOfTruncatedStops > 1 && `••• ${numberOfTruncatedStops} intermediate stops •••`,
    ...upcomingEstimatedCalls.map((e) => {
      return e.quay.id === quayId
        ? `---\n\n## ${estimatedCallText(e)}\n\n---`
        : estimatedCallText(e);
    }),
  ].filter(Boolean);

  return lines.join("\n\n");
}

function getModeText(transportMode?: TransportMode, transportSubmode?: string) {
  return transportSubmode === "unknown" ? transportMode : `${transportMode} / ${transportSubmode}`;
}

function estimatedCallText(e: SjEstimatedCall) {
  return `\`${formatAsClock(e.expectedDepartureTime || e.aimedDepartureTime)}\` ${e.quay.name} ${
    e.quay.publicCode ?? ""
  }`;
}
