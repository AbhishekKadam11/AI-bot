"use strict";
const dialogflow = require('dialogflow');
const config = require('../config/keys');

const projectID = config.googleProjectID;
const credentails = {
    client_email: config.googleClientEmail,
    private_key: config.googlePrivateKey
};
const sessionClient = new dialogflow.SessionsClient({projectID, credentails});
const sessionPath = sessionClient.sessionPath(config.googleProjectID, config.dialogFlowSessionID);

module.exports = {
    textQuery: async function(text, parameters = {}) {
        let self = module.exports;
        // The text query request.
        // try{
            const request = {
                session: sessionPath,
                queryInput: {
                    text: {
                        // The query to send to the dialogflow agent
                        text: text,
                        // The language used by the client (en-US)
                        languageCode: config.dialogFlowSessionLanguageCode,
                    },
                },
                queryParams: {
                    payload: {
                        data: parameters
                    }
                }
            };
            // Send request and log result
            let responses = await sessionClient
                .detectIntent(request)
            ;
            responses = await self.handleAction(responses);
            // res.send(responses[0].queryResult);
            return responses;
        // } catch (e) {
        //     console.log(JSON.stringify(e));
        // }

    },

    handleAction: function(responses) {
        return responses;
    }
};