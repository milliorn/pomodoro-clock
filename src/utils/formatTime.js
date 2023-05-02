export function formatTime(rawMinutes, rawSeconds) {
  const minutes = rawMinutes.toString().padStart(2, "0");
  const seconds = rawSeconds.toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}
