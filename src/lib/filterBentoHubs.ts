import { UserLocationContext, LocationEntry } from "@/src/actions/hubs";
import { buildLocationIdSet } from "@/src/lib/getUserLocationContext";

/**
 * Applies a smart location-based filter to an array of raw API hubs and
 * returns up to 6 hubs for the home page bento grid.
 *
 * Priority order (only for logged-in users with a known location):
 *   1. Hubs in the user's area
 *   2. Hubs in the user's city   (fallback if area yields nothing)
 *   3. Hubs in the user's governorate (fallback if city yields nothing)
 *   4. If fewer than 6 local results, fills up with the most-recently-added
 *      approved hubs regardless of location.
 *
 * For unauthenticated users (userLocationContext === null), returns the first
 * 6 approved hubs unchanged.
 *
 * @param allHubs            Raw hub objects from the API
 * @param userLocationContext Resolved area/city/gov IDs + full location list,
 *                            or null when the user is not logged in / has no
 *                            stored location.
 * @returns An array of ≤6 raw hub objects ready for HubsBentoGrid
 */
export function filterBentoHubs(
  allHubs: any[],
  userLocationContext: UserLocationContext | null
): any[] {
  // Only approved hubs are shown on the public grid
  const approvedHubs = allHubs.filter((h) => h.status === "approved");

  // Filters approved hubs whose raw location ID is in the given set
  const filterByIds = (ids: Set<number>) =>
    approvedHubs.filter((h) => {
      const id = h.location?.id ?? h.location_id;
      return id != null && ids.has(Number(id));
    });

  // Pads `local` up to 6 with most-recently-added approved hubs not already included
  const fillToSix = (local: any[]): any[] => {
    if (local.length >= 6) return local.slice(0, 6);
    const localIds = new Set(local.map((h) => h.id));
    const rest = approvedHubs
      .filter((h) => !localIds.has(h.id))
      .slice(0, 6 - local.length);
    return [...local, ...rest];
  };

  if (!userLocationContext) {
    return approvedHubs.slice(0, 6);
  }

  const { userAreaId, userCityId, userGovernorateId, allLocations } =
    userLocationContext;

  let localHubs: any[] = [];

  // Priority 1 — user's area
  if (userAreaId) {
    localHubs = filterByIds(
      buildLocationIdSet(allLocations, userAreaId, null, null)
    );
  }

  // Priority 2 — user's city
  if (localHubs.length === 0 && userCityId) {
    localHubs = filterByIds(
      buildLocationIdSet(allLocations, null, userCityId, null)
    );
  }

  // Priority 3 — user's governorate
  if (localHubs.length === 0 && userGovernorateId) {
    localHubs = filterByIds(
      buildLocationIdSet(allLocations, null, null, userGovernorateId)
    );
  }

  return fillToSix(localHubs);
}
