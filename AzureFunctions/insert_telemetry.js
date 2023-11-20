const { app, output } = require('@azure/functions');

const cosmosOutput = output.cosmosDB({
    databaseName: 'ToDoList',
    collectionName: 'smhi',
    createIfNotExists: true,
    connectionStringSetting: 'CosmosDBConnection',
});

app.http('insert_telemetry', {
    methods: ['POST'],
    authLevel: 'function',
    return: cosmosOutput,
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        const requestData = await request.json();
        context.log("requestData: ", requestData);

        // Return the result to cosmosDB and thru HTTP
        return {
            "partitionKey": requestData.id,
            "device_type": "weatherStation",
            "telemetry": {
                "temperature": requestData.temperature,
                "humidity": requestData.humidity,
                "timestamp": new Date().getTime()
            }
        };
    }
});