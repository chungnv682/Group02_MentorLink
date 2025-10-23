/**
 * Utility functions for mentor-related operations
 */

/**
 * Get country name from country object or string
 * @param {Object|string} country - Country object with name property or string
 * @returns {string} Country name
 */
export const getCountryName = (country) => {
    if (typeof country === 'string') {
        return country;
    }
    return country?.name || country?.code || 'Unknown';
};

/**
 * Get country flag URL from country object
 * @param {Object|string} country - Country object with flagUrl property or string
 * @returns {string|null} Flag URL or null
 */
export const getCountryFlagUrl = (country) => {
    if (typeof country === 'string') {
        return null; // No flag URL for string countries
    }
    return country?.flagUrl || null;
};

/**
 * Get country code from country object or string
 * @param {Object|string} country - Country object with code property or string
 * @returns {string} Country code
 */
export const getCountryCode = (country) => {
    if (typeof country === 'string') {
        return country.toLowerCase().replace(/\s+/g, '');
    }
    return country?.code || country?.name?.toLowerCase().replace(/\s+/g, '') || 'unknown';
};

/**
 * Format approved countries for display
 * @param {Array} approvedCountries - Array of country objects or strings
 * @returns {Array} Formatted countries array
 */
export const formatApprovedCountries = (approvedCountries) => {
    if (!Array.isArray(approvedCountries)) {
        return [];
    }

    return approvedCountries.map(country => ({
        name: getCountryName(country),
        flagUrl: getCountryFlagUrl(country),
        code: getCountryCode(country),
        original: country
    }));
};

/**
 * Get unique country names for filtering
 * @param {Array} mentors - Array of mentor objects
 * @returns {Array} Unique country names
 */
export const getUniqueCountries = (mentors) => {
    const countrySet = new Set();

    mentors.forEach(mentor => {
        if (mentor.approvedCountries && Array.isArray(mentor.approvedCountries)) {
            mentor.approvedCountries.forEach(country => {
                const countryName = getCountryName(country);
                if (countryName && countryName !== 'Unknown') {
                    countrySet.add(countryName);
                }
            });
        }
    });

    return Array.from(countrySet).sort();
};