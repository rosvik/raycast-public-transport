import { Color, Icon, List } from "@raycast/api";
import { EstimatedCall, TransportMode } from "./types";
import { getTransportIcon } from "./utils";

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
            title="Operator"
            text={ec.serviceJourney.operator?.name}
          />
        </List.Item.Detail.Metadata>
      }
    />
  );
}

function getModeText(transportMode?: TransportMode, transportSubmode?: string) {
  return transportSubmode === "unknown" ? transportMode : `${transportMode} / ${transportSubmode}`;
}
