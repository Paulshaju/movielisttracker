import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { IRating } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRuntime(runtime: string) {
  const minutes = parseInt(runtime, 10);
  if (Number.isNaN(minutes)) return runtime;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
}
export function getRatingBadges(ratings: IRating[]) {
  const find = (source: string) =>
    ratings?.find((r) => r.Source === source)?.Value;
  return [
    { label: "IMDb", value: find("Internet movie Database") },
    { label: "RT", value: find("Rotten Tomatoes") },
    { label: "Meta", value: find("Metacritic") },
  ].filter((r) => r.value);
}
