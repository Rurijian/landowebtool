/**
 * Tools Registry
 *
 * This module manages registration and unregistration of all tools
 * provided by the Landowebtool extension.
 */
import { registerSearchTool, unregisterSearchTool } from './search.js';
import { registerScrapeTool, unregisterScrapeTool } from './scrape.js';
import { info } from '../utils/logger.js';
/**
 * Registers all tools with SillyTavern's ToolManager
 * This function is called during extension initialization
 */
export function registerAllTools() {
    info('Registering tools...');
    registerSearchTool();
    registerScrapeTool();
    info('Tools registered successfully');
}
/**
 * Unregisters all tools from SillyTavern's ToolManager
 * This function is called during extension cleanup
 */
export function unregisterAllTools() {
    info('Unregistering tools...');
    unregisterSearchTool();
    unregisterScrapeTool();
    info('Tools unregistered successfully');
}
/**
 * Re-registers all tools
 * Useful when settings change and tools need to be re-registered
 */
export function reregisterTools() {
    unregisterAllTools();
    registerAllTools();
}
