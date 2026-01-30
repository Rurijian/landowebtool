Docs
Getting Started Guide
Use Tool Calls with Kimi API
Use Kimi API for Tool Calls

Tool calls, or tool_calls, evolved from function calls (function_call). In certain contexts, or when reading compatibility code, you can consider tool_calls and function_call to be the same. function_call is a subset of tool_calls.

Tool calls give the Kimi large language model the ability to perform specific actions. The Kimi large language model can engage in conversations and answer questions, which is its "talking" ability. Through tool calls, it also gains the ability to "do" things. With tool_calls, the Kimi large language model can help you search the internet, query databases, and even control smart home devices.

A tool call involves several steps:

    Define the tool using JSON Schema format;
    Submit the defined tool to the Kimi large language model via the tools parameter. You can submit multiple tools at once;
    The Kimi large language model will decide which tool(s) to use based on the context of the current conversation. It can also choose not to use any tools;
    The Kimi large language model will output the parameters and information needed to call the tool in JSON format;
    Use the parameters output by the Kimi large language model to execute the corresponding tool and submit the results back to the Kimi large language model;
    The Kimi large language model will respond to the user based on the results of the tool execution;

Reading the above steps, you might wonder:

    Why can't the Kimi large language model execute the tools itself? Why do we need to "help" the Kimi large language model execute the tools based on the parameters it generates? If we are the ones executing the tool calls, what is the role of the Kimi large language model?

We will use a practical example of a tool call to explain these questions to the reader.

The knowledge of the Kimi large language model comes from its training data. For questions that are time-sensitive, the Kimi large language model cannot find answers from its existing knowledge. In such cases, we want the Kimi large language model to search the internet for the latest information and answer our questions based on that information.

Imagine how we find the information we want on the internet:

    We open a search engine, such as Baidu or Bing, and search for the content we want. We then browse the search results and decide which one to click based on the website title and description;
    We might open one or more web pages from the search results and browse them to obtain the knowledge we need;

Reviewing our actions, we "use a search engine to search" and "open the web pages corresponding to the search results." The tools we use are the "search engine" and the "web browser." Therefore, we need to abstract these actions into tools in JSON Schema format and submit them to the Kimi large language model, allowing it to use search engines and browse web pages just like humans do.

Before we proceed, let's briefly introduce the JSON Schema format:

    JSON Schema is a vocabulary that you can use to annotate and validate JSON documents.

    JSON Schema is a JSON document used to describe the format of JSON data.

We define the following JSON Schema:

{
	"type": "object",
	"properties": {
		"name": {
			"type": "string"
		}
	}
}

This JSON Schema defines a JSON Object that contains a field named name, and the type of this field is string, for example:

{
	"name": "Hei"
}

By describing our tool definitions using JSON Schema, we can make it clearer and more intuitive for the Kimi large language model to understand what parameters our tools require, as well as the type and description of each parameter. Now let's define the "search engine" and "web browser" tools mentioned earlier:

tools = [
	{
		"type": "function", // The field "type" is a convention, currently supporting "function" as its value
		"function": { // When "type" is "function", use the "function" field to define the specific function content
			"name": "search", // The name of the function, please use English letters, numbers, plus hyphens and underscores as the function name
			"description": ""/* 
				Search for content on the internet using a search engine.
 
				When your knowledge cannot answer the user's question, or when the user requests an online search, call this tool. Extract the content the user wants to search from the conversation as the value of the query parameter.
				The search results include the website title, website address (URL), and website description.
			*/, // Description of the function, write the specific function and usage scenarios here so that the Kimi large language model can correctly choose which functions to use
			"parameters": { // Use the "parameters" field to define the parameters accepted by the function
				"type": "object", // Always use "type": "object" to make the Kimi large language model generate a JSON Object parameter
				"required": ["query"], // Use the "required" field to tell the Kimi large language model which parameters are required
				"properties": { // The specific parameter definitions are in "properties", you can define multiple parameters
					"query": { // Here, the key is the parameter name, and the value is the specific definition of the parameter
						"type": "string", // Use "type" to define the parameter type
						"description": ""/*
							The content the user wants to search for, extract it from the user's question or chat context.
						*/ // Use "description" to describe the parameter so that the Kimi large language model can better generate the parameter
					}
				}
			}
		}
	},
	{
		"type": "function", // The field "type" is a convention, currently supporting "function" as its value
		"function": { // When "type" is "function", use the "function" field to define the specific function content
			"name": "crawl", // The name of the function, please use English letters, numbers, plus hyphens and underscores as the function name
			"description": ""/*
				Get the content of a webpage based on the website address (URL).
			*/, // Description of the function, write the specific function and usage scenarios here so that the Kimi large language model can correctly choose which functions to use
			"parameters": { // Use the "parameters" field to define the parameters accepted by the function
				"type": "object", // Always use "type": "object" to make the Kimi large language model generate a JSON Object parameter
				"required": ["url"], // Use the "required" field to tell the Kimi large language model which parameters are required
				"properties": { // The specific parameter definitions are in "properties", you can define multiple parameters
					"url": { // Here, the key is the parameter name, and the value is the specific definition of the parameter
						"type": "string", // Use "type" to define the parameter type
						"description": ""/*
							The website address (URL) of the content to be obtained, which can usually be obtained from the search results.
						*/ // Use "description" to describe the parameter so that the Kimi large language model can better generate the parameter
					}
				}
			}
		}
	}
]

When defining tools using JSON Schema, we use the following fixed format:

{
	"type": "function",
	"function": {
		"name": "NAME",
		"description": "DESCRIPTION",
		"parameters": {
			"type": "object",
			"properties": {
				
			}
		}
	}
}

Here, name, description, and parameters.properties are defined by the tool provider. The description explains the specific function and when to use the tool, while parameters outlines the specific parameters needed to successfully call the tool, including parameter types and descriptions. Ultimately, the Kimi large language model will generate a JSON Object that meets the defined requirements as the parameters (arguments) for the tool call based on the JSON Schema.

Let's try submitting the search tool to the Kimi large language model to see if it can correctly call the tool:

const OpenAI = require("openai")
 
 
client = OpenAI({
    apiKey: "MOONSHOT_API_KEY", // Replace MOONSHOT_API_KEY with the API Key you obtained from the Kimi Open Platform
    baseURL: "https://api.moonshot.ai/v1",
})
 
tools = [
	{
		"type": "function", // The agreed-upon field type, currently supports function as a value
		"function": { // When type is function, use the function field to define the specific function content
			"name": "search", // The name of the function, please use English letters, numbers, plus hyphens and underscores as the function name
			"description": ""/* 
				Search for content on the internet using a search engine.
 
				When your knowledge cannot answer the user's question, or the user requests you to search online, call this tool. Extract the content the user wants to search from the conversation as the value of the query parameter.
				The search results include the website title, website address (URL), and website description.
			*/, // Description of the function, write the specific function's role and usage scenario here to help Kimi large language model correctly choose which functions to use
			"parameters": { // Use the parameters field to define the parameters the function accepts
				"type": "object", // Fixedly use type: object to make Kimi large language model generate a JSON Object parameter
				"required": ["query"], // Use the required field to tell Kimi large language model which parameters are required
				"properties": { // The specific parameter definitions are in properties, you can define multiple parameters
					"query": { // Here, the key is the parameter name, and the value is the specific definition of the parameter
						"type": "string", // Use type to define the parameter type
						"description": ""/*
							The content the user wants to search for, extracted from the user's question or chat context.
						*/ // Use description to describe the parameter so that Kimi large language model can better generate the parameter
					}
				}
			}
		}
	},
	// {
	// 	"type": "function", // The agreed-upon field type, currently supports function as a value
	// 	"function": { // When type is function, use the function field to define the specific function content
	// 		"name": "crawl", // The name of the function, please use English letters, numbers, plus hyphens and underscores as the function name
	// 		"description": """
	// 			Get the webpage content based on the website address (URL).
	// 		""", // Description of the function, write the specific function's role and usage scenario here to help Kimi large language model correctly choose which functions to use
	// 		"parameters": { // Use the parameters field to define the parameters the function accepts
	// 			"type": "object", // Fixedly use type: object to make Kimi large language model generate a JSON Object parameter
	// 			"required": ["url"], // Use the required field to tell Kimi large language model which parameters are required
	// 			"properties": { // The specific parameter definitions are in properties, you can define multiple parameters
	// 				"url": { // Here, the key is the parameter name, and the value is the specific definition of the parameter
	// 					"type": "string", // Use type to define the parameter type
	// 					"description": """
	// 						The website address (URL) whose content needs to be obtained, usually the website address can be obtained from the search results.
	// 					""" // Use description to describe the parameter so that Kimi large language model can better generate the parameter
	// 				}
	// 			}
	// 		}
	// 	}
	// }
]
 
async function main() {
    const completion = await client.chat.completions.create({
        model: "kimi-k2-turbo-preview",
        messages=[
            {role: "system", content: "You are Kimi, an AI assistant provided by Moonshot AI. You are proficient in Chinese and English conversations. You provide users with safe, helpful, and accurate answers. You refuse to answer any questions related to terrorism, racism, or explicit content. Moonshot AI is a proper noun and should not be translated."},
            {role: "user", content: "Please search the internet for 'Context Caching' and tell me what it is."} // In the question, we ask Kimi large language model to search online
        ],
        temperature: 0.6,
        tools: tools, // <-- We pass the defined tools to Kimi large language model via the tools parameter
    })
     
    console.log(completion.choices[0].model_dump_json(indent=4))
}
 
main()

When the above code runs successfully, we get the response from Kimi large language model:

{
    "finish_reason": "tool_calls",
    "message": {
        "content": "",
        "role": "assistant",
        "tool_calls": [
            {
                "id": "search:0",
                "function": {
                    "arguments": "{\n    \"query\": \"Context Caching\"\n}",
                    "name": "search"
                },
                "type": "function",
            }
        ]
    }
}

Notice that in this response, the value of finish_reason is tool_calls, which means that the response is not the answer from Kimi large language model, but rather the tool that Kimi large language model has chosen to execute. You can determine whether the current response from Kimi large language model is a tool call tool_calls by checking the value of finish_reason.

In the message section, the content field is empty because the model is currently executing tool_calls and has not yet generated a response for the user. Meanwhile, a new field tool_calls has been added. The tool_calls field is a list that contains all the tool call information for this execution. This also indicates another characteristic of tool_calls: the model can choose to call multiple tools at once, which can be different tools or the same tool with different parameters. Each element in tool_calls represents a tool call. Kimi large language model generates a unique id for each tool call. The function.name field indicates the name of the function being executed, and the parameters are placed in function.arguments. The arguments parameter is a valid serialized JSON Object (additionally, the type parameter is currently a fixed value function).

Next, we should use the tool call parameters generated by Kimi large language model to execute the specific tools.

Kimi large language model does not execute the tools for us. We need to execute the parameters generated by Kimi large language model after receiving them. Before explaining how to execute the tools, let's first address the question we raised earlier:

    Why can't Kimi large language model execute the tools itself, but instead requires us to "help" it execute the tools based on the parameters generated by Kimi large language model? If we are the ones executing the tool calls, what is the purpose of Kimi large language model?

Let's imagine a scenario where we use Kimi large language model: we provide users with a smart robot based on Kimi large language model. In this scenario, there are three roles: the user, the robot, and Kimi large language model. The user asks the robot a question, the robot calls the Kimi large language model API, and returns the API result to the user. When using tool_calls, the user asks the robot a question, the robot calls the Kimi API with tools, Kimi large language model returns the tool_calls parameters, the robot executes the tool_calls, submits the results back to the Kimi API, Kimi large language model generates the message to be returned to the user (finish_reason=stop), and only then does the robot return the message to the user. Throughout this process, the entire tool_calls process is transparent and implicit to the user.

Returning to the question above, as users, we are not actually executing the tool calls, nor do we directly "see" the tool calls. Instead, the robot that provides us with the service is completing the tool calls and presenting us with the final response generated by Kimi large language model.

Let's explain how to execute the tool_calls returned by Kimi large language model from the perspective of the "robot":

const axios = require('axios');
const openai = require('openai'); // You need to install the openai library
 
const client = new openai.OpenAI({
    apiKey: "MOONSHOT_API_KEY", // Replace MOONSHOT_API_KEY with the API Key you obtained from the Kimi Open Platform
    baseURL: "https://api.moonshot.ai/v1",
});
 
const tools = [
    {
        "type": "function",
        "function": {
            "name": "search",
            "description": "Search for content on the internet using a search engine.\n\nUse this tool when your knowledge can't answer the user's question or when the user asks you to search online. Extract the content the user wants to search for from the conversation and use it as the value for the query parameter.\nThe search results include the website title, URL, and a brief description.",
            "parameters": {
                "type": "object",
                "required": ["query"],
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The content the user wants to search for, extracted from the user's question or chat context."
                    }
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "crawl",
            "description": "Retrieve web page content based on a website URL.",
            "parameters": {
                "type": "object",
                "required": ["url"],
                "properties": {
                    "url": {
                        "type": "string",
                        "description": "The URL of the website whose content you want to retrieve, usually obtained from search results."
                    }
                }
            }
        }
    }
];
 
async function searchImpl(query) {
    const response = await axios.get("https://your.search.api", { params: { query } });
    return response.data;
}
 
function search(arguments) {
    const query = arguments.query;
    const result = searchImpl(query);
    return { "result": result };
}
 
async function crawlImpl(url) {
    const response = await axios.get(url);
    return response.data;
}
 
function crawl(arguments) {
    const url = arguments.url;
    const content = crawlImpl(url);
    return { "content": content };
}
 
const toolMap = {
    "search": search,
    "crawl": crawl,
};
 
const messages = [
    { "role": "system", "content": "You are Kimi, an AI assistant provided by Moonshot AI. You are proficient in Chinese and English conversations. You provide users with safe, helpful, and accurate answers. You will refuse to answer any questions involving terrorism, racism, or explicit content. Moonshot AI is a proper noun and should not be translated into other languages." },
    { "role": "user", "content": "Please search the internet for Context Caching and tell me what it is." }  // The user is asking Kimi to search online
];
 
let finishReason = null;
 
async function main() {
    while (finishReason === null || finishReason === "tool_calls") {
        const completion = await client.chat.completions.create({
            model: "kimi-k2-turbo-preview",
            messages: messages,
            temperature: 0.6,
            tools: tools,  // <-- We pass the defined tools to the Kimi large language model via the tools parameter
        });
        const choice = completion.choices[0];
        finishReason = choice.finish_reason;
        if (finishReason === "tool_calls") { // <-- Check if the current response includes tool_calls
            messages.push(choice.message); // <-- Add the assistant message from Kimi to the context for the next request
            for (const toolCall of choice.message.tool_calls) { // <-- There might be multiple tool_calls, so we loop through each one
                const toolCallName = toolCall.function.name;
                const toolCallArguments = JSON.parse(toolCall.function.arguments); // <-- The arguments are a serialized JSON object, so we need to parse them
                const toolFunction = toolMap[toolCallName]; // <-- Use tool_map to quickly find which function to execute
                const toolResult = await toolFunction(toolCallArguments);
 
                // Construct a role=tool message with the function execution result to show the model the outcome of the tool call;
                // Note that we need to provide the tool_call_id and name fields in the message so that Kimi can correctly match the tool_call.
                messages.push({
                    "role": "tool",
                    "tool_call_id": toolCall.id,
                    "name": toolCallName,
                    "content": JSON.stringify(toolResult), // <-- We agreed to submit the tool call result as a string, so we serialize it with JSON.stringify
                });
            }
        }
    }
    console.log(choice.message.content); // <-- Finally, we return the model's response to the user
}
 
main();

We use a while loop to execute the code logic that includes tool calls because the Kimi large language model typically doesn't make just one tool call, especially in the context of online searching. Usually, Kimi will first call the search tool to get search results, and then call the crawl tool to convert the URLs in the search results into actual web page content. The overall structure of the messages is as follows:

system: prompt                                                                                               # System prompt
user: prompt                                                                                                 # User's question
assistant: tool_call(name=search, arguments={query: query})                                                  # Kimi returns a tool_call (single)
tool: search_result(tool_call_id=tool_call.id, name=search)                                                  # Submit the tool_call execution result
assistant: tool_call_1(name=crawl, arguments={url: url_1}), tool_call_2(name=crawl, arguments={url: url_2})  # Kimi continues to return tool_calls (multiple)
tool: crawl_content(tool_call_id=tool_call_1.id, name=crawl)                                                 # Submit the execution result of tool_call_1
tool: crawl_content(tool_call_id=tool_call_2.id, name=crawl)                                                 # Submit the execution result of tool_call_2
assistant: message_content(finish_reason=stop)                                                               # Kimi generates a reply to the user, ending the conversation

This completes the entire process of making "online query" tool calls. If you have implemented your own search and crawl methods, when you ask Kimi to search online, it will call the search and crawl tools and give you the correct response based on the tool call results.

In streaming output mode (stream), tool_calls are still applicable, but there are some additional things to note, as follows:

    During streaming output, since finish_reason will appear in the last data chunk, it is recommended to check if the delta.tool_calls field exists to determine if the current response includes a tool call;
    During streaming output, delta.content will be output first, followed by delta.tool_calls, so you must wait until delta.content has finished outputting before you can determine and identify tool_calls;
    During streaming output, we will specify the tool_call.id and tool_call.function.name in the initial data chunk, and only tool_call.function.arguments will be output in subsequent chunks;
    During streaming output, if Kimi returns multiple tool_calls at once, we will use an additional field called index to indicate the index of the current tool_call, so that you can correctly concatenate the tool_call.function.arguments parameters. We use a code example from the streaming output section (without using the SDK) to illustrate how to do this:

const os = require('os');
const axios = require('axios');// Use the axios library to perform HTTP requests
 
const tools = [
    {
        "type": "function",
        "function": {
            "name": "search",
            "description": "Search the internet for content using a search engine.\n\nWhen your knowledge cannot answer the user's question or the user requests an online search, call this tool. Extract the content the user wants to search from the conversation as the value of the query parameter.\nThe search results include the title of the website, the website's address (URL), and a brief introduction to the website.",
            "parameters": {
                "type": "object",
                "required": ["query"],
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The content the user wants to search for, extracted from the user's question or chat context."
                    }
                }
            }
        }
    },
];
 
const header = {
    "Content-Type": "application/json",
    "Authorization": `Bearer MOONSHOT_API_KEY`
};
 
const data = {
    "model": "kimi-k2-turbo-preview",
    "messages": [
        {"role": "user", "content": "Please search for Context Caching technology online."}
    ],
    "temperature": 0.6,
    "stream": true,
    "n": 2,
    "tools": tools,
    "tool_choice": "auto"
};
 
axios.post("https://api.moonshot.ai/v1/chat/completions", 
    data, {
    headers: header,
    responseType: 'stream'   
}).then(response => {
    if (response.status !== 200) {
        throw new Error(response.text);
    }
 
    let data = "";
    let messages = [{}, {}];
 
    response.data.on('data', chunk => {
        let line = chunk.toString().trim();
 
        if (line === "") {
            let chunk = JSON.parse(data);
 
            for (let choice of chunk.choices) {
                let index = choice.index;
                let message = messages[index];
                let usage = choice.usage;
                if (usage) message.usage = usage;
                let delta = choice.delta;
                let role = delta.role;
                if (role) message.role = role;
                let content = delta.content;
                if (content) message.content = message.content + content;
 
                let tool_calls = delta.tool_calls;
                if (tool_calls) {
                    if (!message.tool_calls) message.tool_calls = [];
                    for (let tool_call of tool_calls) {
                        let tool_call_index = tool_call.index;
                        if (message.tool_calls.length < tool_call_index + 1) {
                            message.tool_calls.push({}).repeat(tool_call_index + 1 - message.tool_calls.length);
                        }
                        let tool_call_object = message.tool_calls[tool_call_index];
                        tool_call_object.index = tool_call_index;
 
                        let tool_call_id = tool_call.id;
                        if (tool_call_id) tool_call_object.id = tool_call_id;
                        let tool_call_type = tool_call.type;
                        if (tool_call_type) tool_call_object.type = tool_call_type;
                        let tool_call_function = tool_call.function;
                        if (tool_call_function) {
                            if (!tool_call_object.function) tool_call_object.function = {};
                            let tool_call_function_name = tool_call_function.name;
                            if (tool_call_function_name) tool_call_object.function.name = tool_call_function_name;
                            let tool_call_function_arguments = tool_call_function.arguments;
                            if (tool_call_function_arguments) {
                                if (!tool_call_object.function.arguments) {
                                    tool_call_object.function.arguments = tool_call_function_arguments;
                                } else {
                                    tool_call_object.function.arguments = tool_call_object.function.arguments + tool_call_function_arguments;
                                }
                            }
                        }
                        message.tool_calls[tool_call_index] = tool_call_object;
                    }
                }
            }
            data = ""; // Reset data
        } else if (line.startsWith("data: ")) {
            data = line.substring(6);
        } else {
            data = data + "\n" + line;
        }
    });
 
    response.data.on('end', () => {
        for (let index = 0; index < messages.length; index++) {
            console.log("index:", index);
            console.log("message:", JSON.stringify(messages[index], null, 4));
            console.log("");
        }
    });
}).catch(error => {
    console.error("Request failed:", error);
});

Below is an example of handling tool_calls in streaming output using the openai SDK:

const os = require('os');
const openai = require('openai'); // Need to install the openai library
 
const client = new openai.OpenAI({
    apiKey: "MOONSHOT_API_KEY",
    baseURL: "https://api.moonshot.ai/v1"
});
 
const tools = [
    {
        "type": "function",
        "function": {
            "name": "search",
            "description": "Search for content on the internet using a search engine.\n\nCall this tool when your knowledge cannot answer the user's question, or when the user requests an online search. Extract the content the user wants to search for from the conversation and use it as the value of the query parameter.\nThe search results include the website title, address (URL), and a brief description of the website.",
            "parameters": {
                "type": "object",
                "required": ["query"],
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "The content the user wants to search for, extracted from the user's question or chat context."
                    }
                }
            }
        }
    },
];
 
async function main() {
    response = await client.chat.completions.create({
        model: "kimi-k2-turbo-preview",
        messages: [
            { "role": "user", "content": "Please search for Context Caching technology online." }
        ],
        temperature: 0.6,
        stream: true,
        tools: tools,
        tool_choice: "auto"
    });
 
    let messages = [{}, {}];
    let data = '';
 
    for await (const chunk of response) {
         for (const choice of chunk.choices) {
            const index = choice.index;
            const message = messages[index];
            const delta = choice.delta;
            const role = delta.role;
            if (role) message.role = role;
            const content = delta.content;
            if (content) message.content = message.content + content;
 
            const tool_calls = delta.tool_calls;
            if (tool_calls) {
                if (!message.tool_calls) message.tool_calls = [];
                for (const tool_call of tool_calls) {
                    const tool_call_index = tool_call.index;
                    if (message.tool_calls.length < tool_call_index + 1) {
                        for (let i = message.tool_calls.length; i < tool_call_index + 1; i++) {
                            message.tool_calls.push({});
                        }
                    }
                    const tool_call_object = message.tool_calls[tool_call_index];
                    tool_call_object.index = tool_call_index;
 
                    const tool_call_id = tool_call.id;
                    if (tool_call_id) tool_call_object.id = tool_call_id;
                    const tool_call_type = tool_call.type;
                    if (tool_call_type) tool_call_object.type = tool_call_type;
                    const tool_call_function = tool_call.function;
                    if (tool_call_function) {
                        if (!tool_call_object.function) tool_call_object.function = {};
                        const tool_call_function_name = tool_call_function.name;
                        if (tool_call_function_name) tool_call_object.function.name = tool_call_function_name;
                        const tool_call_function_arguments = tool_call_function.arguments;
                        if (tool_call_function_arguments) {
                            if (!tool_call_object.function.arguments) {
                                tool_call_object.function.arguments = tool_call_function_arguments;
                            } else {
                                tool_call_object.function.arguments += tool_call_function_arguments;
                            }
                        }
                    }
                    message.tool_calls[tool_call_index] = tool_call_object;
                }
            }
        }
    }
 
    for (let index = 0; index < messages.length; index++) {
        console.log("index:", index);
        console.log("message:", JSON.stringify(messages[index], null, 2));
        console.log("");
    }
}
 
main().catch(console.error);

tool_calls is an advanced version of function_call. Since OpenAI has marked parameters such as function_call (for example, functions) as "deprecated," our API will no longer support function_call. You can consider using tool_calls instead of function_call. Compared to function_call, tool_calls has the following advantages:

    It supports parallel calls. The Kimi large language model can return multiple tool_calls at once. You can use concurrency in your code to call these tool_call simultaneously, reducing time consumption;
    For tool_calls that have no dependencies, the Kimi large language model will also tend to call them in parallel. Compared to the original sequential calls of function_call, this reduces token consumption to some extent;

When using the tool_calls tool, you may notice that under the condition of finish_reason=tool_calls, the message.content field is occasionally not empty. Typically, the content here is the Kimi large language model explaining which tools need to be called and why these tools need to be called. Its significance lies in the fact that if your tool call process takes a long time, or if completing a round of chat requires multiple sequential tool calls, providing a descriptive sentence to the user before calling the tool can reduce the anxiety or dissatisfaction that users may feel due to waiting. Additionally, explaining to the user which tools are being called and why helps them understand the entire tool call process and allows them to intervene and correct in a timely manner (for example, if the user thinks the current tool selection is incorrect, they can terminate the tool call in time, or correct the model's tool selection in the next round of chat through a prompt).

The content in the tools parameter is also counted in the total Tokens. Please ensure that the total number of Tokens in tools and messages does not exceed the model's context window size.

In scenarios where tools are called, our messages are no longer laid out like this:

system: ...
user: ...
assistant: ...
user: ...
assistant: ...

Instead, they will look like this:

system: ...
user: ...
assistant: ...
tool: ...
tool: ...
assistant: ...

It is important to note that when the Kimi large language model generates tool_calls, ensure that each tool_call has a corresponding message with role=tool, and that this message has the correct tool_call_id. If the number of role=tool messages does not match the number of tool_calls, or if the tool_call_id in the role=tool messages cannot be matched with the tool_call.id in tool_calls, an error will occur.

If you encounter the tool_call_id not found error, it may be because you did not add the role=assistant message returned by the Kimi API to the messages list. The correct message sequence should look like this:

system: ...
user: ...
assistant: ...  # <-- Perhaps you did not add this assistant message to the messages list
tool: ...
tool: ...
assistant: ...

You can avoid the tool_call_id not found error by executing messages.append(message) each time you receive a return value from the Kimi API, to add the message returned by the Kimi API to the messages list.

Note: Assistant messages added to the messages list before the role=tool message must fully include the tool_calls field and its values returned by the Kimi API. We recommend directly adding the choice.message returned by the Kimi API to the messages list "as is" to avoid potential errors.