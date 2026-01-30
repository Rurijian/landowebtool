Use Kimi API's Internet Search Functionality

In the previous chapter (Using Kimi API to Complete Tool Calls), we explained in detail how to use the tool_calls feature of the Kimi API to enable the Kimi large language model to perform internet searches. Let's review the process we implemented:

    We defined tools using the JSON Schema format. For internet searches, we defined two tools: search and crawl.
    We submitted the defined search and crawl tools to the Kimi large language model via the tools parameter.
    The Kimi large language model would select to call search and crawl based on the context of the current conversation, generate the relevant parameters, and output them in JSON format.
    We used the parameters output by the Kimi large language model to execute the search and crawl functions and submitted the results of these functions back to the Kimi large language model.
    The Kimi large language model would then provide a response to the user based on the results of the tool executions.

In the process of implementing internet searches, we needed to implement the search and crawl functions ourselves, which might include:

    Calling search engine APIs or implementing our own content search.
    Retrieving search results, including URLs and summaries.
    Fetching web page content based on URLs, which might require different reading rules for different websites.
    Cleaning and organizing the fetched web page content into a format that the model can easily recognize, such as Markdown.
    Handling various errors and exceptions, such as no search results or failure to fetch web page content.

Implementing these steps is often considered cumbersome and challenging. Our users have repeatedly requested a simple, ready-to-use "internet search" function. Therefore, based on the original tool_calls usage of the Kimi large language model, we have provided a built-in tool function builtin_function.$web_search to enable internet search functionality.

The basic usage and process of the $web_search function are the same as the usual tool_calls, but there are still some minor differences. We will explain in detail through examples how to call the built-in $web_search function of Kimi to enable internet search functionality and mark the items that need extra attention in the code and explanations.

Unlike ordinary tool, the $web_search function does not require specific parameter descriptions. It only needs the type and function.name in the tools declaration to successfully register the $web_search function:

tools = [
	{
		"type": "builtin_function",  # <-- We use builtin_function to indicate Kimi built-in tools, which also distinguishes it from ordinary function
		"function": {
			"name": "$web_search",
		},
	},
]

The $web_search function is prefixed with a dollar sign $, which is our agreed way to indicate Kimi built-in functions (in ordinary function definitions, the dollar sign $ is not allowed), and if there are other Kimi built-in functions in the future, they will also be prefixed with the dollar sign $.

When declaring tools, $web_search can coexist with other ordinary function. Furthermore, builtin_function can coexist with ordinary function. You can add both builtin_function and ordinary function to tools, or add both builtin_function and ordinary function at the same time.

Next, let's modify the original tool_calls code to explain how to execute tool_calls.

Here is the modified tool_calls code:

const axios = require('axios');
const openai = require('openai'); // Need to install the openai library
 
const client = new openai.OpenAI({
    apiKey: "sk-",
    baseURL: "https://api.moonshot.ai/v1",
});
 
const tools = [
    {
        "type": "builtin_function",
        "function": {
            "name": "$web_search",
        },
    }
];
function search_impl(arguments) {
    return arguments
}
 
const messages = [
    { "role": "system", "content": "You are Kimi, an AI assistant provided by Moonshot AI. You are more proficient in Chinese and English conversations. You provide users with safe, helpful, and accurate answers. At the same time, you will refuse to answer any questions involving terrorism, racial discrimination, or explicit violence. Moonshot AI is a proper noun and should not be translated into other languages." },
    { "role": "user", "content": "Please search for the value of the Chinese A-share index on October 8, 2024?" }  // The question requires Kimi large language model to search the internet
];
 
let finishReason = null;
 
async function main() {
    while (finishReason === null || finishReason === "tool_calls") {
        const completion = await client.chat.completions.create({
            model: "kimi-k2-turbo-preview",
            messages: messages,
            temperature: 0.6,
            max_tokens: 32768,
            tools: tools,  // <-- We pass the defined tools to Kimi large language model through the tools parameter
        });
        const choice = completion.choices[0];
        console.log(choice);
        finishReason = choice.finish_reason;
        console.log(finishReason);
        if (finishReason === "tool_calls") { // <-- Check if the current response contains tool_calls
            messages.push(choice.message); // <-- We add the assistant message returned by Kimi large language model to the context, so that Kimi large language model can understand our request next time
            for (const toolCall of choice.message.tool_calls) { // <-- There may be multiple tool_calls, so we use a loop to execute each one
                const tool_call_name = toolCall.function.name;
                const tool_call_arguments = JSON.parse(toolCall.function.arguments); // <-- The arguments are a serialized JSON Object, so we need to use JSON.parse to deserialize it
                if (tool_call_name == "$web_search") {
                    console.log('????');
                  tool_result = search_impl(tool_call_arguments)
                } else {
                  tool_result = 'no tool found'
                }
 
 
                // Construct a message with role=tool to show the result of the tool call to the model;
                // Note that we need to provide the tool_call_id and name fields in the message, so that Kimi large language model
                // can correctly match the corresponding tool_call.
                console.log("toolCall.id");
                console.log(toolCall.id);                
                console.log("tool_call_name");
                console.log(tool_call_name);
                console.log("tool_result");
                console.log(tool_result);                
                messages.push({
                    "role": "tool",
                    "tool_call_id": toolCall.id,
                    "name": tool_call_name,
                    "content": JSON.stringify(tool_result), // <-- We agree to submit the result of the tool call to Kimi large language model in string format, so we use JSON.stringify to serialize the result here
                });
            }
        }
        console.log(choice.message.content); // <-- Here, we return the model's response to the user
    }
     
}
 
main();

Looking back at the code above, we are surprised to find that when using the $web_search function, its basic process is no different from that of a regular function. Developers don't even need to modify the original code for executing tool calls. The part that is different and particularly noteworthy is that when we implement the search_impl function, we don't include much logic for searching, parsing, or obtaining web content. We simply return the parameters generated by Kimi large language model, tool_call.function.arguments, as they are to complete the tool call. Why is that?

In fact, as the name builtin_function suggests, $web_search is a built-in function of Kimi large language model. It is defined and executed by Kimi large language model. The process is as follows:

    When Kimi large language model generates a response with finish_reason=tool_calls, it means that Kimi large language model has realized that it needs to execute the $web_search function and has already prepared everything for it;
    Kimi large language model will return the necessary parameters for executing the function in the form of tool_call.function.arguments. However, these parameters are not executed by the caller. The caller just needs to submit tool_call.function.arguments to Kimi large language model as they are, and Kimi large language model will execute the corresponding online search process;
    When the user submits tool_call.function.arguments using a message with role=tool, Kimi large language model will immediately start the online search process and generate a readable message for the user based on the search and reading results, which is a message with finish_reason=stop;

The online search function provided by the Kimi API aims to offer a reliable large language model online search solution without breaking the compatibility of the original API and SDK. It is fully compatible with the original tool call feature of Kimi large language model. This means that: if you want to switch from Kimi's online search function to your own implementation, you can do so in just two simple steps without disrupting the overall structure of your code:

    Modify the tool definition of $web_search to your own implementation (including name, description, etc.). You may need to add additional information in tool.function to inform the model of the specific parameters it needs to generate. You can add any parameters you need in the parameters field;
    Change the implementation of the search_impl function. When using Kimi's $web_search, you just need to return the input parameters arguments as they are. However, if you use your own online search service, you may need to fully implement the search and crawl functions mentioned at the beginning of the article;

After completing the above steps, you will have successfully migrated from Kimi's online search function to your own implementation.

When using the $web_search function provided by Kimi, the search results are also counted towards the tokens occupied by the prompt (i.e., prompt_tokens). Typically, since the results of web searches contain a lot of content, the token consumption can be quite high. To avoid unknowingly using up a large number of tokens, we add an extra field called total_tokens when generating the arguments for the $web_search function. This field informs the caller of the total number of tokens occupied by the search content, which will be included in the prompt_tokens once the entire web search process is completed. We will use specific code to demonstrate how to obtain these token consumptions:

from typing import *
 
import os
import json
 
from openai import OpenAI
from openai.types.chat.chat_completion import Choice
 
 
client = OpenAI(
    base_url="https://api.moonshot.ai/v1",
    api_key=os.environ.get("MOONSHOT_API_KEY"),
)
 
 
# The specific implementation of the search tool; here we just return the arguments
def search_impl(arguments: Dict[str, Any]) -> Any:
    """
    When using the search tool provided by Moonshot AI, simply return the arguments as they are,
    without any additional processing logic.
 
    However, if you want to use another model while retaining the web search functionality,
    you only need to modify the implementation here (for example, calling the search and fetching web content),
    while keeping the function signature the same, which still works.
 
    This maximizes compatibility, allowing you to switch between different models without making destructive changes to the code.
    """
    return arguments
 
 
def chat(messages) -> Choice:
    completion = client.chat.completions.create(
        model="kimi-k2-turbo-preview",
        messages=messages,
        temperature=0.6,
        tools=[
            {
                "type": "builtin_function",
                "function": {
                    "name": "$web_search",
                },
            }
        ]
    )
    usage = completion.usage
    choice = completion.choices[0]
 
    # =========================================================================
    # By checking if finish_reason is "stop", we print the token consumption after completing the web search process
    if choice.finish_reason == "stop":
        print(f"chat_prompt_tokens:          {usage.prompt_tokens}")
        print(f"chat_completion_tokens:      {usage.completion_tokens}")
        print(f"chat_total_tokens:           {usage.total_tokens}")
    # =========================================================================
 
    return choice
 
 
def main():
    messages = [
        {"role": "system", "content": "You are Kimi."},
    ]
 
    # Initial query
    messages.append({
        "role": "user",
        "content": "Please search for Moonshot AI Context Caching technology and tell me what it is."
    })
 
    finish_reason = None
    while finish_reason is None or finish_reason == "tool_calls":
        choice = chat(messages)
        finish_reason = choice.finish_reason
        if finish_reason == "tool_calls":
            messages.append(choice.message)
            for tool_call in choice.message.tool_calls:
                tool_call_name = tool_call.function.name
                tool_call_arguments = json.loads(
                    tool_call.function.arguments)
                if tool_call_name == "$web_search":
 
    				# ===================================================================
                    # We print the tokens generated by the web search results during the web search process
                    search_content_total_tokens = tool_call_arguments.get("usage", {}).get("total_tokens")
                    print(f"search_content_total_tokens: {search_content_total_tokens}")
    				# ===================================================================
 
                    tool_result = search_impl(tool_call_arguments)
                else:
                    tool_result = f"Error: unable to find tool by name '{tool_call_name}'"
 
                messages.append({
                    "role": "tool",
                    "tool_call_id": tool_call.id,
                    "name": tool_call_name,
                    "content": json.dumps(tool_result),
                })
 
    print(choice.message.content)
 
 
if __name__ == '__main__':
    main()
 

Running the above code yields the following output:

search_content_total_tokens: 13046  # <-- This represents the number of tokens occupied by the web search results due to the web search action.
chat_prompt_tokens:          13212  # <-- This represents the number of input tokens, including the web search results.
chat_completion_tokens:      295    # <-- This represents the number of tokens generated by the Kimi large language model based on the web search results.
chat_total_tokens:           13507  # <-- This represents the total number of tokens consumed, including the web search process.
 
# The content generated by the Kimi large language model based on the web search results is omitted here.

Another issue that arises is that when the web search function is enabled, the number of tokens can change significantly, exceeding the context window of the originally used model. This may trigger an Input token length too long error message. Therefore, when using the web search function, we recommend using the dynamic model kimi-k2-turbo-preview to adapt to changes in token counts. We slightly modify the chat function to use the kimi-k2-turbo-preview model:

def chat(messages) -> Choice:
    completion = client.chat.completions.create(
        model="kimi-k2-turbo-preview", 
        messages=messages,
        temperature=0.6,
        tools=[
            {
                "type": "builtin_function",  # <-- Use builtin_function to declare the $web_search function. Please include the full tools declaration in each request.
                "function": {
                    "name": "$web_search",
                },
            }
        ]
    )
    return completion.choices[0]

The $web_search tool can be used in combination with other regular tools. You can freely mix tools with type=builtin_function and type=function.