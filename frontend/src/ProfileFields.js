import React, { Component } from 'react';
import jQuery from 'jquery';
import $ from 'jquery';
import moment from 'moment/moment';
import EditEvent from './EditEvent';

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

export class Bio extends Component {
    constructor(props) {
    super(props);
    let fieldVal = this.props.val;
    var editing = false;
    if (fieldVal === null) {
        fieldVal = "";
        editing = true;
    }
    this.state = {
        editing: editing,
        val: fieldVal,
    };
  }

   valChange = (e) => {
        this.setState({
            val: e.target.value,
        })
   }

   saveProfileData (valName, val) {
   var csrftoken = getCookie('csrftoken');
    let _this = this;
    $.ajax({
        type: "POST",
        url: 'api/profile/',
        data: {data : JSON.stringify({"valName" : valName, "val": val, "id": _this.props.id}), csrfmiddlewaretoken: csrftoken},
        dataType: 'json',
        }).done(function(msg) {
        }).fail(function(msg) {
        });
    }

   OnClick = () => {
        this.setState({
          editing: !this.state.editing,
        });
        if (this.props.val !== this.state.val) {
           this.saveProfileData(this.props.name, this.state.val);
           this.props.updateUser();
        }
   }

    render () {
        if (this.state.editing) {
            return (
            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <div className="editProfileIcon row">
                    <label className="bioLabel">Crash Plan</label>
                    <span onClick={this.OnClick.bind(this)} className="editProfileItemCheck glyphicon glyphicon-ok"></span>
                </div>
                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12">
                        <textarea rows="5" className="form-control" name={this.props.name} placeholder={this.props.placeholder}
                        onChange={this.valChange} defaultValue={this.state.val}></textarea>
                    </div>
                </div>
            </div>
                );
        } else {
            return (
            <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                <div className="editProfileIcon row">
                    <label className="bioLabel">Bio</label>
                    <span onClick={this.OnClick.bind(this)} className="editProfileItemWheel glyphicon glyphicon-cog"></span>
                </div>
                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12">
                        <textarea rows="5" className="form-control" defaultValue={this.state.val} readOnly></textarea>
                    </div>
                </div>
            </div>
            );
        }
    }
}


export class Status extends Component {
    constructor(props) {
    super(props);
    let fieldVal = this.props.val;
    if (fieldVal === "") {
        fieldVal = "";
    }
    this.state = {
        editing: false,
        val: fieldVal,
    };
  }

   valChange = (e) => {
        this.setState({
            val: e.target.value,
        })
   }

   saveProfileData (valName, val) {
   var csrftoken = getCookie('csrftoken');
    let _this = this;
    $.ajax({
        type: "POST",
        url: 'api/profile/',
        data: {data : JSON.stringify({"valName" : valName, "val": val, "id": _this.props.id}), csrfmiddlewaretoken: csrftoken},
        dataType: 'json',
        }).done(function(msg) {
        }).fail(function(msg) {
        });
    }

   OnClick = () => {
        this.setState({
          editing: !this.state.editing,
        });
        if (this.props.val !== this.state.val) {
           this.saveProfileData(this.props.name, this.state.val);
           this.props.updateUser();
        }
   }

    render () {
        if (this.state.editing) {
            return (
            <div className="col-md-9 col-sm-9 col-xs-9">
                <div className="col-md-10 col-sm-8 col-xs-8">
                    <select className="form-control" name={this.props.name} placeholder={this.props.placeholder} onChange={this.valChange} defaultValue={this.state.val}>
                      <option>hosting</option>
                      <option>traveling</option>
                      <option>connecting</option>
                    </select>
                </div>
                <div className="editProfileIcon col-md-2 col-sm-1 col-xs-1">
                    <span onClick={this.OnClick.bind(this)} className="editProfileItemCheck glyphicon glyphicon-ok"></span>
                </div>
            </div>
                );
        } else {
            return (
            <div className="col-md-9">
                <div className="col-md-10 col-sm-8 col-xs-8">
                    <input className={(this.state.val === "" ? "warnField" : "") + " form-control"} defaultValue={this.state.val} readOnly/>
                </div>
                <div className="editProfileIcon col-md-2 col-sm-1 col-xs-1">
                    <span onClick={this.OnClick.bind(this)} className="editProfileItemWheel glyphicon glyphicon-cog"></span>
                </div>
            </div>
            );
        }
    }
}

export class EditField extends Component {
    constructor(props) {
    super(props);
    let fieldVal = this.props.val;
    if (fieldVal === "") {
        fieldVal = "";
    }
    this.state = {
        editing: false,
        val: fieldVal,
    };
  }

   valChange = (e) => {
        this.setState({
            val: e.target.value,
        })
   }

   saveProfileData (valName, val) {
   var csrftoken = getCookie('csrftoken');
    let _this = this;
    $.ajax({
        type: "POST",
        url: 'api/profile/',
        data: {data : JSON.stringify({"valName" : valName, "val": val, "id": _this.props.id}), csrfmiddlewaretoken: csrftoken},
        dataType: 'json',
        }).done(function(msg) {
        }).fail(function(msg) {
        });
    }

   OnClick = () => {
        if (this.props.name === "email") {
            var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
            if (!re.test(this.state.val)) {
            return <div>error</div>;
            }
        }
        this.setState({
          editing: !this.state.editing,
        });
        if (this.props.val !== this.state.val) {
           this.saveProfileData(this.props.name, this.state.val);
           this.props.updateUser();
        }
   }

    render () {
        if (this.state.editing) {
            return (
            <div className="col-md-9 col-sm-9 col-xs-9">
                <div className="col-md-10 col-sm-8 col-xs-8">
                    <input className="form-control" name={this.props.name} placeholder={this.props.placeholder} type={this.props.name === "email" ? "email" : "text"} onChange={this.valChange} defaultValue={this.state.val}/>
                </div>
                <div className="editProfileIcon col-md-2 col-sm-1 col-xs-1">
                    <span onClick={this.OnClick.bind(this)} className="editProfileItemCheck glyphicon glyphicon-ok"></span>
                </div>
            </div>
                );
        } else {
            return (
            <div className="col-md-9">
                <div className="col-md-10 col-sm-8 col-xs-8">
                    <input className={(this.state.val === "" ? "warnField" : "") + " form-control"} defaultValue={this.state.val} readOnly/>
                </div>
                <div className="editProfileIcon col-md-2 col-sm-1 col-xs-1">
                    <span onClick={this.OnClick.bind(this)} className="editProfileItemWheel glyphicon glyphicon-cog"></span>
                </div>
            </div>
            );
        }
    }
}

export class Event extends Component {
    constructor (props) {
        super(props);
        this.state = {
            edit: false,
            event: this.props.event,
        }
    }

    edit = () => {
        this.setState({edit: !this.state.edit});
    }

    updateEvent = (event) => {
        this.setState({event: event});
        this.props.getEvents;
    }

    respond(response) {
        if(response === true || response === false){
            const getEvents = this.props.getEvents;
            var csrftoken = getCookie('csrftoken');
            const eventId = this.state.event.id;
            const updateEvent = this.updateEvent;
            const userId = this.props.userId;
            $.ajax({
                type: "POST",
                url: 'api/edit_event/',
                data: {data : JSON.stringify({"eventId" : eventId, "userId": userId, "response": response}), csrfmiddlewaretoken: csrftoken},
                dataType: 'json',
            }).done(function(msg) {
                updateEvent(msg.msg);
                getEvents;
            }).fail(function(msg) {
            });
        }
    }

    render () {
        const e = this.state.event;
        var response = "noResponse";
        if(e.response == true) {
            response = "acceptedInvite";
        } else if (e.response == false) {
            response = "rejectedInvite";
        }
        var r = new RegExp('^(?:[a-z]+:)?//', 'i');
        return (
        <div>
          <div className="col-lg-1 col-md-1 col-sm-1 col-xs-1">
            <img className="eventFriendPic img-circle" src={((r.test(e.other_user.picture) ? (e.other_user.picture) : (require("./images/globe.png"))))} alt={require("./images/globe.png")} />
          </div>
          {e.creator_id !== e.other_user.user_id ?
          <div>
          {this.state.edit ? <EditEvent updateEvent={this.updateEvent} edit={this.edit} event={e}/> :
          <div>
          <div className="col-lg-10 col-md-10 col-sm-10 col-xs-10">
            <div className="dateDisplay h5"><span className={response} onClick={this.edit}>{moment(e.start_date).format("LL")} - {moment(e.end_date).format("LL")}</span></div>
          </div>
          </div>
          }
          </div>
          :
          <div>
            <div className="col-lg-10 col-md-10 col-sm-10 col-xs-10">
                <div className="dateDisplay h5"><span className={response}>{moment(e.start_date).format("LL")} - {moment(e.end_date).format("LL")}</span>
                    {this.props.userId ?
                    <div>
                    {e.response === null ?
                        <div>
                            <span onClick={() => this.respond(false)} className="rejectRequest glyphicon glyphicon-remove"></span>
                            <span onClick={() => this.respond(true)} className="acceptRequest glyphicon glyphicon-ok"></span>
                        </div>
                        : <div hidden="hidden"></div>
                    }
                    </div>
                    :
                    <div></div>}
                </div>
            </div>
          </div>
          }
        </div>
        );
    }
}


export class Events extends Component {

  render() {
    var inquiries;
    var events;
    var allEvents;
    try {
        allEvents = this.props.events.length;
    } catch (err) {
        allEvents = 0;
    }
    if (allEvents !== 0) {
        inquiries = this.props.events.inquiries.map((e) =>
                <div key={e.id} className="list-group-item row">
                    <Event userId={this.props.userId} getEvents={this.props.getEvents} event={e}/>
                </div>
                );

        events = this.props.events.events.map((e) =>
                <div key={e.id} className="list-group-item row">
                    <Event getEvents={this.props.getEvents} event={e}/>
                </div>
                );

    }
    if(typeof inquiries === 'object' && inquiries.length === 0) {
        inquiries = false;
    }
    if(typeof events === 'object' && events.length === 0) {
        events = false;
    }
    return (
        <div>
          <div className="col-md-12 col-sm-12 col-xs-12" id="eventsList">
            {inquiries ?
            <div>
                <label>
                    New Requests
                </label>
                {inquiries}
            </div>
            :
            <div className="noNewRequests">No New Requests</div>
            }
            {events ?
            <div>
                <label className="upcomingRequests">
                    Upcoming
                </label>
                {events}
            </div>
            :
            <div>
                <span hidden="hidden"></span>
            </div>
            }
          </div>
      </div>
    );
  }
}
