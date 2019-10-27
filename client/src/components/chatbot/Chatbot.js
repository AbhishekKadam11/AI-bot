import React, {Component} from 'react';
import axios from 'axios/index';

import Message from './Message';

class Chatbot extends Component {
    constructor(props){
        super(props);
        this.state= {
            messages: []
        }
    }

    async textQuery(text) {
        let says = {
            speaks: 'me',
            msg: {
                text: {
                    text: text
                }
            }
        };
        this.setState({messages: [...this.state.messages, says]});
        const res = await axios.post('/api/textQuery', {text})
        for(let msg of res.data.fulfillmentMessages) {
             says = {
                speaks: 'bot',
                msg: msg
            };
            this.setState({messages: [...this.state.messages, says]});
        }

    }

    async eventQuery(event) {
        const res = await axios.post('/api/textEvent', {event});
        console.log(res);
        for(let msg of res.data.fulfillmentMessages) {
          let says = {
                speaks: 'me',
                msg: msg
            };
            this.setState({messages: [...this.state.messages, says]});
        }
    }

    componentDidMount() {
        this.eventQuery('Welcome');
    }

    renderMessages(stateMessages) {
        if(stateMessages) {
            return stateMessages.map((message,i) =>{
                return <Message key={i} speaks={message.speaks} text={message.msg.text.text} />;
            });
        } else {
            return null;
        }
    }

    render() {
        return (
            <div style={{height: 400, width: 400, float: 'right'}}>
                <div id='chatbot' style={{height: '100%', width: '100%', overflow: 'auto'}}>
                    <h2>chatbot</h2>
                    {this.renderMessages(this.state.messages)}
                    <input type="text"/>
                </div>
            </div>
        )
    }
}

export default Chatbot;