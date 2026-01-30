# Landowebtool Extension

A SillyTavern extension that enables Kimi 2.5 tool calling functionality with web search and web scraping capabilities using the Serper API.

## Features

- **Web Search**: Search the web for information using Serper API
- **Web Scraping**: Extract content from web pages using Serper API
- **Seamless Integration**: Works with SillyTavern's ToolManager for tool calling
- **Settings UI**: Easy-to-use settings panel for API key configuration
- **Comprehensive Logging**: Built-in logger for debugging and monitoring

## Installation

1. Place the `landowebtool` folder in `public/scripts/extensions/`
2. Restart SillyTavern or reload the page
3. The extension will be automatically loaded

## Manual SillyTavern Patches

This extension requires manual patches to SillyTavern core files to enable proper tool calling with reasoning support.

### Patch 1: src/prompt-converters.js

At line 1359, add dummy reasoning content for assistant tool call messages:

```javascript
message.reasoning_content = 'The user request requires a tool call so I should perform one.';
```

### Patch 2: src/endpoints/backends/chat-completions.js

In the moonshot branch, starting at line 2261, add the following function call after the moonshot configuration block:

```javascript
} else if (request.body.chat_completion_source == CHAT_COMPLETION_SOURCES.MOONSHOT) {
    apiUrl = new URL(request.body.reverse_proxy || API_MOONSHOT).toString();
    apiKey = request.body.reverse_proxy ? request.body.proxy_password : readSecret(request.user.directories, SECRET_KEYS.MOONSHOT);
    headers = {};
    bodyParams = {
        thinking: {
            type: request.body.include_reasoning ? 'enabled' : 'disabled',
        },
    };
    request.body.json_schema
        ? setJsonObjectFormat(bodyParams, request.body.messages, request.body.json_schema)
        : addAssistantPrefix(request.body.messages, [], 'partial');
}
addReasoningContentToToolCalls(request.body.messages);
```

These patches enable the extension to properly handle tool calls with reasoning content for models that support it.

## Configuration

### Getting a Serper API Key

1. Visit [https://serper.dev](https://serper.dev)
2. Sign up for a free account
3. Get your API key from the dashboard

### Setting Up the Extension

1. Open SillyTavern
2. Click the Extensions menu (wand icon)
3. Find "Landowebtool" in the list
4. Click to open the settings
5. Enter your Serper API key
6. Click "Test" to verify the API key
7. Click "Save" to save your settings
8. Enable the "Enable Tools" toggle

## Usage

### With Kimi 2.5 Model

1. Select a Kimi 2.5 model in SillyTavern
2. Ensure tool calling is enabled for the model
3. Start a conversation
4. The model can now use the `search` and `scrape` tools

### Available Tools

#### `search` - Web Search

Search the web for information using Serper API. Returns organic search results, answer boxes, knowledge graphs, and related questions.

**Parameters:**
- `query` (string, required): The search query

**Note:** The number of results is controlled by the "Max Results" setting in the extension configuration (default: 5, range: 1-20).

**Example:**
```json
{
  "query": "latest news about AI"
}
```

**Response Format:**
The tool returns a JSON object containing:
- `results`: Array of search results with title, link, snippet, and position
- `answerBox`: Direct answer if available (e.g., featured snippet)
- `knowledgeGraph`: Knowledge graph information
- `relatedQuestions`: People also ask questions
- `relatedSearches`: Related search queries
- `credits`: Credits used for the request

#### `scrape` - Web Scraping

Extract content from a web page using Serper API. Returns the page title, content text, and metadata.

**Parameters:**
- `url` (string, required): The URL to scrape

**Example:**
```json
{
  "url": "https://example.com/article"
}
```

**Response Format:**
The tool returns a JSON object containing:
- `title`: Page title
- `url`: The scraped URL
- `content`: Main text content of the page
- `wordCount`: Approximate word count of the content
- `credits`: Credits used for the request

## File Structure

```
landowebtool/
├── README.md                 # This file
├── manifest.json             # Extension manifest
├── index.js                 # Main entry point
├── settings.html            # Settings HTML template
├── style.css                # Extension styles
├── types/
│   └── index.js            # Type definitions (JSDoc)
├── api/
│   ├── types.js            # API response types
│   └── serper.js          # Serper API client
├── tools/
│   ├── search.js           # Web search tool
│   ├── scrape.js           # Web scraping tool
│   └── index.js           # Tool registry
└── utils/
    ├── logger.js           # Logging utility
    └── constants.js       # Constants
```

## Development

### Adding New Tools

1. Create a new tool file in `tools/` (e.g., `tools/newtool.js`)
2. Implement the tool using the `ToolManager.registerFunctionTool()` API
3. Import and register the tool in `tools/index.js`

Example tool structure:

```javascript
import { ToolManager } from '../../../tool-calling.js';

export function registerNewTool() {
    ToolManager.registerFunctionTool({
        name: 'newtool',
        displayName: 'New Tool',
        description: 'Description of what the tool does',
        parameters: {
            type: 'object',
            properties: {
                param1: {
                    type: 'string',
                    description: 'Parameter description',
                },
            },
            required: ['param1'],
        },
        action: async (params) => {
            // Tool implementation
            return { result: 'Tool executed successfully' };
        },
        formatMessage: async (params) => {
            return `Executing new tool with params: ${JSON.stringify(params)}`;
        },
        shouldRegister: async () => {
            // Return true if tool should be registered
            return true;
        },
    });
}
```

### Debugging

The extension includes a comprehensive logging utility. To enable debug logging:

```javascript
import { logger } from './utils/logger.js';

// Set log level to DEBUG
logger.setLevel('DEBUG');

// Enable logging
logger.setEnabled(true);
```

Logs are prefixed with `[Landowebtool]` for easy filtering.

## Troubleshooting

### Tools not appearing

1. Check that the extension is enabled in the Extensions menu
2. Verify that the API key is configured and valid
3. Ensure the "Enable Tools" toggle is on
4. Check the browser console for error messages

### API key validation fails

1. Verify that the API key is correct
2. Check that you have credits available on Serper.dev
3. Ensure you have a stable internet connection
4. Check the Serper API status page for outages

### Tool execution fails

1. Check the browser console for error messages
2. Verify that the API key is valid
3. Ensure the API endpoint is accessible
4. Check that the request timeout is sufficient

## API Limits

- Serper API free tier: 2,500 requests/month
- Search results: 1-20 results per request
- Scraping: 100KB content limit per page

## Security Considerations

- API keys are stored in SillyTavern's `extension_settings` object
- API keys are never logged or exposed in error messages
- All API requests use HTTPS
- Content length is limited to prevent excessive data transfer

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Follow the existing code style
2. Add comments for complex logic
3. Update the ARCHITECTURE.md for major changes
4. Test your changes thoroughly
5. Update this README for new features

## License

This extension is provided as-is for use with SillyTavern.

## Support

For issues or questions:
1. Check the ARCHITECTURE.md for technical details
2. Review the browser console for error messages
3. Verify your Serper API key and credits
4. Check SillyTavern's tool calling documentation

## Credits

- Built for SillyTavern
- Uses Serper API for web search and scraping
- Compatible with Kimi 2.5 model tool calling
