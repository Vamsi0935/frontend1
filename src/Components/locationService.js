export const fetchLocation = async (query) => {
    const apiKey = 'b04ad47d9086439a967d41bda202781d'; 
    const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        if (data.results.length > 0) {
            return {
                latitude: data.results[0].geometry.lat,
                longitude: data.results[0].geometry.lng,
            };
        }
    } catch (error) {
        console.error('Error fetching location:', error);
    }
    return null;
};
