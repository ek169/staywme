/*global $*/
import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import jQuery from 'jquery';
import moment from 'moment/moment';

function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

var csrftoken = getCookie('csrftoken');


class MessageList extends Component {

    clickHandler (chat) {
        const getChats = this.props.getChats;
        this.props.setFriendToMessage(chat.otherUserId);
        if ((chat.new_message === true) && (chat.otherUserId === chat.lastSenderId)) {
            $.ajax({
                type: "POST",
                url: 'api/viewed/',
                data: {data : JSON.stringify({"chat_id" : chat.id}), csrfmiddlewaretoken: csrftoken},
                dataType: 'json',
            }).done(function(msg) {
                getChats();
            }).fail(function(msg) {
            });
        }
    }

    render () {
    var r = new RegExp('^(?:[a-z]+:)?//', 'i');
    let _this = this;
    var chatList;
    const friend_to_message = this.props.friend_to_message;
    if (this.props.chats.length > 0) {
        chatList = this.props.chats.map((chat) =>
            <div key={chat.id} onClick={() => _this.clickHandler(chat)} className={(friend_to_message === chat.otherUserId ? "activeFriend" : "") + " list-group-item chatPreview"}>
                <div className="row">
                    <div className="col-md-3 col-sm-3">
                        <img className="friendListItem img-circle" src={((r.test(chat.otherUserPic) ? (chat.otherUserPic) : (require("./images/globe.png"))))} alt={require("./images/globe.png")}/>
                    </div>
                    <div className="h4 col-md-7 col-sm-7">
                        <span>{chat.otherUser}</span>
                    </div>
                    <div className="h4 col-md-2 col-sm-2">
                        {(chat.lastSenderId === chat.otherUserId) && (chat.new_message === true) ? <span className="newMessageIcon label label-pill label-primary">1</span> : ""}
                    </div>
                </div>
            </div>
        );
    } else {
        chatList = (
            <div className="list-group-item chatPreview">
                <div className="row">
                    <div className="col-md-12 col-sm-12">
                        Your chat list is empty
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div id="chatListArea" className="col-sm-12">
            <div className="row">
                <div className="col-md-12 col-sm-12">
                    <div className="list-group">
                        {chatList}
                    </div>
                </div>
           </div>
        </div>
        );
    }
}

class Chat extends Component {

    submitHandler = (e) => {
        this.props.sendMessage(e);
        this.props.getChats();
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.message === " ") {
            ReactDOM.findDOMNode(this.refs.msgBox).value = "";
        }
        this.refs.bottom.scrollIntoView(false);
    }

   render () {
        let _this = this;
        const sendMessage = this.props.sendMessage;
        const messageChange = this.props.messageChange;
        var chatMessages;
        if (this.props.chat) {
             chatMessages = this.props.chat.messages.map((message) =>
                <div className={(this.props.friend_to_message === message.sender ? "him" : "me")} key={message.created}>
                    <div>
                        <small>{moment(message.created).calendar()}</small>
                        <div className="messageText">{message.message}</div>
                    </div>
                </div>
            );
        } else {
             chatMessages = <div className="message me">{"You will send and receive messages in here!"}</div>;
        }
        const messageArea = (
        <div id="messageArea">
            <div className="row">
                <div id="messageList" className="well col-sm-12">
                    {chatMessages}
                    <div id="bottomOfChatRef" ref="bottom"></div>
                </div>
            </div>
            <div className="row">
                <div id="messenger" className="col-sm-12">
                    <div className="input-group col-sm-12 has-feedback">
                        <textarea ref="msgBox" className="form-control" id="message" rows="1" defaultValue={_this.props.message} onKeyUp={messageChange.bind(_this)}></textarea>
                        <a href="#"><i className="glyphicon glyphicon-send form-control-feedback"></i></a>
                        <button className="btn-block sendButton" onClick={this.submitHandler}>Send</button>
                    </div>
                </div>
            </div>
        </div>
        );

        return (
            <div>
                {messageArea}
            </div>
        );
    }

}

class Messenger extends Component {

    constructor () {
        super();
        this.state = {
            chats: [],
        };
    }

    componentDidMount () {
        this.getChats();
    }

    componentWillReceiveProps (nextProps) {
        if (nextProps.uid > 0) {
            this.getChats();
        }
    }


    getChats = () =>  {
        let _this = this;
        if (this.props.uid > 0) {
            $.ajax({
                type: "GET",
                url: 'api/allchats/',
                data: {data : JSON.stringify({"uid" : this.props.uid}), csrfmiddlewaretoken: csrftoken},
                dataType: 'json',
            }).done(function(msg) {
                if (msg.chats.length > 0) {
                    _this.setState({
                        chats: msg.chats
                    });
                }
            }).fail(function(msg) {
            });
        }
    }

    showChat (chats, friend_to_message_id, user_id) {
        var friend_num_id = new Number(friend_to_message_id);
        var friend_string_id = friend_num_id.toString();
        var user_num_id = new Number(user_id);
        var user_string_id = user_num_id.toString()
        var chat_id;
        if (user_num_id < friend_num_id) {
            chat_id = user_string_id + friend_string_id;
        } else {
            chat_id = friend_string_id + user_string_id;
        }
        for (var c = 0; c < chats.length; c++) {
            if(chats[c].id === chat_id) {
                return chats[c];
            }
        }
        return;
    }

    render () {
        const chats = this.state.chats;
        const getChats = this.getChats;
        const friend_to_message = this.props.friend_to_message;
        const setFriendToMessage = this.props.setFriendToMessage;
        const user_id = this.props.uid;
        var theChat = this.showChat(chats, friend_to_message, user_id);
        const message = this.props.message;
        const messageChange = this.props.messageChange;
        const pThis = this.props.pThis;
        const sendMessage = this.props.sendMessage;
        return (
            <div id="messengerContainer" className="row">
                <div className="col-md-6 col-sm-6">
                    <Chat friend_to_message={friend_to_message} chat={theChat} getChats={getChats} sendMessage={sendMessage} pThis={pThis} message={message} messageChange={messageChange}/>
                </div>
                <div id="chatList" className="col-md-6 col-sm-6">
                    <MessageList setFriendToMessage={setFriendToMessage} getChats={getChats} friend_to_message={friend_to_message} chats={chats}/>
                </div>
            </div>
        );
    }
 }


export default Messenger;