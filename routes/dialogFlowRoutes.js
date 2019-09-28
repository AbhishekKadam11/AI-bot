const chatbot = require('../chatbot/chatbot');


module.exports = app => {
    app.get('/', (req, res) => {
        res.send('test')
    });

    app.post('/api/test', async (req, res) => {
        let responses = await chatbot.textQuery(req.body.text, req.body.parameters);
        res.send(responses[0].queryResult);
    });
};