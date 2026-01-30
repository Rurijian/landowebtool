/**
 * Serper API Client
 *
 * This module provides a client for interacting with Serper API
 * to perform web searches and web scraping operations.
 * @see https://serper.dev/
 */
import { DEFAULT_SERPER_CONFIG, isValidUrl, isValidQuery, } from './types.js';
import { logApiRequest, logApiResponse } from '../utils/logger.js';
import { API, ERRORS } from '../utils/constants.js';
/**
 * Serper API Client class
 * Handles authentication, requests, retries, and error handling
 */
export class SerperClient {
    /**
     * Creates a new Serper API client instance
     * @param apiKey - Serper API key for authentication
     * @param config - Optional configuration overrides
     */
    constructor(apiKey, config = {}) {
        if (!apiKey || apiKey.trim().length === 0) {
            throw new Error(ERRORS.API.API_KEY_MISSING);
        }
        this.apiKey = apiKey;
        // Merge default config with user config, ensuring apiKey is set
        this.config = {
            ...DEFAULT_SERPER_CONFIG,
            ...config,
            apiKey,
        };
    }
    /**
     * Performs web search using Serper API
     * @param query - Search query string
     * @param options - Optional search options
     * @returns Promise resolving to search results
     * @throws Error if request fails after all retries
     */
    async search(query, options = {}) {
        // Validate input
        if (!isValidQuery(query)) {
            throw new Error(ERRORS.VALIDATION.INVALID_QUERY);
        }
        const url = new URL(`${this.config.searchBaseUrl}/search`);
        const requestBody = {
            q: query.trim(),
            num: options.num || 10,
            page: options.page || 1,
            type: options.type,
        };
        return this.makeRequest(url, requestBody);
    }
    /**
     * Scrapes a web page using Serper API
     * @param url - URL to scrape
     * @returns Promise resolving to scraped page content
     * @throws Error if request fails after all retries
     */
    async scrape(url) {
        // Validate input
        if (!isValidUrl(url)) {
            throw new Error(ERRORS.VALIDATION.INVALID_URL);
        }
        const scrapeUrl = new URL(this.config.scrapeBaseUrl);
        const requestBody = { url };
        return this.makeRequest(scrapeUrl, requestBody);
    }
    /**
     * Makes an HTTP request to Serper API with retry logic
     * @param url - Full URL for the API endpoint
     * @param body - Request body to send
     * @returns Promise resolving to parsed JSON response
     * @private
     */
    async makeRequest(url, body) {
        const headers = new Headers();
        headers.append('X-API-KEY', this.apiKey);
        headers.append('Content-Type', 'application/json');
        let lastError = null;
        const startTime = Date.now();
        logApiRequest(url.toString(), 'POST');
        // Retry logic with exponential backoff
        for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);
                const response = await fetch(url.toString(), {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(body),
                    signal: controller.signal,
                });
                clearTimeout(timeoutId);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({
                        message: response.statusText,
                        status: response.status,
                    }));
                    // Don't retry on client errors (4xx)
                    if (response.status >= 400 && response.status < 500) {
                        const duration = Date.now() - startTime;
                        logApiResponse(url.toString(), response.status, duration);
                        throw new Error(`${ERRORS.API.REQUEST_FAILED}: ${errorData.message || response.statusText}`);
                    }
                    // Server errors (5xx) can be retried
                    lastError = new Error(`${ERRORS.API.REQUEST_FAILED}: ${errorData.message || response.statusText}`);
                    if (attempt < this.config.maxRetries) {
                        await this.delay(this.config.retryDelay * attempt);
                    }
                    continue;
                }
                const data = await response.json();
                const duration = Date.now() - startTime;
                logApiResponse(url.toString(), response.status, duration);
                return data;
            }
            catch (error) {
                lastError = error instanceof Error ? error : new Error(String(error));
                // Don't retry on abort errors (user cancelled)
                if (lastError.name === 'AbortError') {
                    throw lastError;
                }
                // Retry on network errors
                if (attempt < this.config.maxRetries) {
                    await this.delay(this.config.retryDelay * attempt);
                }
            }
        }
        const duration = Date.now() - startTime;
        logApiResponse(url.toString(), 0, duration);
        throw lastError || new Error(ERRORS.API.REQUEST_FAILED);
    }
    /**
     * Delays execution for a specified number of milliseconds
     * @param ms - Milliseconds to delay
     * @returns Promise that resolves after the delay
     * @private
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Validates the API key by making a simple search request
     * @returns Promise resolving to true if key is valid
     */
    async validateApiKey() {
        try {
            // Make a minimal search request to validate the key
            await this.search('test query', { num: 1 });
            return true;
        }
        catch (error) {
            // Check if error is due to invalid API key
            const errorMsg = error instanceof Error ? error.message : String(error);
            if (errorMsg.includes('401') || errorMsg.includes('Unauthorized') || errorMsg.includes('API key')) {
                return false;
            }
            // Other errors might be temporary, so consider key potentially valid
            return true;
        }
    }
}
/**
 * Factory function to create a Serper client with settings
 * @param apiKey - Serper API key
 * @param config - Optional configuration
 * @returns Configured SerperClient instance
 */
export function createSerperClient(apiKey, config) {
    return new SerperClient(apiKey, config);
}
// No additional export needed - SerperClient class is already exported
