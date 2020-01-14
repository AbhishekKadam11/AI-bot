const chatbot = require('../chatbot/chatbot');


module.exports = app => {
    app.get('/', (req, res) => {
        res.send('test')
    });

    app.post('/api/textQuery', async (req, res) => {
        try {
            let responses = await chatbot.textQuery(req.body.text, req.body.userId, req.body.parameters);
            //  console.log(JSON.stringify(responses));
            res.send(responses[0].queryResult);
        } catch (e) {
            console.log(e)
        }
    });

    app.post('/api/textEvent', async (req, res) => {
            let responses = await chatbot.textEvent(req.body.event, req.body.userId, req.body.parameters);
            res.send(responses[0].queryResult);
    });

};