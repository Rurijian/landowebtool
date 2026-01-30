src/prompt-converters.js, replace around line 1359 to add dummy reasoning.

message.reasoning_content = 'The user request requires a tool call so I should perform one.';


chat-completions.js, line in the moonshot branch starting at line 2261, add the function call:

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


