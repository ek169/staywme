/*global $*/
import React, { Component} from 'react';
import ReactDOM from 'react-dom';
import jQuery from 'jquery';
import moment from 'moment/moment';
import PickDate from './EventCreator';

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

class MessageList extends Component {

    clickHandler (chat) {
        var csrftoken = getCookie('csrftoken');
        const getChats = this.props.getChats;
        this.props.setFriendToMessage(chat.otherUser.user_id);
        if ((chat.new_message === true) && (chat.otherUser.user_id === chat.lastSenderId)) {
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
            <div key={chat.id} onClick={() => _this.clickHandler(chat)} className={(friend_to_message === chat.otherUser.user_id ? "activeFriend" : "") + " list-group-item chatPreview"}>
                <div className="row">
                    <div className="friendListItem col-md-3 col-sm-3">
                        <img className="picSize img-circle" src={((r.test(chat.otherUser.picture) ? (chat.otherUser.picture) : (require("./images/globe.png"))))} alt={require("./images/globe.png")}/>
                    </div>
                    <div className="friendListItem h4 col-md-7 col-sm-7">
                        <span>{chat.otherUser.name}</span>
                    </div>
                    <div className="h4 col-md-2 col-sm-2">
                        {(chat.lastSenderId === chat.otherUser.user_id) && (chat.new_message === true) ? <span className="newMessageIcon label label-pill label-primary">1</span> : ""}
                    </div>
                </div>
            </div>
        );
    } else {
        chatList = (
            <div className="list-group-item chatPreview">
                <div className="row">
                    <div>
                        Your chat list is empty
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div id="chatListArea" className="col-md-12 col-sm-12 col-xs-12">
            <div className="row">
                <div>
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
/*
    var archivedChats = [];
        var currentDate = moment();
        console.log(currentDate);
        for(var c = 0; c < chats.length; c++) {
            var chatAge = moment(chats[c].updated);
            var daysOld = currentDate.diff(chatAge, 'days');
            if(daysOld => 7) {
                archivedChats.push(chats.pop(c));
            }

        }*/


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
        var r = new RegExp('^(?:[a-z]+:)?//', 'i');
        const messageChange = this.props.messageChange;
        var friendData;
        var chatMessages;
        if (this.props.chat) {
             friendData = this.props.chat.otherUser;
             chatMessages = this.props.chat.messages.map((message) =>
                <div className={(this.props.friend === message.sender ? "him" : "me")} key={message.created}>
                    <div className="messageInfoHover">
                        <small className="messageDate">{moment(message.created).calendar()}</small>
                        <div>{message.message}</div>
                    </div>
                </div>
            );
        } else {
             friendData = this.props.friendData;
             chatMessages = <div className="message me">{"Your conversation will go here!"}</div>;
        }
        const messageArea = (
        <div>
            <div id="messageArea">
                <div className="row">
                    {((typeof friendData.name !== 'undefined') && (friendData.user_id > 0)) ?
                    <div>
                        <div id="chatFriendInfo"><img className="chatFriendPicSmall img-circle"
                        src={((r.test(friendData.picture) ? (friendData.picture)
                        : (require("./images/globe.png"))))} alt={require("./images/globe.png")}/>
                        {friendData.name}
                        </div>
                        <div className="requestCalendarDiv">
                        {this.props.createEvent ? <img onClick={this.props.toggleCreateEvent} className="requestCalendar"
                        src={require("./images/calendarminus.png")} alt={require("./images/globe.png")}/> :
                        <img onClick={this.props.toggleCreateEvent} className="requestCalendar"
                        src={require("./images/calendarplus.png")} alt={require("./images/globe.png")}/>}
                        </div>

                    </div> : <div hidden="hidden"></div>}
                </div>
                <div className="row">
                    <div id="messageList" className="well">
                        {chatMessages}
                        <div id="bottomOfChatRef" ref="bottom">
                        </div>
                    </div>
                </div>
            </div>
            <div>
                <div className="row">
                    <div id="messenger" className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="input-group col-md-12 col-sm-12 col-xs-12 has-feedback">
                            <textarea ref="msgBox" placeholder="type your message in here" className="form-control" id="message" rows="1" defaultValue={this.props.message} onKeyUp={messageChange.bind(_this)}></textarea>
                            <a href="#"><i className="glyphicon glyphicon-send form-control-feedback"></i></a>
                            <button className="btn-block sendButton form-control col-xs-12" onClick={this.submitHandler}>Send</button>
                        </div>
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

function toggleEvent(oldCreateEvent) {
    return {createEvent: !oldCreateEvent};
}

class Messenger extends Component {

    constructor () {
        super();
        this.state = {
            chats: [],
            createEvent: false,
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

    toggleCreateEvent () {
        this.setState(toggleEvent(this.state.createEvent));
    }

    getChats = () =>  {
        let _this = this;
        var csrftoken = getCookie('csrftoken');
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

    generateRequest = (e, message) => {
        this.props.messageChangeToEvent(e, message);
        this.getChats();
    }

    showChat (chats, friend_to_message_id, user_id) {
        var friend_num_id = new Number(friend_to_message_id);
        var friend_string_id = friend_num_id.toString();
        var user_num_id = new Number(user_id);
        var user_string_id = user_num_id.toString();
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
        const friendData = this.props.friendData;
        const setFriendToMessage = this.props.setFriendToMessage;
        const user_id = this.props.uid;
        var theChat = this.showChat(chats, friend_to_message, user_id);
        const message = this.props.message;
        const messageChange = this.props.messageChange;
        const generateRequest = this.generateRequest;
        const pThis = this.props.pThis;
        const sendMessage = this.props.sendMessage;
        const createEvent = this.state.createEvent;
        const createRequest = this.createRequest;
        const toggleCreateEvent = this.toggleCreateEvent;
        return (
            <div id="messengerContainer" className="row">
                <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                    <div className="row">
                        <Chat friend_to_message={friend_to_message} createEvent={createEvent} toggleCreateEvent={toggleCreateEvent.bind(this)} friendData={friendData} chat={theChat} getChats={getChats} sendMessage={sendMessage} pThis={pThis} message={message} messageChange={messageChange}/>
                    </div>
                </div>
                <div id="chatList" className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                    {createEvent ? <PickDate friendId={friend_to_message} chat={theChat} userId={user_id} sendMessage={sendMessage} generateRequest={generateRequest} toggleCreateEvent={toggleCreateEvent.bind(this)}/> : <MessageList setFriendToMessage={setFriendToMessage} getChats={getChats} friend_to_message={friend_to_message} chats={chats}/>}
                </div>
            </div>
        );
    }
 }

export default Messenger;