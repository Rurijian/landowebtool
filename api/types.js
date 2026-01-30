/**
 * Serper API Type Definitions
 *
 * This file contains TypeScript types for Serper API requests and responses.
 * Serper provides web search and web scraping capabilities.
 * @see https://serper.dev/
 */
import { API } from '../utils/constants.js';
/**
 * Default Serper API configuration
 */
export const DEFAULT_SERPER_CONFIG = {
    searchBaseUrl: API.BASE_URLS.SEARCH,
    scrapeBaseUrl: API.BASE_URLS.SCRAPE,
    timeout: API.DEFAULT_TIMEOUT,
    maxRetries: API.MAX_RETRIES,
    retryDelay: API.INITIAL_RETRY_DELAY,
};
/**
 * Validates if a string is a valid URL
 * @param url - URL string to validate
 * @returns true if valid URL, false otherwise
 */
export function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    }
    catch {
        return false;
    }
}
/**
 * Validates if a string is a valid search query
 * @param query - Query string to validate
 * @returns true if valid, false otherwise
 */
export function isValidQuery(query) {
    return typeof query === 'string' && query.trim().length > 0 && query.trim().length <= 1000;
}
