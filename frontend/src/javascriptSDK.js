/*global FB*/
import $ from 'jquery';
import jQuery from 'jquery';
import React, { Component } from 'react';
import Profile from './profile';
import Messenger from './Messenger';
import Preview from './Preview';
import Map from './Map';
import { Link, Redirect, Route, Switch } from 'react-router-dom';


   window.fbAsyncInit = function() {
   FB.init({
     appId      : '1838987513085965',
     cookie     : true,

     xfbml      : true,
     version    : 'v2.8'
   });
   document.dispatchEvent(new Event('fb_init'));

  };

  (function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s); js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
  }(document, 'script', 'facebook-jssdk'));

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

function updateMessage(state, message) {
    var messageArray = state.message.slice()
    messageArray.push(message)
    return ({message: messageArray});
}

function updateActiveProfile(state, profileId) {
    return ({active_profile: profileId});
}

function updateFriendToMessage(state, friendId) {
    return ({friend_to_message: friendId});
}

class Info extends Component {

  constructor() {
    super();
    this.state = {
        user: [],
        friends: [],
        friend_to_message: 0,
        current_chat: 0,
        message: [],
        active_profile: 0,
    };
  }

  componentDidMount() {
    document.addEventListener('fb_init', e => this.checkLoginState());
  }

  requireAuth = () => {
    if (typeof this.state.user.user_id === "undefined") {
        return false;
    }
    return true;
}

  checkLoginState () {
    let _this = this;
    FB.getLoginStatus(function(response) {
    if ((response.status === "connected") && (typeof _this.state.user.user_id === "undefined")) {
        _this.logOrCreateUser();
      }
    });
  }

  logIn () {
    FB.login(function(response) {
        window.location.reload();
    })
  }

  logOut () {
    let _this = this;
    FB.logout(function(response) {
        window.location.reload();
    });
  }

  logOrCreateUser () {
    let _this = this;
    var csrftoken = getCookie('csrftoken');
    FB.api('/me?fields=id,name,email,picture', function(response) {
        $.ajax({
            type: "POST",
            url: 'api/login/',
            data: {data : JSON.stringify({'id': response.id, 'location' : response.location,
            'name': response.name, 'email' : response.email,
            'picture_url': response.picture.data.url}), csrfmiddlewaretoken: csrftoken},
            dataType: 'json',
        }).done(function(msg) {
            _this.setState({
                user: msg.msg,
            });
            _this.getFriends(response, msg.msg, csrftoken);
        }).fail(function(msg) {
        });
    });
    return false;
  }

  setFriendToMessage = (friendId, e) => {
        if(friendId !== this.state.friend_to_message) {
            var state = this.state;
            this.setState(updateFriendToMessage(state, friendId));
        }
    }

  setActiveProfile = (profileId, e) => {
        if (profileId !== this.state.active_profile) {
            var state = this.state;
            this.setState(updateActiveProfile(state, profileId));
        }
    }

  messageChange = (e) => {
        var state = this.state;
        this.setState(updateMessage(state, e.target.value));
    }

  sendMessage = (e) => {
        e.preventDefault();
        var state = this.state;
        var csrftoken = getCookie('csrftoken');
        const receiver_id = this.state.friend_to_message;
        const sender_id = this.state.user.user_id;
        const message = this.state.message[this.state.message.length-1];
        let _this = this;
        if (receiver_id && message) {
            $.ajax({
            type: "POST",
            url: 'api/chat/',
            data: {data : JSON.stringify({receiver_id : receiver_id, sender_id: sender_id, message: message}), csrfmiddlewaretoken: csrftoken},
            dataType: 'json',
        }).done(function(msg) {
            _this.setState(updateMessage(state, " "));
        }).fail(function(msg) {
        });
    }
  }

 getFriends(response, user_data, csrftoken) {
    let _this = this;
    var csrftoken = getCookie('csrftoken');
    FB.api('/me/friends', function(response) {
        response.data.push(1111111111);
        $.ajax({
            type: "POST",
            url: 'api/friends/',
            data: {data : JSON.stringify({friends : response.data, id: user_data.user_id}), csrfmiddlewaretoken: csrftoken},
            dataType: 'json',
        }).done(function(msg) {
            _this.setState({
                friends: msg.friends,
            });
        }).fail(function(msg) {
            console.log("could not load friends");
        });
      return false;
    });
  }

  updatedUser = () => {
    var csrftoken = getCookie('csrftoken');
    const _this = this;
    const user = this.state.user;
    $.ajax({
        type: "GET",
         url: 'api/profile/',
         data:  {data: JSON.stringify({id : user.user_id}), csrfmiddlewaretoken: csrftoken},
         dataType: 'json',
     }).done(function(msg) {
         _this.setState({
            user: msg.user,
         })
      }).fail(function(msg) {
      });
  }

  render () {
    const friends = this.state.friends;
    const user = this.state.user;
    const friend_to_message = this.state.friend_to_message;
    const pThis = this;
    return (
        <div>
            <div id="nav" className="row">
                <div id="midNav">
                    <div id="innerNav">
                        {this.requireAuth() ?
                        (<div><Link to="map" className="btn navItem">Map</Link>
                        <Link to="messenger" className="btn navItem">Messenger</Link>
                        <Link to="profile" className="btn navItem">Profile</Link></div>)
                        : (<div><span id="logo">Stayw/me</span></div>)
                        }
                    </div>
                </div>
            </div>
            <div id="jumbotron" className='jumbotron'>
                <div className="row">
                    <div className="col-md-12">
                        <Switch>
                            <Route path="/preview" render={(props) => ((this.requireAuth()) ? (<Redirect to="/profile"/>) : (<Preview {...props} logIn={this.logIn}  /> ))} />
                            <Route path="/map" render={(props) => ((this.requireAuth()) ? (<Map {...props} setActiveProfile={this.setActiveProfile} friends={friends} /> )
                            : (<Redirect to="/preview"/>) )} />
                            <Route path="/profile" render={(props) => ((this.requireAuth()) ? (<Profile {...props} user={user} updateUser={this.updatedUser} logOut={this.logOut}/>)
                            : (<Redirect to="/preview" />)  )}/>
                            <Route path="/messenger" render={(props) => ((this.requireAuth()) ? (<Messenger {...props} pThis={this}
                            message={this.state.message[this.state.message.length-1]} messageChange={this.messageChange}
                            friend_to_message={friend_to_message} pThis={pThis} uid={user.user_id}
                            setFriendToMessage={this.setFriendToMessage} sendMessage={this.sendMessage} friends={friends} /> )
                            : (<Redirect to="/preview"/>))} />
                        </Switch>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-md-12 col-sm-12">
                    <FriendsList uid={user.user_id} friends={friends} activeProfile={this.state.active_profile} setActiveProfile={this.setActiveProfile} setFriendToMessage={this.setFriendToMessage}/>
                </div>
            </div>
        </div>
        );

  }


}


class FriendsList extends Component {

    onClick = (friendId, e) => {
        this.props.setFriendToMessage(friendId);
        this.props.setActiveProfile(friendId);
    }

    render () {
        var friends = this.props.friends;
        var r = new RegExp('^(?:[a-z]+:)?//', 'i');
        var otherFriendsArr;
        const activeProfile = this.props.activeProfile;
        var activeFriend;
        if(friends && (friends.length > 0)) {
            otherFriendsArr = friends.slice()
            if (activeProfile > 0) {
                for (var i = 0; i < friends.length; i++) {
                    if (friends[i].user_id === activeProfile) {
                        activeFriend = friends[i];
                        otherFriendsArr.splice(i, 1);
                        otherFriendsArr.unshift(activeFriend);
                        break;
                    }
                }
            }
            const listOfFriends = otherFriendsArr.map((friend) =>
               <div className={(activeProfile === friend.user_id ? "activeFriend" : "") + " list-group-item row"} key={friend.email}>
                  <div className="friendPicIcon col-md-3 col-sm-3">
                      <img className="img-circle" src={((r.test(friend.picture_url) ? (friend.picture_url) : (require("./images/globe.png"))))} alt={require("./images/globe.png")} />
                  </div>
                  <div className="friendListItem col-md-3 col-sm-3 h4">
                      {friend.name}
                  </div>
                  <div className="friendListItem col-md-3 col-sm-3 h5">
                      {friend.location}
                  </div>
                  <div className="friendBtnMsg col-md-3 col-sm-3">
                       <Link to="/messenger" onClick={this.onClick.bind(this, friend.user_id)}>
                            <button className="btn sendButton">
                                 Message
                            </button>
                       </Link>
                  </div>
               </div>
            );
            return (
                <div>
                    {listOfFriends}
                </div>
            );
        } else {
            return (
                <div className="activeFriend list-group-item row">
                  <div className="friendPicIcon col-md-3 col-sm-3">
                      <img className="img-circle" src={require("./images/globe.png")} />
                  </div>
                  <div className="friendListItem col-md-3 col-sm-3 h4">
                      Your Friends...
                  </div>
                  <div className="friendListItem col-md-3 col-sm-3 h5">
                      Are On The Way!
                  </div>
                  <div className="friendBtnMsg col-md-3 col-sm-3">
                    <button className="btn sendButton">
                        = )
                    </button>
                  </div>
               </div>
            );
        }
    }
}




export default Info;
