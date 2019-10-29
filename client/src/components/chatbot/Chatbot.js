import React, {Component} from 'react';
import axios from 'axios/index';

import Message from './Message';

class Chatbot extends Component {
    messagesEnd;
    constructor(props){
        super(props);
        this.handleInputKeyPress = this.handleInputKeyPress.bind(this);
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
                speaks: 'AI-Bot',
                msg: msg
            };
            this.setState({messages: [...this.state.messages, says]});
        }

    }

    async eventQuery(event) {
        const res = await axios.post('/api/textEvent', {event});
        for(let msg of res.data.fulfillmentMessages) {
          let says = {
                speaks: 'AI-Bot',
                msg: msg
            };
            this.setState({messages: [...this.state.messages, says]});
        }
    }

    componentDidMount() {
        this.eventQuery('Welcome');
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.messagesEnd.scrollIntoView({_behaviour: "smooth"})
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

    handleInputKeyPress(e) {
        if (e.key === 'Enter') {
            this.textQuery(e.target.value);
            e.target.value = '';
        }
    }

    render() {
        return (
            <div style={{height: 400, width: 400, float: 'right'}}>
                <div id='chatbot' style={{height: '100%', width: '100%', overflow: 'auto'}}>
                    <h2>chatbot</h2>
                    {this.renderMessages(this.state.messages)}
                    <div ref={(el) => {this.messagesEnd = el;}}
                        style={{float: "left", clear: "both"}}>
                    </div>
                    <input type="text" onKeyPress={this.handleInputKeyPress}/>
                </div>
            </div>
        )
    }
}

export default Chatbot;