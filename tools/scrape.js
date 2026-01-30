/**
 * Web Scraping Tool
 *
 * This module implements the scrape tool for Kimi tool calling.
 * Uses Serper API to scrape web page content.
 */
import { ToolManager } from '../../../tool-calling.js';
import { extension_settings } from '../../../extensions.js';
import { createSerperClient } from '../api/serper.js';
import { error, debug, logToolInvocation, logToolResult } from '../utils/logger.js';
import { TOOLS, SETTINGS, ERRORS } from '../utils/constants.js';
/**
 * Formats scrape results for return to the model
 * @param response - Serper API response
 * @param url - The URL that was scraped (from request parameters)
 * @returns Formatted result object
 */
function formatScrapeResults(response, url) {
    // Handle potential nested response structures
    // Some APIs return data nested under 'data' or 'result' properties
    let data = response;
    
    // Check if response has a 'data' property (common in API wrappers)
    if (response && typeof response === 'object' && response.data !== undefined) {
        data = response.data;
    }
    // Check if response has a 'result' property
    else if (response && typeof response === 'object' && response.result !== undefined) {
        data = response.result;
    }
    
    // Extract fields from Serper API response structure
    // Actual Serper API returns: {text, metadata: {title}, credits}
    // We need to map these to the expected fields
    const title = (data.metadata && data.metadata.title) || '';
    const content = data.text || '';
    const credits = data.credits || 0;
    
    // Note: Serper API doesn't return url, markdown, or statusCode in the response
    // We'll provide the URL from the request parameters
    const scrapedUrl = url || '';
    const markdown = data.markdown || ''; // Not provided by Serper
    const statusCode = data.statusCode || 200; // Assume success if we got a response
    
    // Calculate word count from content
    const wordCount = content ? content.split(/\s+/).length : 0;
    
    return {
        title,
        url: scrapedUrl,
        content,
        markdown,
        statusCode,
        wordCount,
        credits, // Include credits for information
    };
}
/**
 * Scrape tool implementation
 * Registers with ToolManager to provide web scraping capability
 */
export function registerScrapeTool() {
    ToolManager.registerFunctionTool({
        name: TOOLS.SCRAPE.NAME,
        displayName: TOOLS.SCRAPE.DISPLAY_NAME,
        description: TOOLS.SCRAPE.DESCRIPTION,
        parameters: {
            type: 'object',
            required: ['url'],
            properties: {
                url: {
                    type: 'string',
                    description: 'The website address (URL) of the content to be obtained, which can usually be obtained from the search results.',
                },
            },
        },
        /**
         * Executes the scrape tool
         * @param params - Tool parameters containing the URL to scrape
         * @returns Promise resolving to formatted scrape results
         */
        action: async (params) => {
            const startTime = Date.now();
            logToolInvocation(TOOLS.SCRAPE.NAME, params);
            try {
                // Get extension settings from SillyTavern
                const settings = extension_settings?.[SETTINGS.STORAGE_KEY];
                if (!settings?.serperApiKey) {
                    throw new Error(ERRORS.API.NO_API_KEY);
                }
                // Create Serper client
                const client = createSerperClient(settings.serperApiKey, {
                    timeout: (settings.timeout || SETTINGS.DEFAULTS.TIMEOUT) * 1000, // Convert to milliseconds
                });
                // Perform scrape
                const response = await client.scrape(params.url);
                // Log raw response for debugging
                debug('Raw scrape response:', response);
                // Format results for the model
                const formattedResults = formatScrapeResults(response, params.url);
                const duration = Date.now() - startTime;
                logToolResult(TOOLS.SCRAPE.NAME, true, duration);
                return JSON.stringify(formattedResults);
            }
            catch (err) {
                const duration = Date.now() - startTime;
                logToolResult(TOOLS.SCRAPE.NAME, false, duration);
                error('Scrape error:', err);
                const errorMsg = err instanceof Error ? err.message : String(err);
                return JSON.stringify({
                    error: errorMsg,
                    success: false,
                    url: params.url,
                });
            }
        },
        /**
         * Formats the tool call message for display
         * @param params - Tool parameters
         * @returns Formatted message string
         */
        formatMessage: async (params) => {
            // Truncate URL for display
            const displayUrl = params.url.length > 50
                ? params.url.substring(0, 47) + '...'
                : params.url;
            return `Scraping: ${displayUrl}`;
        },
        /**
         * Determines if the tool should be registered
         * Tool is only registered if API key is configured
         * @returns Promise resolving to true if tool should be registered
         */
        shouldRegister: async () => {
            const settings = extension_settings?.[SETTINGS.STORAGE_KEY];
            return !!(settings?.serperApiKey && settings?.enabled !== false);
        },
    });
}
/**
 * Unregisters the scrape tool
 */
export function unregisterScrapeTool() {
    ToolManager.unregisterFunctionTool(TOOLS.SCRAPE.NAME);
}
