import { cookies } from "next/headers";
import { getPublicLocations, UserLocationContext, LocationEntry } from "@/src/actions/hubs";

/**
 * Builds the full set of location IDs that encompass a given selection level.
 * - area selected  → {area}
 * - city selected  → {city, ...its areas}
 * - gov selected   → {gov, ...cities, ...areas}
 */
export function buildLocationIdSet(
  allLocations: LocationEntry[],
  areaId: number | null,
  cityId: number | null,
  governorateId: number | null
): Set<number> {
  const ids = new Set<number>();

  if (areaId) {
    ids.add(areaId);
    return ids;
  }

  if (cityId) {
    ids.add(cityId);
    allLocations
      .filter((l) => l.parent_id === cityId && l.type === "area")
      .forEach((a) => ids.add(a.id));
    return ids;
  }

  if (governorateId) {
    ids.add(governorateId);
    const childCities = allLocations.filter(
      (l) => l.parent_id === governorateId && l.type === "city"
    );
    childCities.forEach((c) => {
      ids.add(c.id);
      allLocations
        .filter((l) => l.parent_id === c.id && l.type === "area")
        .forEach((a) => ids.add(a.id));
    });
  }

  return ids;
}

/**
 * Reads the user's token and location_id from cookies, then resolves the full
 * area → city → governorate hierarchy using the public locations API.
 *
 * Returns `null` if the user is not logged in or has no stored location_id.
 */
export async function getUserLocationContext(
  locale: string = "ar"
): Promise<UserLocationContext | null> {
  const cookieStore = await cookies();

  const token = cookieStore.get("token")?.value;
  const userLocationIdRaw = cookieStore.get("user_location_id")?.value;
  const userLocationId = userLocationIdRaw ? Number(userLocationIdRaw) : null;

  // Only proceed if the user is logged in and has a stored location
  if (!token || !userLocationId) return null;

  const locRes = await getPublicLocations(locale);
  const allLocations = locRes.data || [];

  if (allLocations.length === 0) return null;

  const startLoc = allLocations.find((l) => l.id === userLocationId);
  if (!startLoc) return null;

  let userAreaId: number | null = null;
  let userCityId: number | null = null;
  let userGovernorateId: number | null = null;

  if (startLoc.type === "area") {
    userAreaId = startLoc.id;
    const city = allLocations.find(
      (l) => l.id === startLoc.parent_id && l.type === "city"
    );
    if (city) {
      userCityId = city.id;
      const gov = allLocations.find(
        (l) => l.id === city.parent_id && l.type === "governorate"
      );
      if (gov) userGovernorateId = gov.id;
    }
  } else if (startLoc.type === "city") {
    userCityId = startLoc.id;
    const gov = allLocations.find(
      (l) => l.id === startLoc.parent_id && l.type === "governorate"
    );
    if (gov) userGovernorateId = gov.id;
  } else if (startLoc.type === "governorate") {
    userGovernorateId = startLoc.id;
  }

  return { userAreaId, userCityId, userGovernorateId, allLocations };
}
