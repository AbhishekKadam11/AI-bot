"use strict";
const dialogflow = require('dialogflow');
const structjson = require('./structjson');
const config = require('../config/keys');

const projectID = config.googleProjectID;
const credentials = {
    client_email: config.googleClientEmail,
    private_key: config.googlePrivateKey
};
const sessionClient = new dialogflow.SessionsClient({projectID, credentials});

const Registration = mongoose.model('registration');

module.exports = {
    textQuery: async function(text, userId, parameters = {}) {
        let sessionPath = sessionClient.sessionPath(config.googleProjectID, config.dialogFlowSessionID + userId);
        let self = module.exports;
        // The text query request.
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
                .detectIntent(request);
            responses = await self.handleAction(responses);
            return responses;
    },
    textEvent: async function(event, userId, parameters = {}) {
        let sessionPath = sessionClient.sessionPath(config.googleProjectID, config.dialogFlowSessionID + userId);
        let self = module.exports;
        const request = {
            session: sessionPath,
            queryInput: {
                event: {
                    // The query to send to the dialogflow agent
                    name: event,
                    parameters: structjson.jsonToStructProto(parameters),
                    // The language used by the client (en-US)
                    languageCode: config.dialogFlowSessionLanguageCode,
                },
            },
        };
        // Send request and log result
        let responses = await sessionClient
            .detectIntent(request);
        responses = await self.handleAction(responses);
        return responses;
    },
    handleAction: function(responses) {
        let self = module.exports;
        let queryResult = responses[0].queryResult;
        switch (queryResult.action) {
            case 'recommend-yes':
                if(queryResult.allRequiredParamsPresent){
                    self.saveRegistration(queryResult.parameter.fields);
                }
                break;
        }
        return responses;
    },

    saveRegistration: async function (fields) {
        const registration = new Registration({
            name: fields.name.stringValue,
            address: fields.address.stringValue,
            phone: fields.phone.stringValue,
            email: fields.email.stringValue,
            dateSent: Date.now()
        });
        try {
            let req = await registration.save();
        }catch (e) {
            console.log(e);
        }
    }
};