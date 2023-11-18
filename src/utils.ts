import { Color, Icon, Image } from "@raycast/api";
import { DestinationDisplay, DirectionType, TransportMode } from "./types";
import { useEffect, useState } from "react";

export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debouncedValue;
}

export function getTransportIcon(transportMode?: TransportMode, transportSubmode?: string): Image {
  switch (transportMode) {
    case TransportMode.Rail:
      return { source: "transport-modes/Train.svg", tintColor: Color.Red };
    case TransportMode.Bus:
      if (transportSubmode === "localBus") {
        return { source: "transport-modes/Bus.svg", tintColor: Color.Green };
      }
      return { source: "transport-modes/Bus.svg", tintColor: Color.Blue };
    case TransportMode.Coach:
      return { source: "transport-modes/Bus.svg", tintColor: Color.Purple };
    case TransportMode.Air:
      return { source: "transport-modes/Plane.svg", tintColor: Color.Orange };
    case TransportMode.Water:
      return { source: "transport-modes/Ferry.svg", tintColor: Color.Blue };
    case TransportMode.Tram:
      return { source: "transport-modes/Tram.svg", tintColor: Color.Yellow };
    case TransportMode.Metro:
      return { source: "transport-modes/Subway.svg", tintColor: Color.Magenta };
    default:
      return { source: Icon.QuestionMark };
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
