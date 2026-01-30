# Landowebtool Extension - Testing Instructions

## Prerequisites
1. SillyTavern installation running locally
2. Serper API key (get from https://serper.dev)
3. Browser with developer tools console

## Step 1: Reload SillyTavern Extensions

### Method A: Full SillyTavern Restart
1. Stop the SillyTavern server if it's running
2. Start SillyTavern again:
   ```bash
   node server.js
   ```
3. Open SillyTavern in your browser (typically http://localhost:8000)

### Method B: Extension Hot Reload (if supported)
1. In SillyTavern, go to **Extensions** menu
2. Look for a "Reload Extensions" or "Refresh" button
3. Alternatively, use browser refresh (F5) while on SillyTavern

## Step 2: Verify Extension Display

### Expected Behavior
1. Open SillyTavern and navigate to the **Extensions** menu
2. Look for "Landowebtool" in the extensions list
3. The extension should appear with:
   - Display name: "Landowebtool"
   - Settings icon/button next to it
   - Status indicator (enabled/disabled)

### What to Check
- ✅ Extension appears in extensions menu
- ✅ Settings button is clickable
- ✅ Extension shows as enabled by default

## Step 3: Access Extension Settings

### Navigation
1. Click on the **Extensions** menu in SillyTavern
2. Find "Landowebtool" in the list
3. Click the settings/gear icon next to it

### Expected Settings UI
The settings panel should display:
- **API Configuration** section with:
  - Serper API Key input field (password type)
  - "Test" button for API key validation
  - "Enable Tools" checkbox
- **Search Options** section with:
  - Max Results (1-20, default 10)
  - Request Timeout (5-120 seconds, default 30)
- **Available Tools** section describing:
  - Web Search tool
  - Web Scraping tool
- **Action Buttons**:
  - "Reset to Defaults"
  - "Save Settings"

## Step 4: Configure API Key

### Setup
1. Enter your Serper API key in the "Serper API Key" field
2. Click the "Test" button to validate the API key
3. Ensure "Enable Tools" checkbox is checked
4. Click "Save Settings"

### Expected Results
- API key test should show success message (toast notification)
- Settings should save without errors
- Console should log: `[Landowebtool] Tools registered successfully`

## Step 5: Verify Tool Registration

### Check Console Logs
1. Open browser Developer Tools (F12)
2. Go to Console tab
3. Look for messages:
   - `[Landowebtool] Extension initialized successfully`
   - `[Landowebtool] Tools registered successfully`
   - No error messages related to the extension

### Verify in SillyTavern Tool System
1. Check if tools are available to AI models:
   - The extension registers tools with SillyTavern's `ToolManager`
   - Tools should be available when using Kimi 2.5 or other tool-calling models
2. You can verify by:
   - Starting a chat with a tool-calling model
   - Asking a question that requires web search
   - The model should have access to "search" and "scrape" tools

## Step 6: Test Tool Functionality

### Web Search Test
1. In a chat with a tool-calling model (e.g., Kimi 2.5):
2. Ask: "What's the latest news about AI?"
3. The model should:
   - Recognize it needs to use the search tool
   - Call the search tool with appropriate query
   - Return search results

### Expected Behavior
- Console should show tool invocation logs
- Search should complete within timeout period
- Results should be formatted and returned to the chat

### Web Scraping Test
1. Provide a specific URL to scrape
2. Ask: "Can you scrape content from https://example.com?"
3. The model should:
   - Use the scrape tool with the URL
   - Return scraped content

## Step 7: Test Settings Changes

### Dynamic Tool Registration
1. Disable the extension by unchecking "Enable Tools"
2. Save settings
3. Console should show: `[Landowebtool] Tools unregistered`
4. Tools should no longer be available to AI models

### Re-enable
1. Re-check "Enable Tools"
2. Save settings
3. Console should show: `[Landowebtool] Tools registered successfully`
4. Tools should be available again

## Step 8: Error Handling Tests

### Invalid API Key
1. Enter an invalid API key
2. Click "Test" button
3. Should show error message
4. Tools should not register

### Missing API Key
1. Clear the API key field
2. Save settings
3. Tools should unregister
4. Console should show appropriate messages

### Network Issues
1. Test with poor/no network connection
2. Tools should handle timeouts gracefully
3. Error messages should be user-friendly

## Troubleshooting

### Extension Not Appearing
1. Check browser console for loading errors
2. Verify `manifest.json` is valid JSON
3. Ensure extension directory is in correct location: `public/scripts/extensions/landowebtool/`
4. Check SillyTavern server logs for extension loading errors

### Tools Not Registering
1. Verify API key is entered and valid
2. Check "Enable Tools" is checked
3. Look for console errors in browser DevTools
4. Verify `ToolManager` is available in SillyTavern

### Settings Not Saving
1. Check browser console for JavaScript errors
2. Verify `saveSettingsDebounced` function exists
3. Check network tab for failed requests

### TypeScript File Conflicts
If you encounter issues:
1. Remove all `.ts` files (they're source files, not needed for runtime)
2. Keep only `.js` files
3. Restart SillyTavern

## Verification Checklist

- [ ] Extension appears in SillyTavern extensions menu
- [ ] Settings UI loads without errors
- [ ] API key can be entered and tested
- [ ] Settings save successfully
- [ ] Tools register when API key is valid and enabled
- [ ] Tools unregister when disabled
- [ ] Web search tool works with test queries
- [ ] Web scraping tool works with test URLs
- [ ] Error handling works for invalid inputs
- [ ] Console logs show appropriate messages

## Common Issues and Solutions

### "Extension not found" error
- Ensure extension directory name matches `manifest.json` expectations
- Check SillyTavern is loading extensions from correct path

### "ToolManager not defined" error
- Verify SillyTavern version supports tool calling
- Check extension loads after SillyTavern core scripts

### API requests failing
- Verify Serper API key is valid and has credits
- Check network connectivity
- Verify CORS is not blocking requests (Serper API should support CORS)

### Settings not persisting
- Clear browser cache and reload
- Check SillyTavern settings storage
- Verify no JavaScript errors preventing save

## Final Verification

After completing all tests, the extension should:
1. ✅ Load reliably with SillyTavern
2. ✅ Provide functional settings UI
3. ✅ Register/unregister tools based on configuration
4. ✅ Execute web searches and scraping successfully
5. ✅ Handle errors gracefully
6. ✅ Log appropriate debug information

## Support

If issues persist:
1. Check the `CHANGES_SUMMARY.md` for known issues
2. Review browser console for specific error messages
3. Verify all file paths and imports are correct
4. Test with minimal configuration (API key only)