const { app, output } = require('@azure/functions');

const cosmosOutput = output.cosmosDB({
    databaseName: 'IoT',
    collectionName: 'telemetry',
    createIfNotExists: false,
    connectionStringSetting: 'CosmosDBConnection',

});

app.timer('poll_weatherdata', {
    schedule: '0 0 * * * *',
    extraOutputs: [cosmosOutput],
    handler: async (myTimer, context) => {
        context.log("Started by timer");

        const r = await fetch("https://opendata-download-metobs.smhi.se/api/version/latest/parameter/1/station/72420/period/latest-hour/data.json");
        const rJson = await r.json();

        if (r.status === 200) {
            context.log("Saving to cosmosOutput")
            try {
                await context.extraOutputs.set(cosmosOutput, {
                    "device_id": rJson.station.key,
                    "sample_id": rJson.station.key + ":" + rJson.value[0].date,
                    "metadata": {
                        "name": rJson.station.name,
                        "device_type": "weatherStation",
                    },
                    "telemetry": {
                        "temperature": parseFloat(rJson.value[0].value),
                        "timestamp": rJson.value[0].date
                    }
                })

            } catch {
                context.log("There was an error");
            }

        }
    }
});