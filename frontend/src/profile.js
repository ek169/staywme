import React, { Component } from 'react';
import jQuery from 'jquery';
import $ from 'jquery';

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


$.ajaxSetup({
    headers: {"X-CSRFToken": csrftoken}
 });

class EditField extends Component {
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
    this.OnClick = this.OnClick
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
            console.log(msg.msg);
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
            <div className="col-md-9">
                <div className="col-md-10">
                    <input className="form-control" name={this.props.name} placeholder={"My " + this.props.name + " is..."} type={this.props.name === "email" ? "email" : "text"} onChange={this.valChange} defaultValue={this.state.val}/>
                </div>
                <div className="editProfileIcon col-md-2">
                    <span onClick={this.OnClick.bind(this)} className="glyphicon glyphicon-ok"></span>
                </div>
            </div>
                );
        } else {
            return (
            <div className="col-md-9">
                <div className="col-md-10">
                    <input className="form-control" defaultValue={this.state.val} readOnly/>
                </div>
                <div className="editProfileIcon col-md-2">
                    <span onClick={this.OnClick.bind(this)} className="glyphicon glyphicon-cog"></span>
                </div>
            </div>
            );
        }
    }
}


class Profile extends Component {
    render () {
        const user = this.props.user;
        if (user.user_id) {
            return (
                <div id="profileArea" className="row well">
                    <div className="col-md-8 col-sm-8" key={user.email}>
                        <div className="form-group row">
                            <div className="form-group col-md-2">
                                <img className="img-circle" src={user.picture} alt={require("./images/globe.png")}/>
                            </div>
                            <div id="profileName" className="form-group col-md-8">
                                <span >{user.name}</span>
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="profileLabel col-md-3 col-form-label">Location</label>
                            <EditField name="location" updateUser={this.props.updateUser} val={user.location} id={user.user_id}/>
                        </div>
                        <div className="form-group row">
                            <label className="profileLabel col-md-3 col-form-label">Email</label>
                            <EditField name="email" updateUser={this.props.updateUser} val={user.email} id={user.user_id}/>
                        </div>
                        <div className="form-group row">
                            <button onClick={this.props.logOut.bind(this)} className="sendButton"><i className="fa fa-facebook left fbSizeSM"></i> Log Out</button>
                        </div>
                    </div>
                    <div className="col-md-4 col-sm-4">
                        <div id="announcementOnProfile">
                            <div className="h4"> Hey There! </div>
                            <small>Want any new features? Let us know @ dev.staywme@gmail.com</small>
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