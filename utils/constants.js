/**
 * Constants Utility
 *
 * This module contains all constant values used throughout the Landowebtool extension.
 * Centralizing constants makes it easier to maintain and update the extension.
 */
import { EXTENSION_NAME } from '../types/index.js';
/**
 * API Configuration
 */
export const API = {
    /**
     * Serper API base URLs
     */
    BASE_URLS: {
        SEARCH: 'https://google.serper.dev/search',
        SCRAPE: 'https://scrape.serper.dev',
    },
    /**
     * API request headers
     */
    HEADERS: {
        'Content-Type': 'application/json',
        'X-API-KEY': '', // Set at runtime
    },
    /**
     * API timeout in milliseconds
     */
    DEFAULT_TIMEOUT: 30000, // 30 seconds
    /**
     * Maximum retry attempts for API requests
     */
    MAX_RETRIES: 3,
    /**
     * Initial retry delay in milliseconds (exponential backoff)
     */
    INITIAL_RETRY_DELAY: 1000, // 1 second
    /**
     * Retry backoff multiplier
     */
    RETRY_BACKOFF_MULTIPLIER: 2,
};
/**
 * Tool Configuration
 */
export const TOOLS = {
    /**
     * Web search tool configuration
     */
    SEARCH: {
        NAME: 'search',
        DISPLAY_NAME: 'Web Search',
        DESCRIPTION: 'Search the web for information using Serper API. Use this tool when you need to find current information, facts, or data from the internet.',
        MAX_RESULTS: 10,
        DEFAULT_NUM_RESULTS: 5,
        TIMEOUT: 30000, // 30 seconds
    },
    /**
     * Web scraping tool configuration
     */
    SCRAPE: {
        NAME: 'scrape',
        DISPLAY_NAME: 'Web Scraping',
        DESCRIPTION: 'Extract content from a web page using Serper API. Use this tool when you need to read the full content of a specific URL.',
        TIMEOUT: 60000, // 60 seconds
        MAX_CONTENT_LENGTH: 100000, // 100KB limit for scraped content
    },
};
/**
 * Settings Configuration
 */
export const SETTINGS = {
    /**
     * Default settings values
     */
    DEFAULTS: {
        SERPER_API_KEY: '',
        ENABLED: false,
        MAX_RESULTS: 5,
        TIMEOUT: 30, // seconds
    },
    /**
     * Valid ranges for numeric settings
     */
    RANGES: {
        MAX_RESULTS: {
            MIN: 1,
            MAX: 20,
            DEFAULT: 5,
        },
        TIMEOUT: {
            MIN: 5, // seconds
            MAX: 120, // seconds
            DEFAULT: 30,
        },
    },
    /**
     * Settings storage key in extension_settings
     */
    STORAGE_KEY: 'landowebtool',
};
/**
 * UI Configuration
 */
export const UI = {
    /**
     * Settings popup configuration
     */
    POPUP: {
        WIDTH: '600px',
        TITLE: `${EXTENSION_NAME} Settings`,
    },
    /**
     * Button identifiers
     */
    BUTTONS: {
        SETTINGS: 'landowebtool_settings',
        TEST_API_KEY: 'landowebtool_test_api_key',
        SAVE: 'landowebtool_save',
        RESET: 'landowebtool_reset',
    },
    /**
     * Input field identifiers
     */
    INPUTS: {
        API_KEY: 'landowebtool_api_key',
        ENABLED: 'landowebtool_enabled',
        MAX_RESULTS: 'landowebtool_max_results',
        TIMEOUT: 'landowebtool_timeout',
        API_KEY_STATUS: 'landowebtool_api_key_status',
    },
    /**
     * Status messages
     */
    STATUS: {
        EMPTY: 'Please enter an API key',
        TESTING: 'Click Test to validate',
        VALID: 'API Key Valid ✓',
        INVALID: 'Invalid API Key',
    },
    /**
     * Toast notification messages
     */
    MESSAGES: {
        API_KEY_INVALID: 'Please enter a valid API key',
        API_KEY_VALID: 'API key is valid',
        API_KEY_INVALID_MESSAGE: 'Invalid API key',
        SETTINGS_SAVED: 'Settings saved successfully',
        SETTINGS_RESET: 'Settings reset to defaults',
        TEST_FAILED: 'Test failed',
    },
};
/**
 * Error Messages
 */
export const ERRORS = {
    /**
     * API-related errors
     */
    API: {
        NO_API_KEY: 'No API key provided',
        INVALID_API_KEY: 'Invalid API key',
        API_KEY_MISSING: 'API key is missing',
        REQUEST_FAILED: 'API request failed',
        TIMEOUT: 'Request timeout',
        RATE_LIMIT: 'Rate limit exceeded',
        SERVER_ERROR: 'Server error',
        NETWORK_ERROR: 'Network error',
    },
    /**
     * Validation errors
     */
    VALIDATION: {
        INVALID_URL: 'Invalid URL format',
        INVALID_QUERY: 'Invalid query format',
        EMPTY_QUERY: 'Query cannot be empty',
        URL_REQUIRED: 'URL is required',
    },
    /**
     * Tool execution errors
     */
    TOOL: {
        NOT_REGISTERED: 'Tool is not registered',
        EXECUTION_FAILED: 'Tool execution failed',
        NO_RESULTS: 'No results found',
        SCRAPE_FAILED: 'Failed to scrape web page',
    },
    /**
     * Settings errors
     */
    SETTINGS: {
        SAVE_FAILED: 'Failed to save settings',
        LOAD_FAILED: 'Failed to load settings',
        INVALID_VALUE: 'Invalid setting value',
    },
};
/**
 * Regular Expressions
 */
export const REGEX = {
    /**
     * URL validation regex
     * Matches HTTP/HTTPS URLs with optional path, query, and fragment
     */
    URL: /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)$/,
    /**
     * API key format validation (basic check)
     * Adjust based on Serper's actual API key format
     */
    API_KEY: /^[a-zA-Z0-9\-_]{20,}$/,
    /**
     * HTML tag removal regex (for text extraction)
     */
    HTML_TAGS: /<[^>]*>/g,
    /**
     * Whitespace normalization regex
     */
    WHITESPACE: /\s+/g,
};
/**
 * Tool Call Configuration
 */
export const TOOL_CALL = {
    /**
     * Maximum number of concurrent tool calls
     */
    MAX_CONCURRENT_CALLS: 3,
    /**
     * Tool call timeout in milliseconds
     */
    TIMEOUT: 60000, // 60 seconds
    /**
     * Maximum number of tool calls per message
     */
    MAX_CALLS_PER_MESSAGE: 10,
    /**
     * Tool result message format
     */
    RESULT_FORMAT: {
        ROLE: 'tool',
        CONTENT_TYPE: 'text',
    },
};
/**
 * Logging Configuration
 */
export const LOGGING = {
    /**
     * Default log level
     */
    DEFAULT_LEVEL: 'INFO',
    /**
     * Log prefixes
     */
    PREFIXES: {
        EXTENSION: `[${EXTENSION_NAME}]`,
        API: `${EXTENSION_NAME}:API`,
        TOOL: `${EXTENSION_NAME}:TOOL`,
        SETTINGS: `${EXTENSION_NAME}:SETTINGS`,
    },
    /**
     * Log levels
     */
    LEVELS: ['DEBUG', 'INFO', 'WARN', 'ERROR'],
};
/**
 * Feature Flags
 */
export const FEATURES = {
    /**
     * Enable debug mode (additional logging)
     */
    DEBUG_MODE: false,
    /**
     * Enable retry logic for API requests
     */
    ENABLE_RETRY: true,
    /**
     * Enable caching of API responses
     */
    ENABLE_CACHE: false,
    /**
     * Cache duration in milliseconds (if caching is enabled)
     */
    CACHE_DURATION: 300000, // 5 minutes
};
/**
 * Constants for export
 */
export const CONSTANTS = {
    API,
    TOOLS,
    SETTINGS,
    UI,
    ERRORS,
    REGEX,
    TOOL_CALL,
    LOGGING,
    FEATURES,
};
