Web Search

extension location: https://github.com/SillyTavern/Extension-WebSearch


Adds web search results to LLM prompts.
Note

Some Chat Completion sources provide built-in web search functionality. In this case, this extension will be largely redundant. Check the  AI Response Configuration panel for the "Enable web search" toggle. For example, this is available for Claude, Google AI Studio / Vertex AI, xAI, and OpenRouter backends.
#
Available sources
#
Selenium Plugin

Requires an official server plugin to be installed and enabled.

See SillyTavern-WebSearch-Selenium for more details.

Supports Google and DuckDuckGo engines.
#
Extras API

Requires a websearch module and Chrome/Firefox web browser installed on the host machine.

Supports Google and DuckDuckGo engines.
#
SerpApi

Requires an API key.

Get the key here: https://serpapi.com/dashboard
#
SearXNG

Requires a SearXNG instance URL (either private or public). Uses HTML format for search results.

SearXNG preferences string: obtained from SearXNG - preferences - COOKIES - Copy preferences hash

Learn more: https://docs.searxng.org/
#
Tavily AI

Requires an API key.

Get the key here: https://app.tavily.com/
#
KoboldCpp

KoboldCpp URL must be provided in Text Completion API settings. KoboldCpp version must be >= 1.81.1 and WebSearch module must be enabled on startup: enable Network => Enable WebSearch in the GUI launcher or add --websearch to the command line.

See: https://github.com/LostRuins/koboldcpp/releases/tag/v1.81.1
#
Serper

Requires an API key.

Get the key here: https://serper.dev/
#
Z.AI

Requires an API key, set it in the Chat Completion API settings first. Not compatible with the Coding API subscription!

Get the key here: https://z.ai/manage-apikey/apikey-list/

Docs: https://docs.z.ai/api-reference/tools/web-search
#
How to use

    Make sure you use the latest version of SillyTavern.
    Install the extension via the "Download Extensions & Assets" menu in SillyTavern.
    Open the "Web Search" extension settings, set your API key or connect to Extras, and enable the extension.
    The web search results will be added to the prompt organically as you chat. Only user messages trigger the search.
    To include search results more organically, wrap search queries with single backticks: Tell me about the `latest Ryan Gosling movie`. will produce a search query latest Ryan Gosling movie.
    Optionally, configure the settings to your liking.

#
Settings
#
General

    Enabled - toggles the extension on and off.
    Sources = sets the search results source.
    Cache Lifetime - how long (in seconds) the search results are cached for your prompt. Default = one week.

#
Prompt Settings

    Prompt Budget - sets the maximum capacity of the inserted text (in characters of text, NOT tokens). Rule of thumb: 1 token ~ 3-4 characters, adjust according to your model's context limits. Default = 1500 characters.
    Insertion Template - how the result gets inserted into the prompt. Supports the usual macro + special macro: {{query}} for search query and {{text}} for search results.
    Injection Position - where the result goes in the prompt. The same options as for the Author's Note: as in-chat injection or before/after system prompt.

#
Search Activation

    Use function tool - uses function calling to activate search or scrape web pages. Must use a supported Chat Completion API and be enabled in the AI Response settings. Disables all other activation methods when engaged.
    Use Backticks - enables search activation using words encased in single backticks.
    Use Trigger Phrases - enables search activation using trigger phrases.
    Regular expressions - provide a JS-flavored regex to match the user message. If the regex matches, the search with a given query will be triggered. Search query supports `` and $1-syntax to reference the matched group. Example: /what is happening in (.*)/i regex for search query news in $1 will match a message containing what is happening in New York and trigger the search with the query news in New York.
    Trigger Phrases - add phrases that will trigger the search, one by one. It can be anywhere in the message, and the query starts from the trigger word and spans to "Max Words" total. To exclude a specific message from processing, it must start with a period, e.g. .What do you think?. Priority of triggers: first by order in the textbox, then the first one in the user message.
    Max Words - how many words are included in the search query (including the trigger phrase). Google has a limit of about 32 words per prompt. Default = 10 words.

#
Page Scraping

    Visit Links - text will be extracted from the visited search result pages and saved to a file attachment.
    Visit Count - how many links will be visited and parsed for text.
    Visit Domain Blacklist - site domains to be excluded from visiting. One per line.
    File Header - file header template, inserted at the start of the text file, has an additional {{query}} macro.
    Block Header - link block template, inserted with the parsed content of every link. Use {{link}} macro for page URL and {{text}} for page content.
    Save Target - where to save the results of scraping. Possible options: trigger message attachments, or chat attachments of Data Bank, or just images (if the source supports them).
    Include Images - attach relevant images to the chat. Requires a source that supports images (see below).

#
More info

Search results from the latest query will stay included in the prompt until the next valid query is found. If you want to ask additional questions without accidentally triggering the search, start your message with a period.

Web Search function tool always overrides other triggers if enabled and available.

Priority of triggers (if multiple are enabled):

    Backticks.
    Regular expressions.
    Trigger phrases.

To discard all previous queries from processing, start the user message with an exclamation mark, for example, a user message !Now let's talk about... will discard this and every message above it.

This extension also provides a /websearch slash command to use in STscript. More info here: STscript Language Reference
stscript

/websearch (links=on|off snippets=on|off [query]) – performs a web search query. Use named arguments to specify what to return - page snippets (default: on), full parsed pages (default: off) or both.

Example: /websearch links=off snippets=on how to make a sandwich

#
What can be included in the search result?

Thesaurus:

    Answer box: Direct answer to the question.
    Knowledge graph: Encyclopedic knowledge about the topic.
    Page snippets: Relevant extracts from the web pages.
    Relevant questions: Questions and answers to similar topics.
    Images: Relevant images.

#
SerpApi

    Answer box.
    Knowledge graph.
    Page snippets (max 10).
    Relevant questions (max 10).
    Images (max 10).

#
Selenium Plugin and Extras API

    Google - answer box, knowledge graph, page snippets.
    DuckDuckGo - page snippets.

Selenium Plugin can additionaly provide images.
#
SearXNG

    Infobox.
    Page snippets.
    Images.

#
Tavily AI

    Answer.
    Page contents.
    Images (up to 5).

#
KoboldCpp

    Page titles.
    Page snippets.

#
Serper

    Answer box.
    Knowledge graph.
    Page snippets.
    Relevant questions.
    Images.

#
Z.AI

    Page titles.
    Page snippets.