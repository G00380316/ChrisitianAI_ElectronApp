const dotenv = require('dotenv');
const { TavilySearchResults } = require('@langchain/community/tools/tavily_search');
const { AIMessage, HumanMessage } = require('@langchain/core/messages');
const { ChatPromptTemplate, MessagesPlaceholder } = require('@langchain/core/prompts');
const { ChatOpenAI } = require('@langchain/openai');
const { AgentExecutor, createOpenAIFunctionsAgent } = require('langchain/agents');
const { createRetrieverTool } = require('langchain/tools/retriever');
const { MongoClient } = require('mongodb');
const { connectMongoDB } = require('./mongo.js');
const { searchVectorStore } = require('./searchVectorMongoDB.js');
const ChatHistory = require('./llmHistory.js');

dotenv.config();

const client = new MongoClient(process.env.MONGODB_URI);

const model = new ChatOpenAI({
    modelName: 'gpt-3.5-turbo-1106',
    temperature: 0.5,
    maxTokens: 100,
});

const prompt = ChatPromptTemplate.fromMessages([
  ("ai", "You are a helpful friend and assistant and your personal name is Solomon, Answer questions only related to the Bible or Christianity and Answer referring to Bible and Christianity"),
  new MessagesPlaceholder("chat_history"),
  ("human", "{input}"),
  new MessagesPlaceholder("agent_scratchpad"),
  ("{tool-output}","{{#if hasRetrieverTool}} **Use the {{retrieverTool}} tool to enhance my response.** {{retrieverTool.output}} {{/if}}"),
  ("human", "{input}"),
]);

const searchTool = new TavilySearchResults();

async function handleQuestion(input) {
    await connectMongoDB();
    const aichatroom = process.env.AI_TEST_CHATROOM;
    const chatHistory = await ChatHistory.findOne({ aichatroom });
    const storeChatHistory = [];

    if (chatHistory) {
        chatHistory.messages.forEach((message, index) => {
            if (index % 2 === 0) {
                storeChatHistory.push(new HumanMessage(message.content));
            } else {
                storeChatHistory.push(new AIMessage(message.content));
            }
        });
    } else {
        await ChatHistory.create({ messages: storeChatHistory, aichatroom });
    }

    const vectorStore = await searchVectorStore(client ,input);

    const retriever = await vectorStore.asRetriever({
      k: 1,
      vectorStore,
      verbose: true
    });

    const retrieverTool = createRetrieverTool(retriever, {
      name: "retriever",
      description: "use this tool",
      query: "{input}"
    });

    const tools = [retrieverTool, searchTool];

    const agent = await createOpenAIFunctionsAgent({
      llm: model,
      prompt,
      tools,
    });

    const agentExecutor = new AgentExecutor({ agent, tools });
    const response = await agentExecutor.invoke({ input, chat_history: storeChatHistory });

    storeChatHistory.push(new HumanMessage(input));
    storeChatHistory.push(new AIMessage(response.output));
    await ChatHistory.findOneAndUpdate({ aichatroom }, { $set: { messages: storeChatHistory } });

    return response.output;
}

module.exports = { handleQuestion };

