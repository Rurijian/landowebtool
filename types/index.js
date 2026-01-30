/**
 * Landowebtool Extension - Type Definitions
 *
 * This file contains all TypeScript type definitions for the extension,
 * including tool definitions, API responses, and extension settings.
 */
/**
 * Default extension settings values
 */
export const DEFAULT_SETTINGS = {
    serperApiKey: '',
    enabled: true,
    maxResults: 10,
    timeout: 30,
};
/**
 * Tool names constants
 */
export const TOOL_NAMES = {
    SEARCH: 'search',
    SCRAPE: 'scrape',
};
/**
 * Extension name constant
 */
export const EXTENSION_NAME = 'Landowebtool';
/**
 * Extension display name
 */
export const EXTENSION_DISPLAY_NAME = 'Landowebtool';
