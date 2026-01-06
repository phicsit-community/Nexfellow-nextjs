// IP and location detection utility functions
import api from "../../lib/axios";

export async function getIpAddress() {
  try {
    // Using a CORS-friendly endpoint that doesn't require credentials
    const response = await fetch("https://api.ipify.org?format=json", {
      credentials: "omit", // Equivalent to withCredentials: false
    });
    const data = await response.json();
    return data.ip;
  } catch (error) {
    console.error("Failed to get IP address:", error);
    // Fallback to a server-side solution
    try {
      // Request IP from our own backend to avoid CORS
      const backendResponse = await fetch("/api/get-ip");
      const backendData = await backendResponse.json();
      return backendData.ip;
    } catch (fallbackError) {
      console.error("Fallback IP detection failed:", fallbackError);
      return null;
    }
  }
}

export async function getLocationByIp(ip) {
  try {
    // If no IP is provided, get the current user's IP
    const targetIp = ip || (await getIpAddress());
    if (!targetIp) return null;

    // Using our backend as a proxy to avoid CORS issues
    const response = await api.get(`/api/get-location?ip=${targetIp}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching location data:", error);
    return null;
  }
}

export function formatLocation(locationData) {
  if (!locationData) return "Unknown location";

  const { city, region, country_name } = locationData;
  let locationString = [];

  if (city) locationString.push(city);
  if (region) locationString.push(region);
  if (country_name) locationString.push(country_name);

  return locationString.length > 0
    ? locationString.join(", ")
    : "Unknown location";
}
