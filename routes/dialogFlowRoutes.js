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
        let responses = await  sessionClient
            .detectIntent(request);
        res.send(responses[0].queryResult);


    });
};