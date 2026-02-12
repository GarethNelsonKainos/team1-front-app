export function formatTimestampToDateString(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString('en-GB', {});
}
