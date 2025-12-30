/**
 * IP and location utilities for tracking shortened URLs
 */


/**
 * Get the user's current IP address
 */
export async function getIpAddress(){
    try {
        const response = await fetch("https://api.ipify.org?format=json");
        const data = await response.json();
        return data.ip;
    } catch (error) {
        console.error("Error fetching IP address:", error);
        return "";
    }
}

/**
 * Get location information from an IP address
 * @param ip Optional IP address (if not provided, uses current user's IP)
 */
export async function getLocationByIp(ip){
    try {
        // If no IP is provided, get the current user's IP
        const targetIp = ip || (await getIpAddress());

        if (!targetIp) {
            console.warn("No IP address available for location lookup");
            return null;
        }

        const response = await fetch(`https://ipapi.co/${targetIp}/json/`);
        if (!response.ok) {
            throw new Error(`Failed to fetch location data: ${response.statusText}`);
        }

        const data = await response.json();

        // Check if the API returned an error
        if (data.error) {
            console.warn("IP API returned an error:", data.error);
            return null;
        }

        return data;
    } catch (error) {
        console.error("Error getting location data:", error);
        return null;
    }
}