const { app, output } = require('@azure/functions');

const cosmosOutput = output.cosmosDB({
    databaseName: 'ToDoList',
    collectionName: 'Items',
    createIfNotExists: true,
    connectionStringSetting: 'CosmosDBConnection',
});

app.timer('poll_weatherdata', {
    schedule: '0 0 * * * *',
    return: cosmosOutput,
    handler: async (myTimer, context) => {
        context.log("Started by timer");

        const r = await fetch("https://opendata-download-metobs.smhi.se/api/version/latest/parameter/1/station/72420/period/latest-hour/data.json");
        const fetchJson = await r.json();

        if (r.status === 200) {
            // Return the result to cosmosDB and thru HTTP
            return {
                "partitionKey": fetchJson.station.key,
                "name": fetchJson.station.name,
                "device_type": "weatherStation",
                "telemetry": {
                    "temperature": fetchJson.value[0].value,
                    "timestamp": fetchJson.value[0].date
                }
            };
        }
    }
});