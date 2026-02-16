export function formatTimestampToDateString(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toISOString().split('T')[0];
}
