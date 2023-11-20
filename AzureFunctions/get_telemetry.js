const { app } = require('@azure/functions');
const { CosmosClient } = require("@azure/cosmos");

const endpoint = process.env["CosmosDbEndpoint"];
const key = process.env["CosmosDbKey"];

const client = new CosmosClient({ endpoint, key });

app.http('get_telemetry', {
    methods: ['GET'],
    authLevel: 'function',
    handler: async (request, context) => {
        context.log(`Http function processed request for url "${request.url}"`);

        // Get start_time from request query parameters
        const start_time = request.query.get('start_time') || await request.text() || 0;
        context.log("start_time:", start_time);

        // Get end_time from request query parameters
        const end_time = request.query.get('end_time') || await request.text() || new Date().getTime();
        context.log("end_time:", end_time);

        // Query the database
        const { resources } = await client.database("ToDoList").container("Items").items.query(
            `SELECT c._ts AS timestamp, 
            c.Body AS telemetry, 
            c["SystemProperties"]["iothub-connection-device-id"] as device_id 
            FROM c WHERE c._ts > ${start_time} AND c._ts < ${end_time}`
        ).fetchAll();

        // Return the result
        return { jsonBody: resources };
    }
});
