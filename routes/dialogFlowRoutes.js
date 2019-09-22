const dialogflow = require('dialogflow');
const config = require('../config/keys');
const sessionClient = new dialogflow.SessionsClient();
const sessionPath = sessionClient.sessionPath(config.googleProjectID, config.dialogFlowSessionID);


module.exports = app => {
    app.get('/', (req, res) => {
        res.send('test')
    });

    app.post('/api/test', async (req, res) => {
        // The text query request.
        const request = {
            session: sessionPath,
            queryInput: {
                text: {
                    // The query to send to the dialogflow agent
                    text: req.body.text,
                    // The language used by the client (en-US)
                    languageCode: config.dialogFlowSessionLanguageCode,
                },
            },
        };
        // Send request and log result
        // const responses = await sessionClient.detectIntent(request);
        // console.log('Detected intent');
        // const result = responses[0].queryResult;
        // console.log(`  Query: ${result.queryText}`);
        // console.log(`  Response: ${result.fulfillmentText}`);
        // if (result.intent) {
        //     console.log(`  Intent: ${result.intent.displayName}`);
        // } else {
        //     console.log(`  No intent matched.`);
        // }
        let responses = await  sessionClient
            .detectIntent(request);
        res.send(responses[0].queryResult);


    });
};