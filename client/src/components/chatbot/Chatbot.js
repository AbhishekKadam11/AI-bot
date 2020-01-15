import React, {Component} from 'react';
import axios from 'axios/index';
import { withRouter } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { v4 as uuid } from 'uuid';
import Message from './Message';
import Card from "./Card";
import QuickReplies from './QuickReplies';

const cookies = new Cookies();

class Chatbot extends Component {
    messagesEnd;
    talkInput;
    constructor(props){
        super(props);
        this.hide = this.hide.bind(this);
        this.show = this.show.bind(this);
        this.handleQuickRepliePayload = this.handleQuickRepliePayload.bind(this);
        this.handleInputKeyPress = this.handleInputKeyPress.bind(this);
        this.state= {
            messages: [],
            showBot: true,
            shopWelcomeSent: false
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

    resolveAfterXSecond(x) {
        return new Promise(resolve => {
            setTimeout(()=> {
               resolve(x);
            },1000);
        });
    }

    async componentDidMount() {
        this.eventQuery('Welcome');

        if (window.location.pathname === '/Shop' && !this.state.shopWelcomeSent) {
            await this.resolveAfterXSecond(1);
            this.eventQuery('WELCOME_SHOP');
            this.setState({shopWelcomeSent: true, showBot: true});
        }

        this.props.history.listen(() => {
           // console.log("test");
            if (this.props.history.location.pathname === '/Shop' && !this.state.shopWelcomeSent) {
                this.eventQuery('WELCOME_SHOP');
                this.setState({shopWelcomeSent: true, showBot: true});
            }
        })
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.messagesEnd.scrollIntoView({_behaviour: "smooth"});
        if (this.talkInput) {
            this.talkInput.focus();
        }

    }

    show() {
        this.setState({showBot: true});
    }

    hide() {
        this.setState({showBot: false});
    }

    handleQuickRepliePayload(payload, text) {
        switch (payload) {
            case  'recommended_yes':
                this.eventQuery('SHOW_RECOMMENDATIONS');
                break;
            case 'see_new' :
                this.eventQuery('SEE_NEW');
                break;
            default:
                this.textQuery(text);
                break;
        }

    }

    renderCards(cards) {
        //console.log(cards);
        return cards.map((card, i) => <Card key={i} payload={card.structValue} />)
    }

    renderOneMessage(message, i) {
        if(message.msg && message.msg.text && message.msg.text.text) {
            return <Message key={i} speaks={message.speaks} text={message.msg.text.text} />;
        } else if (message.msg && message.msg.payload && message.msg.payload.fields &&
          message.msg.payload.fields.cards) {
            return <div key={i}>
                <div className="card-panel grey lighten-5 z-depth-1">
                    <div style={{overflow: 'hidden'}}>
                        <div className="col s2">
                            <a className="btn-floating btn-large waves-effect waves-light red">
                                {message.speaks} </a>
                        </div>

                        <div style={{overflow: 'auto', overflowY: 'auto'}}>
                            <div style={{height: 300, width: message.msg.payload.fields.cards.listValue.values.length * 270 }}>
                                {this.renderCards(message.msg.payload.fields.cards.listValue.values)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        } else if (
            message.msg &&
            message.msg.payload &&
            message.msg.payload.fields &&
            message.msg.payload.fields.quick_replies
        ) {
            return <QuickReplies
            text ={message.msg.payload.fields.text ? message.msg.payload.fields.text : null}
            key={i}
            replyClick={this.handleQuickRepliePayload}
            speaks={message.speaks}
            payload={message.msg.payload.fields.quick_replies.listValue.values}
            />
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
        if (this.state.showBot) {
            return (
                <div style={{height: 500, width: 400, position: 'absolute', bottom: 0, right: 0, border: '1px solid lightgrey'}}>
                    <nav>
                        <div className="nav-wrapper">
                            <a className="brand-logo">Chatbot</a>
                            <ul id="nav-mobile" className="right hide-on-med-and-down">
                                <li>
                                    <a onClick={this.hide}> Close</a>
                                </li>
                            </ul>
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
        } else {
            return (
                <div style={{height: 40, width: 400, position: 'absolute', bottom: 0, right: 0, border: '1px solid lightgrey'}}>
                    <nav>
                        <div className="nav-wrapper">
                            <a className="brand-logo">Chatbot</a>
                            <ul id="nav-mobile" className="right hide-on-med-and-down">
                                <li>
                                    <a onClick={this.show}> Show</a>
                                </li>
                            </ul>
                        </div>
                    </nav>
                    <div ref={(el) => {this.messagesEnd = el;}}
                         style={{float: "left", clear: "both"}}>
                    </div>
                </div>
            )
        }

    }
}

export default withRouter(Chatbot);