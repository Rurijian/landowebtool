/**
 * Landowebtool Extension - Main Entry Point
 *
 * This file is the main entry point for the Landowebtool extension.
 * It initializes the extension, registers tools with SillyTavern's ToolManager,
 * and sets up the settings UI.
 *
 * Extension Overview:
 * - Provides web search and web scraping tools for Kimi 2.5 model
 * - Uses Serper API for search and scraping functionality
 * - Integrates with SillyTavern's tool calling system
 * - Settings UI for API key configuration
 */

// Import required SillyTavern modules
import { extension_settings, getContext, loadExtensionSettings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";
import { ToolManager } from "../../../tool-calling.js";

// Import extension modules
import { registerAllTools, unregisterAllTools, reregisterTools } from './tools/index.js';
import { EXTENSION_NAME, DEFAULT_SETTINGS } from './types/index.js';

// Keep track of where your extension is located, name should match repo name
const extensionName = "landowebtool";
const extensionFolderPath = `scripts/extensions/third-party/landowebtool`;

// Extension state
let isToolsRegistered = false;

/**
 * Loads the extension settings if they exist, otherwise initializes them to the defaults.
 */
async function loadSettings() {
    // Create the settings if they don't exist
    extension_settings[extensionName] = extension_settings[extensionName] || {};
    if (Object.keys(extension_settings[extensionName]).length === 0) {
        Object.assign(extension_settings[extensionName], DEFAULT_SETTINGS);
    }

    // Update settings in the UI
    $(`#${extensionName}_enabled`).prop("checked", extension_settings[extensionName].enabled).trigger("input");
    $(`#${extensionName}_api_key`).val(extension_settings[extensionName].serperApiKey).trigger("input");
    $(`#${extensionName}_max_results`).val(extension_settings[extensionName].maxResults).trigger("input");
    $(`#${extensionName}_timeout`).val(extension_settings[extensionName].timeout).trigger("input");
}

/**
 * Register or unregister tools based on current settings.
 */
async function updateToolRegistration() {
    const settings = extension_settings[extensionName] || DEFAULT_SETTINGS;
    
    // Check if tools should be registered
    const shouldRegister = settings.enabled && settings.serperApiKey && settings.serperApiKey.trim() !== '';
    
    if (shouldRegister && !isToolsRegistered) {
        try {
            await registerAllTools();
            isToolsRegistered = true;
            console.log(`[${EXTENSION_NAME}] Tools registered successfully`);
        } catch (error) {
            console.error(`[${EXTENSION_NAME}] Failed to register tools:`, error);
        }
    } else if (!shouldRegister && isToolsRegistered) {
        try {
            await unregisterAllTools();
            isToolsRegistered = false;
            console.log(`[${EXTENSION_NAME}] Tools unregistered`);
        } catch (error) {
            console.error(`[${EXTENSION_NAME}] Failed to unregister tools:`, error);
        }
    }
}

/**
 * Handle settings changes from the UI.
 */
function onEnabledChange(event) {
    const value = Boolean($(event.target).prop("checked"));
    extension_settings[extensionName].enabled = value;
    saveSettingsDebounced();
    updateToolRegistration();
}

function onApiKeyChange(event) {
    const value = String($(event.target).val());
    extension_settings[extensionName].serperApiKey = value;
    saveSettingsDebounced();
    updateToolRegistration();
}

function onMaxResultsChange(event) {
    const value = parseInt(String($(event.target).val()), 10);
    if (!isNaN(value)) {
        extension_settings[extensionName].maxResults = Math.max(1, Math.min(50, value));
        saveSettingsDebounced();
    }
}

function onTimeoutChange(event) {
    const value = parseInt(String($(event.target).val()), 10);
    if (!isNaN(value)) {
        extension_settings[extensionName].timeout = Math.max(5, Math.min(120, value));
        saveSettingsDebounced();
    }
}

/**
 * Test API key functionality.
 */
async function onTestApiKeyClick() {
    const button = $(`#${extensionName}_test_api_key`);
    const apiKey = String($(`#${extensionName}_api_key`).val());
    
    if (!apiKey || apiKey.trim() === '') {
        globalThis.toastr?.error?.('Please enter an API key first', 'Test Failed');
        return;
    }
    
    button.prop('disabled', true).text('Testing...');
    
    try {
        // Simple validation - could be enhanced with actual API test
        const isValid = apiKey.length > 10; // Basic validation
        
        if (isValid) {
            globalThis.toastr?.success?.('API key appears to be valid', 'Test Successful');
        } else {
            globalThis.toastr?.error?.('API key appears to be invalid', 'Test Failed');
        }
    } catch (error) {
        globalThis.toastr?.error?.(`Test failed: ${error.message}`, 'Test Failed');
    } finally {
        button.prop('disabled', false).text('Test');
    }
}

/**
 * Reset settings to defaults.
 */
function onResetClick() {
    if (confirm('Are you sure you want to reset all settings to defaults?')) {
        Object.assign(extension_settings[extensionName], DEFAULT_SETTINGS);
        saveSettingsDebounced();
        loadSettings();
        updateToolRegistration();
        globalThis.toastr?.info?.('Settings reset to defaults', 'Reset');
    }
}

/**
 * Save settings.
 */
function onSaveClick() {
    saveSettingsDebounced();
    globalThis.toastr?.success?.('Settings saved', 'Saved');
}

/**
 * Initialize the extension when loaded.
 */
jQuery(async () => {
    // Render settings HTML with current settings
    const settings = extension_settings[extensionName] || DEFAULT_SETTINGS;
    let settingsHtml = await $.get(`${extensionFolderPath}/settings.html`);
    
    // Replace template variables
    settingsHtml = settingsHtml.replace(/{{settings\.serperApiKey}}/g, settings.serperApiKey || '');
    settingsHtml = settingsHtml.replace(/{{settings\.enabled}}/g, settings.enabled ? 'checked' : '');
    settingsHtml = settingsHtml.replace(/{{settings\.maxResults}}/g, settings.maxResults || 5);
    settingsHtml = settingsHtml.replace(/{{settings\.timeout}}/g, settings.timeout || 30);
    
    // Append settingsHtml to extensions_settings
    $("#extensions_settings").append(settingsHtml);
    
    // Bind event handlers
    $(`#${extensionName}_enabled`).on("change", onEnabledChange);
    $(`#${extensionName}_api_key`).on("input", onApiKeyChange);
    $(`#${extensionName}_max_results`).on("input", onMaxResultsChange);
    $(`#${extensionName}_timeout`).on("input", onTimeoutChange);
    $(`#${extensionName}_test_api_key`).on("click", onTestApiKeyClick);
    $(`#${extensionName}_reset`).on("click", onResetClick);
    $(`#${extensionName}_save`).on("click", onSaveClick);
    
    // Load settings when starting things up
    await loadSettings();
    
    // Initialize tool registration
    await updateToolRegistration();
    
    console.log(`[${EXTENSION_NAME}] Extension initialized successfully`);
});
