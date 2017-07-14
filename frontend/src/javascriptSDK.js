/*global FB*/
import $ from 'jquery';
import jQuery from 'jquery';
import React, { Component } from 'react';
import Profile from './profile';
import Messenger from './Messenger';
import Preview from './Preview';
import Map from './Map';
import Friends from './Friends';
import InfoBar from './InfoBar'
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

function updateInfoBar(infoBarState) {
    return ({infoBarIsOpen: !infoBarState});
}

function updateInfoBarSource(friend) {
    return ({infoBarData: friend});
}

function binarySearch(uid, friends_list) {
    var minIndex = 0;
    var maxIndex = friends_list.length - 1;
    var currentIndex;
    var currentUID;

    while (minIndex <= maxIndex) {
        currentIndex = (minIndex + maxIndex) / 2 | 0;
        currentUID = friends_list[currentIndex];

        if (currentUID < uid) {
            minIndex = currentIndex + 1;
        }
        else if (currentUID > uid) {
            maxIndex = currentIndex - 1;
        }
        else {
            return friends_list;
        }
    }
    friends_list.splice(minIndex, 0, uid);
    return friends_list;
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
        infoBarIsOpen: false,
        infoBarData: [],
    };
  }

  componentDidMount() {
    var csrftoken = getCookie('csrftoken');
    $.ajaxSetup({
        data: {csrfmiddlewaretoken: csrftoken},
        beforeSend: function(xhr, settings){
        xhr.setRequestHeader('X-CSRFToken',
                            "'" + csrftoken + "'");
    }});
    $.ajaxSetup({data: {
     csrfmiddlewaretoken: '{{ csrf_token }}'
  }});
    document.addEventListener('fb_init', e => this.checkLoginState());
  }

  requireAuth = () => {
    if (typeof this.state.user.user_id === "undefined") {
        return false;
    }
    return true;
  }

  toggleInfoBar = () => {
    this.setState(updateInfoBar(this.state.infoBarIsOpen));
  }

  changeInfoBarSource = (friend, e) => {
    if(!this.state.infoBarIsOpen) {
        this.toggleInfoBar();
    }
    this.setState(updateInfoBarSource(friend));
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
    }, {scope: 'email,user_friends'});
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
            this.toggleInfoBar();
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

  findNewFriends(friends_from_db) {
    const this_user_id = this.state.user.user_id;
    var updated_user_friends = [];
    updated_user_friends.concat(friends_from_db);
    for(var i = 0; i < friends_from_db.length; i++) {
        FB.api('/' + friends_from_db[i] + '/friends', function(response) {
            for(var o = 0; o < response.data; o++) {
                if(response.data[o] !== this_user_id) {
                    updated_user_friends = binarySearch(response.data[o], friends_from_db);
                }
            }
        });
    }
    return updated_user_friends;
  }

 getFriends(response, user_data, csrftoken) {
    var csrftoken = getCookie('csrftoken');
    let _this = this;
    var friends_from_db = [];
    $.ajax({
        type: 'GET',
        url: 'api/friends/',
        data: {data : JSON.stringify({id: user_data.user_id}), csrfmiddlewaretoken: csrftoken},
        dataType: 'json',
    }).done(function(msg) {
        friends_from_db.push(msg.friends);
        friends_from_db.sort();
    }).fail(function(msg) {
        console.log('no friends in db');
    });
    FB.api('/me/friends', function(response) {
        for(var i = 0; i < response.data.length; i++) {
            friends_from_db = binarySearch(response.data[i], friends_from_db);
        }
        var updated_user_friends = _this.findNewFriends(friends_from_db);
        $.ajax({
            type: "POST",
            url: 'api/friends/',
            data: {data : JSON.stringify({friends : updated_user_friends, id: user_data.user_id}), csrfmiddlewaretoken: csrftoken},
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
                <div>
                    {typeof this.state.user.user_id !== 'undefined' ? (<InfoBar infoBarIsOpen={this.state.infoBarIsOpen} toggleInfoBar={this.toggleInfoBar} uid={user.user_id} infoBarData={this.state.infoBarData}/>) : ""}
                </div>
            </div>
            <div id="jumbotron" className='jumbotron'>
                <div className="row">
                    <div className="col-md-12">
                        <Switch>
                            <Route exact path="/" render={(props) => (<Redirect to="/preview"/>)} />
                            <Route path="/preview" render={(props) => ((this.requireAuth()) ? (<Redirect to="/profile"/>) : (<Preview {...props} logIn={this.logIn}  /> ))} />
                            <Route path="/map" render={(props) => ((this.requireAuth()) ? (<Map {...props} setActiveProfile={this.setActiveProfile}
                            changeInfoBarSource={this.changeInfoBarSource} friends={friends} /> )
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
                    <Friends uid={user.user_id} friends={friends} activeProfile={this.state.active_profile} changeInfoBarSource={this.changeInfoBarSource} setActiveProfile={this.setActiveProfile} setFriendToMessage={this.setFriendToMessage}/>
                </div>
            </div>
        </div>
        );

  }


}



export default Info;
