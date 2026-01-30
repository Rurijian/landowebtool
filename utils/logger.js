/**
 * Logger Utility
 *
 * This module provides logging functionality for the Landowebtool extension.
 * It provides consistent, prefixed logging for debugging and monitoring.
 */
import { EXTENSION_NAME } from '../types/index.js';
/**
 * Log levels for different types of messages
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARN"] = "WARN";
    LogLevel["ERROR"] = "ERROR";
})(LogLevel || (LogLevel = {}));
/**
 * Default logger configuration
 */
const DEFAULT_CONFIG = {
    enabled: true,
    level: LogLevel.INFO,
    prefix: `[${EXTENSION_NAME}]`,
};
/**
 * Current logger configuration
 */
let config = { ...DEFAULT_CONFIG };
/**
 * Check if a log level should be logged based on current configuration
 * @param level - The log level to check
 * @returns true if the level should be logged
 */
function shouldLog(level) {
    if (!config.enabled) {
        return false;
    }
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR];
    const currentIndex = levels.indexOf(config.level);
    const targetIndex = levels.indexOf(level);
    return targetIndex >= currentIndex;
}
/**
 * Format a log message with timestamp and level
 * @param level - The log level
 * @param message - The message to log
 * @returns Formatted log message
 */
function formatMessage(level, message) {
    const timestamp = new Date().toISOString();
    return `${config.prefix} [${level}] ${timestamp} - ${message}`;
}
/**
 * Log a debug message
 * @param message - The message to log
 * @param data - Optional data to include in the log
 */
export function debug(message, data) {
    if (shouldLog(LogLevel.DEBUG)) {
        const formatted = formatMessage(LogLevel.DEBUG, message);
        if (data !== undefined) {
            console.debug(formatted, data);
        }
        else {
            console.debug(formatted);
        }
    }
}
/**
 * Log an info message
 * @param message - The message to log
 * @param data - Optional data to include in the log
 */
export function info(message, data) {
    if (shouldLog(LogLevel.INFO)) {
        const formatted = formatMessage(LogLevel.INFO, message);
        if (data !== undefined) {
            console.log(formatted, data);
        }
        else {
            console.log(formatted);
        }
    }
}
/**
 * Log a warning message
 * @param message - The message to log
 * @param data - Optional data to include in the log
 */
export function warn(message, data) {
    if (shouldLog(LogLevel.WARN)) {
        const formatted = formatMessage(LogLevel.WARN, message);
        if (data !== undefined) {
            console.warn(formatted, data);
        }
        else {
            console.warn(formatted);
        }
    }
}
/**
 * Log an error message
 * @param message - The message to log
 * @param error - Optional error object to include in the log
 */
export function error(message, error) {
    if (shouldLog(LogLevel.ERROR)) {
        const formatted = formatMessage(LogLevel.ERROR, message);
        if (error instanceof Error) {
            console.error(formatted, error.message, error.stack);
        }
        else if (error !== undefined) {
            console.error(formatted, error);
        }
        else {
            console.error(formatted);
        }
    }
}
/**
 * Log a tool invocation
 * @param toolName - The name of the tool being invoked
 * @param params - The parameters passed to the tool
 */
export function logToolInvocation(toolName, params) {
    debug(`Tool invoked: ${toolName}`, params);
}
/**
 * Log a tool result
 * @param toolName - The name of the tool
 * @param success - Whether the tool execution was successful
 * @param duration - The duration of the tool execution in milliseconds
 */
export function logToolResult(toolName, success, duration) {
    const status = success ? 'succeeded' : 'failed';
    info(`Tool ${status}: ${toolName} (${duration}ms)`);
}
/**
 * Log an API request
 * @param endpoint - The API endpoint being called
 * @param method - The HTTP method
 */
export function logApiRequest(endpoint, method = 'GET') {
    debug(`API request: ${method} ${endpoint}`);
}
/**
 * Log an API response
 * @param endpoint - The API endpoint
 * @param status - The HTTP status code
 * @param duration - The duration of the request in milliseconds
 */
export function logApiResponse(endpoint, status, duration) {
    debug(`API response: ${endpoint} - ${status} (${duration}ms)`);
}
/**
 * Configure the logger
 * @param newConfig - New configuration options (partial)
 */
export function configureLogger(newConfig) {
    config = { ...config, ...newConfig };
}
/**
 * Get the current logger configuration
 * @returns Current logger configuration
 */
export function getLoggerConfig() {
    return { ...config };
}
/**
 * Enable or disable logging
 * @param enabled - Whether logging should be enabled
 */
export function setLoggingEnabled(enabled) {
    config.enabled = enabled;
}
/**
 * Set the minimum log level
 * @param level - The minimum log level to display
 */
export function setLogLevel(level) {
    config.level = level;
}
/**
 * Create a scoped logger with a custom prefix
 * @param scope - The scope name for the logger
 * @returns An object with scoped log functions
 */
export function createScopedLogger(scope) {
    const prefix = `${config.prefix}[${scope}]`;
    return {
        debug: (message, data) => {
            if (shouldLog(LogLevel.DEBUG)) {
                const formatted = `${prefix} [${LogLevel.DEBUG}] - ${message}`;
                if (data !== undefined) {
                    console.debug(formatted, data);
                }
                else {
                    console.debug(formatted);
                }
            }
        },
        info: (message, data) => {
            if (shouldLog(LogLevel.INFO)) {
                const formatted = `${prefix} [${LogLevel.INFO}] - ${message}`;
                if (data !== undefined) {
                    console.log(formatted, data);
                }
                else {
                    console.log(formatted);
                }
            }
        },
        warn: (message, data) => {
            if (shouldLog(LogLevel.WARN)) {
                const formatted = `${prefix} [${LogLevel.WARN}] - ${message}`;
                if (data !== undefined) {
                    console.warn(formatted, data);
                }
                else {
                    console.warn(formatted);
                }
            }
        },
        error: (message, error) => {
            if (shouldLog(LogLevel.ERROR)) {
                const formatted = `${prefix} [${LogLevel.ERROR}] - ${message}`;
                if (error instanceof Error) {
                    console.error(formatted, error.message, error.stack);
                }
                else if (error !== undefined) {
                    console.error(formatted, error);
                }
                else {
                    console.error(formatted);
                }
            }
        },
    };
}
// Export the logger as a default object for convenience
export const logger = {
    debug,
    info,
    warn,
    error,
    logToolInvocation,
    logToolResult,
    logApiRequest,
    logApiResponse,
    configure: configureLogger,
    getConfig: getLoggerConfig,
    setEnabled: setLoggingEnabled,
    setLevel: setLogLevel,
    createScoped: createScopedLogger,
};
