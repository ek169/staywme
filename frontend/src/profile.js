import React, { Component } from 'react';
import jQuery from 'jquery';
import $ from 'jquery';
import moment from 'moment/moment';
import EditEvent from './EditEvent';
import {Bio, Status, EditField, Event, Events } from './ProfileFields';

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

function toggleProfile(state){
    return {showProfile: !state.showProfile};
}

class Profile extends Component {

    constructor () {
        super();
        this.state = {
            showProfile: false,
            events: []
        };
    }

    componentDidMount () {
        this.getEvents();
    }

    toggleProfile = () => {
        const state = this.state;
        this.setState(toggleProfile(state));
    }

    getEvents = () => {
        var csrftoken = getCookie('csrftoken');
        let _this = this;
        const userId = this.props.user.user_id;
        $.ajax({
            type: "GET",
            url: 'api/event/',
            data: {data : JSON.stringify({"userId" : userId}), csrfmiddlewaretoken: csrftoken},
            dataType: 'json',
        }).done(function(msg) {
                _this.setState({events: msg.msg});
        }).fail(function(msg) {
        });
  }

    render () {
        const user = this.props.user;
        const profileItems = (<div><div className="form-group row">
                                <label className="profileLabel col-md-3 col-sm-3 col-xs-3 col-form-label">Location</label>
                                <EditField name="location" updateUser={this.props.updateUser} val={user.location} placeholder="My location is..." id={user.user_id}/>
                            </div>
                            <div className="form-group row">
                                <label className="profileLabel col-md-3 col-sm-3 col-xs-3 col-form-label">Email</label>
                                <EditField name="email" updateUser={this.props.updateUser} val={user.email} placeholder="My email is..." id={user.user_id}/>
                            </div>
                            <div className="form-group row">
                                <label className="profileLabel col-md-3 col-sm-3 col-xs-3 col-form-label">Currently</label>
                                <Status updateUser={this.props.updateUser} name="status" placeholder="willing to host / traveling" val={user.status} id={user.user_id} />
                            </div></div>);

        if (user.user_id) {
            return (
                <div id="profileArea" className="well col-md-12 col-sm-12 col-xs-12">
                    <div className="row">
                        <div className="col-lg-8 col-md-8 col-sm-8 col-xs-12" key={user.email}>
                            <div className="form-group row">
                                <div className="form-group col-lg-2 col-md-2 col-sm-2 col-xs-2">
                                    <img className="img-circle" src={user.picture} alt={require("./images/globe.png")}/>
                                </div>
                                <div id="profileName" className="form-group col-lg-8 col-md-8 col-sm-8 col-xs-8">
                                    <span>{user.name}</span>
                                    {this.state.showProfile ?
                                    <img onClick={this.toggleProfile} className="profileCalendarIcon"
                                    src={require("./images/calendarplus.png")} alt={require("./images/globe.png")}/>
                                    :
                                    <img onClick={this.toggleProfile} className="profileCalendarIcon"
                                    src={require("./images/calendarminus.png")} alt={require("./images/globe.png")}/>
                                    }
                                </div>
                            </div>
                            {this.state.showProfile ? profileItems : <Events getEvent={this.getEvents} userId={user.user_id} events={this.state.events}/>}
                            <div className="form-group row">
                                <button onClick={this.props.logOut.bind(this)} className="sendButton"><i className="fa fa-facebook left fbSizeSM"></i> Log Out</button>
                            </div>
                        </div>
                        <div className="col-lg-4 col-md-4 col-sm-4 hidden-xs">
                            <div id="announcementOnProfile">
                                <small>Message us @ dev.staywme@gmail.com</small>
                            </div>
                            <div className="row">
                                <div className="col-lg-12 col-md-12 col-sm-12">
                                    <Bio name="bio" updateUser={this.props.updateUser} val={user.bio} placeholder="If someone is crashing for just one night..what would the ideal plan be?" id={user.user_id}/>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            );
        } else {
            return null;
        }


    }
}

export default Profile;