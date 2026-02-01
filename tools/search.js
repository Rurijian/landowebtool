/**
 * Web Search Tool
 *
 * This module implements the search tool for Kimi tool calling.
 * Uses Serper API to perform web searches.
 */
import { ToolManager } from '../../../../tool-calling.js';
import { extension_settings } from '../../../../extensions.js';
import { createSerperClient } from '../api/serper.js';
import { error, debug, logToolInvocation, logToolResult } from '../utils/logger.js';
import { TOOLS, SETTINGS, ERRORS } from '../utils/constants.js';
/**
 * Formats search results for return to the model
 * @param response - Serper API response
 * @returns Formatted result object
 */
function formatSearchResults(response) {
    // Handle potential nested response structures
    let data = response;
    
    // Check if response has a 'data' property (common in API wrappers)
    if (response && typeof response === 'object' && response.data !== undefined) {
        data = response.data;
    }
    // Check if response has a 'result' property
    else if (response && typeof response === 'object' && response.result !== undefined) {
        data = response.result;
    }
    
    const results = [];
    // Add organic results
    if (Array.isArray(data.organic)) {
        for (const result of data.organic) {
            results.push({
                title: result.title || '',
                link: result.link || '',
                snippet: result.snippet || '',
                position: result.position || 0,
            });
        }
    }
    // Add answer box if available
    if (data.answerBox) {
        results.unshift({
            title: data.answerBox.title || '',
            link: data.answerBox.link || '',
            snippet: data.answerBox.answer || data.answerBox.snippet || '',
            isAnswerBox: true,
        });
    }
    return {
        results,
        count: results.length,
        answerBox: data.answerBox || null,
        knowledgeGraph: data.knowledgeGraph || null,
        relatedQuestions: data.peopleAlsoAsk || null,
        relatedSearches: data.relatedSearches || null,
        credits: data.credits || 0,
        searchParameters: data.searchParameters || null,
    };
}
/**
 * Search tool implementation
 * Registers with ToolManager to provide web search capability
 */
export function registerSearchTool() {
    ToolManager.registerFunctionTool({
        name: TOOLS.SEARCH.NAME,
        displayName: TOOLS.SEARCH.DISPLAY_NAME,
        description: TOOLS.SEARCH.DESCRIPTION,
        parameters: {
            type: 'object',
            required: ['query'],
            properties: {
                query: {
                    type: 'string',
                    description: 'The content the user wants to search for, extracted from the user question or chat context.',
                },
            },
        },
        /**
         * Executes the search tool
         * @param params - Tool parameters containing the search query
         * @returns Promise resolving to formatted search results
         */
        action: async (params) => {
            const startTime = Date.now();
            logToolInvocation(TOOLS.SEARCH.NAME, params);
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
                // Perform search
                const response = await client.search(params.query, {
                    num: settings.maxResults || TOOLS.SEARCH.DEFAULT_NUM_RESULTS,
                });
                // Log raw response for debugging
                debug('Raw search response:', response);
                // Format results for the model
                const formattedResults = formatSearchResults(response);
                const duration = Date.now() - startTime;
                logToolResult(TOOLS.SEARCH.NAME, true, duration);
                return JSON.stringify(formattedResults);
            }
            catch (err) {
                const duration = Date.now() - startTime;
                logToolResult(TOOLS.SEARCH.NAME, false, duration);
                error('Search error:', err);
                const errorMsg = err instanceof Error ? err.message : String(err);
                return JSON.stringify({
                    error: errorMsg,
                    success: false,
                });
            }
        },
        /**
         * Formats the tool call message for display
         * @param params - Tool parameters
         * @returns Formatted message string
         */
        formatMessage: async (params) => {
            return `Searching for: "${params.query}"`;
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
 * Unregisters the search tool
 */
export function unregisterSearchTool() {
    ToolManager.unregisterFunctionTool(TOOLS.SEARCH.NAME);
}
