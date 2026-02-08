/**
 * Checks if an item is adult content
 */
export function isAdultContent<T extends { adult?: boolean }>(
  item: T | null | undefined,
): boolean {
  return item?.adult === true;
}

/**
 * Filters out adult content from an array of items
 * Also filters out null/undefined values for safety
 */
export function filterAdultContent<T extends { adult?: boolean }>(
  items: T[],
): T[] {
  return items.filter((item) => item != null && !isAdultContent(item));
}
