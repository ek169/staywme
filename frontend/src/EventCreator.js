/*global $*/
import React, { Component} from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import jQuery from 'jquery';
import 'react-datepicker/dist/react-datepicker.css';

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

function makeChatId (friend_to_message_id, user_id) {
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
    return chat_id;
}

function errorOccurred() {
    return ({error: true});
}

function showRequest(state) {
    return ({showRequest: !state.showRequest});
}

class PickDate extends Component {
  constructor (props) {
    super(props);
    this.state = {
      startDate: moment(),
      endDate: moment(),
      error: false,
      showRequest: false,
      localMessage: "",
    };
  }

  handleChangeStart = (date) => {
    var endDate = this.state.endDate;
    if(date > endDate) {
        endDate = date;
    }
    this.setState({
      startDate: date,
      endDate: endDate
    });
  }

  handleChangeEnd = (date) => {
    this.setState({
      endDate: date
    });
  }

  changeShowRequest = () => {
    if(!this.state.showRequest) {
        this.setState({localMessage:this.refs.message.value});
    }
    this.setState(showRequest(this.state));

  }

  sendRequest = (e) => {
    if(this.state.startDate && this.state.endDate) {
        const message = this.state.localMessage;
        const startDate = this.state.startDate.format("YYYY-MM-DD");
        const endDate = this.state.endDate.format("YYYY-MM-DD");
        const newMessage = "Event Date: " + this.state.startDate.format('l') + " - " + this.state.endDate.format('l') + " |  "   +  "Message: " + message;
        this.props.generateRequest(e, newMessage);
        const friendId = this.props.friendId;
        const userId = this.props.userId;
        var chatId;
        var chatExists;
        try {
            chatExists = this.props.chat.id;
        } catch (err) {
            chatExists = false;
        }
        if(chatExists){
            chatId = makeChatId(friendId, userId);
        } else {
            chatId = this.props.chat.id;
        }
        var csrftoken = getCookie('csrftoken');
        $.ajax({
                type: "POST",
                url: 'api/event/',
                data: {data : JSON.stringify({"chatId" : chatId, "otherUserId": friendId,
                "userId": userId, "startDate": startDate, "endDate": endDate }), csrfmiddlewaretoken: csrftoken},
                dataType: 'json',
            }).done(function(msg) {
            }).fail(function(msg) {
            });
        this.props.toggleCreateEvent();
    }
  }

  createRequest = () => {
    if(this.state.startDate && this.state.endDate) {
        this.changeShowRequest();
    } else {
        this.setState(errorOccurred());
    }
  }

  render() {
    return (
    <div className="eventRequestDiv">
        {this.state.showRequest ?
        <div>
            <div className="row form-group">
                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div id="eventMessageDate" className="h5">{this.state.startDate.format('l')} - {this.state.endDate.format('l')}</div>
                    </div>
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="eventMessageText">{this.state.localMessage}</div>
                    </div>
                </div>
            </div>
            <div className="row">
                <button onClick={this.sendRequest} className="sendButton">
                    Send Request
                </button>
            </div>
        </div>
        :
        <div>
            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <div className="row form-group">
                    <div className="row">
                        <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                            <label className="requestLabel col-form-label">Start</label>
                            <span className="glyphicon glyphicon-calendar"></span>
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                            <label className="requestLabel col-form-label">End</label>
                            <span className="glyphicon glyphicon-calendar"></span>
                        </div>
                    </div>
                    <div className="row">
                        <div className="DatePicker col-lg-6 col-md-6 col-sm-6 col-xs-6">
                            <DatePicker
                                selected={this.state.startDate}
                                selectsStart
                                startDate={this.state.startDate}
                                minDate={moment()}
                                endDate={this.state.endDate}
                                onChange={this.handleChangeStart}
                                className={"form-control"}
                             />
                         </div>
                         <div className="DatePicker col-lg-6 col-md-6 col-sm-6 col-xs-6">
                             <DatePicker
                                selected={this.state.endDate}
                                selectsEnd
                                minDate={moment()}
                                startDate={this.state.startDate}
                                endDate={this.state.endDate}
                                onChange={this.handleChangeEnd}
                                className={"form-control"}
                            />
                        </div>
                    </div>
                </div>
                <div className="createEventDiv col-xs-12 row form-group">
                    <div className="row">
                        <label className="requestLabel col-form-label">Message</label>
                    </div>
                    <div className="row">
                        <textarea ref="message" defaultValue={this.state.localMessage} placeholder="please include a message with your request" className="form-control" rows="3"></textarea>
                    </div>
                </div>
                <div className="row">
                    <button onClick={this.createRequest} className="sendButton">
                        Create Request
                    </button>
                </div>
                {
                this.state.error ?
                    <div className="row error">
                        You must include a start and end state
                    </div>
                    :
                    <div hidden="hidden"></div>
                 }
            </div>
        </div>
        }
     </div>

    );
  }
}

export default PickDate;