const { MongoDBAtlasVectorSearch } = require('@langchain/mongodb');
const { OpenAIEmbeddings } = require('@langchain/openai');

const searchVectorStore = async (client, input) => {
    const query = String(input);

    const namespace = process.env.COLLECTION_NAMESPACE;
    const [dbName, collectionName] = namespace.split(".");
    const collection = client.db(dbName).collection(collectionName);

    const embeddings = new OpenAIEmbeddings();

    const vectorStore = new MongoDBAtlasVectorSearch(
        embeddings,
        {
            collection,
            indexName: process.env.INDEX_NAME,
        }
    );

    // Uncomment if you need these functionalities
    // const result = await vectorStore.maxMarginalRelevanceSearch(query, { k: 5 });
    // const retrieverOutput = await vectorStore.similaritySearch(query, 5);
    // console.log(result);

    return vectorStore;
};

module.exports = { searchVectorStore };

