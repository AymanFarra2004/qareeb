/**
 * Location IDs organized by their respective governorates.
 * Extracted from the hierarchical JSON API provided at:
 * https://karam.idreis.net/api/v1/location?lang=en
 * 
 * Note: Gaza City and Rafah are currently missing from the API payload
 * but are defined below to support future inclusion.
 */
export const GOVERNORATE_ID_MAP = {
  northGaza: [1, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  gazaCity: [], // Placeholder for when Gaza City is added to the API
  middleArea: [2, 15, 16, 17, 18, 19],
  khanYunis: [3, 20, 21, 22, 23], // Includes South Gaza (3) and Khan Younis city (20) with its areas
  rafah: [], // Placeholder for when Rafah is added to the API
} as const;

export type GovernorateKey = keyof typeof GOVERNORATE_ID_MAP;

/**
 * Given a locationId (which could be an area, city, or the governorate itself),
 * this function returns the canonical key for the parent Governorate.
 * 
 * You can pass this key to your translation function, e.g., t(getGovernorateKeyByLocationId(hub.locationId))
 * 
 * @param locationId The numeric ID representing a specific location
 * @returns The key representing the parent governorate, or 'fallback' if not found
 */
export function getGovernorateKeyByLocationId(locationId: number | null | undefined): string {
  if (!locationId) return "gazaCity"; // Fallback when there is no location

  if ((GOVERNORATE_ID_MAP.northGaza as readonly number[]).includes(locationId)) {
    return "northGaza";
  }
  
  if ((GOVERNORATE_ID_MAP.middleArea as readonly number[]).includes(locationId)) {
    return "middleArea"; 
  }
  
  if ((GOVERNORATE_ID_MAP.khanYunis as readonly number[]).includes(locationId)) {
    return "khanYunis";
  }
  
  if ((GOVERNORATE_ID_MAP.gazaCity as readonly number[]).includes(locationId)) {
    return "gazaCity";
  }
  
  if ((GOVERNORATE_ID_MAP.rafah as readonly number[]).includes(locationId)) {
    return "rafah";
  }

  // Default fallback if a new ID appears from the API that isn't mapped
  return "gazaCity"; // Defaulting to Gaza City as a generic fallback identifier
}
