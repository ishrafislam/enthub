const timeFormatter = new Intl.DateTimeFormat(undefined, {
  hour: '2-digit',
  minute: '2-digit',
})

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatKickoffTime(timestamp: number): string {
  return timeFormatter.format(new Date(timestamp))
}

export function formatKickoffDateTime(timestamp: number): string {
  return dateTimeFormatter.format(new Date(timestamp))
}

/** YYYY-MM-DD in the user's local timezone, as the API's date filter expects. */
export function toDateInputValue(date: Date): string {
  const offset = date.getTimezoneOffset() * 60_000
  return new Date(date.getTime() - offset).toISOString().slice(0, 10)
}

export function todayDateValue(): string {
  return toDateInputValue(new Date())
}
