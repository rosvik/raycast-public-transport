import { Color, Icon, Image } from "@raycast/api";
import { DestinationDisplay, DirectionType, TransportMode, VenueCategory } from "./types";
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

const TrainIcon: Image = { source: "transport-modes/Train.svg", tintColor: Color.Red };
const RegionalBusIcon: Image = { source: "transport-modes/Bus.svg", tintColor: Color.Blue };
const LocalBusIcon: Image = { source: "transport-modes/Bus.svg", tintColor: Color.Green };
const CoachIcon: Image = { source: "transport-modes/Bus.svg", tintColor: Color.Purple };
const AirIcon: Image = { source: "transport-modes/Plane.svg", tintColor: Color.Orange };
const WaterIcon: Image = { source: "transport-modes/Ferry.svg", tintColor: Color.Blue };
const TramIcon: Image = { source: "transport-modes/Tram.svg", tintColor: Color.Yellow };
const MetroIcon: Image = { source: "transport-modes/Subway.svg", tintColor: Color.Magenta };
const UnknownIcon: Image = { source: Icon.PlusSquare, tintColor: Color.Blue };

export function getTransportIcon(transportMode?: TransportMode, transportSubmode?: string): Image {
  switch (transportMode) {
    case TransportMode.Rail:
      return TrainIcon;
    case TransportMode.Bus:
      if (transportSubmode === "localBus") {
        return LocalBusIcon;
      }
      return RegionalBusIcon;
    case TransportMode.Coach:
      return CoachIcon;
    case TransportMode.Air:
      return AirIcon;
    case TransportMode.Water:
      return WaterIcon;
    case TransportMode.Tram:
      return TramIcon;
    case TransportMode.Metro:
      return MetroIcon;
    default:
      return UnknownIcon;
  }
}

export function getVenueCategoryIcon(categories: VenueCategory[]): Image {
  if (categories.length === 0) return UnknownIcon;
  if (categories.length > 1) {
    if (categories.includes("airport")) {
      return AirIcon;
    }
    if (categories.includes("railStation")) {
      return TrainIcon;
    }
    if (categories.includes("metroStation")) {
      return MetroIcon;
    }
    if (
      categories.includes("ferryPort") ||
      categories.includes("ferryStop") ||
      categories.includes("harbourPort")
    ) {
      return WaterIcon;
    }
    return UnknownIcon;
  }

  const category = categories[0];
  switch (category) {
    case "railStation":
    case "vehicleRailInterchange":
      return TrainIcon;
    case "busStation":
    case "onstreetBus":
    case "coachStation":
      return LocalBusIcon;
    case "airport":
      return AirIcon;
    case "ferryPort":
    case "ferryStop":
    case "harbourPort":
      return WaterIcon;
    case "tramStation":
    case "onstreetTram":
      return TramIcon;
    case "metroStation":
      return MetroIcon;
    default:
      return UnknownIcon;
  }
}

export function formatAsClock(isoString: string) {
  const d = new Date(isoString);
  const padTime = (n: number) => n.toString().padStart(2, "0");
  return `${padTime(d.getHours())}:${padTime(d.getMinutes())}`;
}

export function formatAsClockWithSeconds(isoString: string) {
  const d = new Date(isoString);
  const padTime = (n: number) => n.toString().padStart(2, "0");
  return `${padTime(d.getHours())}:${padTime(d.getMinutes())}:${padTime(d.getSeconds())}`;
}

export function formatDirection(direction: DirectionType) {
  switch (direction) {
    case "anticlockwise":
      return "Anticlockwise";
    case "clockwise":
      return "Clockwise";
    case "inbound":
      return "Inbound";
    case "outbound":
      return "Outbound";
    case "unknown":
      return undefined;
  }
}

export function getDomainName(url: string) {
  const domain = new URL(url).hostname;
  return domain.startsWith("www.") ? domain.slice(4) : domain;
}

export function formatDestinationDisplay(dd?: DestinationDisplay) {
  if (!dd) return "";
  if (!dd.via || dd.via.length === 0) return dd.frontText ?? "";

  const count = dd.via.length;
  const viaString = dd.via
    .map((v, i) => {
      if (count === 1) return v;
      if (i === count - 1) return `and ${v}`;
      return `${v}, `;
    })
    .join("");
  return `${dd.frontText ?? "Unknown"} via ${viaString}`;
}
