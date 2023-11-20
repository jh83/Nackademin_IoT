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


        var dat = await request.body;
        context.log(`Http body "${JSON.stringify(dat)}"`)

        // Return the result
        return {
            "partitionKey": dat.id,
            "tele": {
                "temperature": dat.temperature,
                "humidity": dat.humidity,
                "timestamp": new Date().getTime()
            }
        };
    }
});