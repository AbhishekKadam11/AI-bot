import React, {Component} from 'react';
import axios from 'axios/index';
import Cookies from 'universal-cookie';
import { v4 as uuid } from 'uuid';
import Message from './Message';
import Card from "./Card";

const cookies = new Cookies();

class Chatbot extends Component {
    messagesEnd;
    talkInput;
    constructor(props){
        super(props);
        this.handleInputKeyPress = this.handleInputKeyPress.bind(this);
        this.state= {
            messages: []
        };
        if(cookies.get('userId') === undefined) {
            cookies.set('userId', uuid(), {path:'/'});
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
        const res = await axios.post('/api/textQuery', {text: text, userId: cookies.get('userId')});
       // console.log(res);
        for(let msg of res.data.fulfillmentMessages) {
             says = {
                speaks: 'AI-Bot',
                msg: msg
            };
            this.setState({messages: [...this.state.messages, says]});
        }

    }

    async eventQuery(event) {
        const res = await axios.post('/api/textEvent', {event:event, userId: cookies.get('userId')});
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
       // this.talkInput.focus();
    }

    renderCards(cards) {
        //console.log(cards);
        return cards.map((card, i) => <Card key={i} payload={card.structValue} />)
    }

    renderOneMessage(message, i) {
        //console.log(message.msg);
        if(message.msg && message.msg.text && message.msg.text.text) {
            return <Message key={i} speaks={message.speaks} text={message.msg.text.text} />;
        } else if (message.msg && message.msg.payload && message.msg.payload.fields &&
          message.msg.payload.fields.cards) {
            console.log(message.msg.payload.fields.cards.listValue.values.length);
            return <div key={i}>
                <div className="card-panel grey lighten-5 z-depth-1">
                    <div style={{overflow: 'hidden'}}>
                        <div className="col s2">
                            <a className="btn-floating btn-large waves-effect waves-light red">
                                {message.speaks} </a>
                        </div>

                        <div style={{overflow: 'auto', overflowY: 'inherit'}}>
                            <div style={{height: 300, width: message.msg.payload.fields.cards.listValue.values.length * 270 }}>
                                {this.renderCards(message.msg.payload.fields.cards.listValue.values)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        }
    }

    renderMessages(stateMessages) {
        if(stateMessages) {
            return stateMessages.map((message,i) =>{
               return this.renderOneMessage(message, i);
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
            <div style={{height: 500, width: 400, position: 'absolute', bottom: 0, right: 0, border: '1px solid lightgrey'}}>
                <nav>
                    <div className="nav-wrapper">
                        <a className="brand-logo">Chatbot</a>
                    </div>
                </nav>
                <div id='chatbot' style={{height: 388, width: '100%', overflow: 'auto'}}>
                    {this.renderMessages(this.state.messages)}
                    <div ref={(el) => {this.messagesEnd = el;}}
                        style={{float: "left", clear: "both"}}>
                    </div>
                </div>
                <div className="col s12">
                    <input style={{margin: 0, paddingLeft: '1%', paddingRight: '1%', width: '98%'}}
                           placeholder="Type a message"
                           type="text" onKeyPress={this.handleInputKeyPress}/>
                </div>
            </div>
        )
    }
}

export default Chatbot;