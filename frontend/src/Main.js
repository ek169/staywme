/*global FB*/
import $ from 'jquery';
import jQuery from 'jquery';
import React, { Component } from 'react';
import Profile from './profile';
import Messenger from './Messenger';
import Preview from './Preview';
import Map from './Map';
import Friends from './Friends';
import InfoBar from './InfoBar';
import TopNav from './TopNav';
import SideNav from './SideNav';
import FriendProfile from './FriendProfile';
import { Redirect, Route, Switch } from 'react-router-dom';


   window.fbAsyncInit = function() {
   FB.init({
     appId      : '485913571748452',
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


class Base extends Component {

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
        event: [],
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

  updatedInfoData = (friend) => {
    this.setState(updateInfoBarSource(friend));
  }

  toggleInfoBar = () => {
    this.setState(updateInfoBar(this.state.infoBarIsOpen));
    return false;
  }

  changeInfoBarSource = (friend, e) => {
    if(!this.state.infoBarIsOpen) {
        this.toggleInfoBar();
    }
    this.setState(updateInfoBarSource(friend));
    return false;
  }

  checkLoginState () {
    let _this = this;
    FB.getLoginStatus(function(response) {
    if ((response.status === "connected") && (typeof _this.state.user.user_id === "undefined")) {
        const access_token = response.authResponse.accessToken;
        _this.logOrCreateUser(access_token);
      }
    });
  }

  logIn () {
    FB.login(function(response) {
        window.location.reload();
    }, {scope: 'email,user_friends'});
  }

  logOut () {
    FB.logout(function(response) {
        window.location.reload();
    });
  }

  logOrCreateUser (access_token) {
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
            msg.msg['access_token'] = access_token
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

  messageChangeToEvent = (e, message) => {
    const state = this.state;
    let _this = this;
    this.setState(updateMessage(state, message), function(e) { return _this.sendMessage(); });
  }

  sendMessage = (e) => {
        if(e) {
            e.preventDefault();
        }
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

  findNewFriends(friendsFB, friendsFromDB, thisUserId) {
    var csrftoken = getCookie('csrftoken');
    let _this = this;
    var batch = [];
    for(var i = 0; i < friendsFB.length; i++) {
        var idString = '' + friendsFB[i].id + '/friends';
        batch.push({method: 'GET', relative_url: idString});

    FB.api('/', 'POST', { batch }, function(response) {
        var allFriends = [];
        for(var f = 0; f < response.length; f++) {
            var theData = JSON.parse(response[f].body);
            allFriends = allFriends.concat(theData.data);
        }
        for(var x = 0; x < allFriends.length; x++) {
            if('' + allFriends[x].id !== '' + thisUserId) {
                friendsFromDB = binarySearch(allFriends[x].id, friendsFromDB);
            }
        }
        $.ajax({
            type: "POST",
            url: 'api/friends/',
            data: {data : JSON.stringify({friends : friendsFromDB, id: thisUserId}), csrfmiddlewaretoken: csrftoken},
            dataType: 'json',
        }).done(function(msg) {
            _this.setState({
                friends: msg.friends,
            });
        }).fail(function(msg) {
            console.log("could not load friends");
        });
    });

    }
  }

 getFriends(response, user_data, csrftoken) {
    const thisUserId = user_data.user_id;
    let _this = this;
    var friendsFromDB = [];
    $.ajax({
        type: 'GET',
        url: 'api/friends/',
        data: {data : JSON.stringify({id: user_data.user_id}), csrfmiddlewaretoken: csrftoken},
        dataType: 'json',
    }).done(function(msg) {
        friendsFromDB = friendsFromDB.concat(msg.friends);
        friendsFromDB.sort();
    }).fail(function(msg) {
        console.log('no friends in db');
    });
    FB.api('/me/friends', function(response) {
        for(var i = 0; i < response.data.length; i++) {
            friendsFromDB = binarySearch(response.data[i].id, friendsFromDB);
        }
        _this.findNewFriends(response.data, friendsFromDB, thisUserId);
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
    return (
        <div>
            <div id="nav" className="hidden-lg">
                <div id="midNav" className="row col-md-12 col-sm-12 col-xs-12">
                    <div className="row" id="innerNav">
                        {this.requireAuth() ?
                        (
                        <TopNav friends={this.state.friends} updatedInfoData={this.updatedInfoData} user={user}/>
                        )
                        : (<div hidden="hidden"></div>)
                        }
                    </div>
                </div>
            </div>
            <div>
                {this.requireAuth() ? (<InfoBar infoBarIsOpen={this.state.infoBarIsOpen} toggleInfoBar={this.toggleInfoBar} uid={user.user_id} infoBarData={this.state.infoBarData} dataIsMissing={(user.email && user.location) ? false : true}/>) : ""}
            </div>
            <div className="col-lg-3 hidden-md hidden-sm hidden-xs">
                {this.requireAuth() ? (<SideNav friends={this.state.friends} updatedInfoData={this.updatedInfoData} user={user}/>) : <div hidden="hidden"></div>}
            </div>
            <div id={this.requireAuth() ? "jumbotron" : ""} className={this.requireAuth() ? 'jumbotron col-lg-9 col-md-12 col-sm-12 col-xs-12' : ""}>
                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <Switch>
                            <Route path="/preview" render={(props) => ((this.requireAuth()) ? (<Redirect to="/profile"/>) : (<Preview {...props} logIn={this.logIn}  /> ))} />
                            <Route path="/map" render={(props) => ((this.requireAuth()) ? (<Map {...props} setActiveProfile={this.setActiveProfile}
                            changeInfoBarSource={this.changeInfoBarSource} friends={friends} /> )
                            : (<Redirect to="/preview"/>) )} />
                            <Route path="/profile" render={(props) => ((this.requireAuth()) ? (<Profile {...props} user={user} updateUser={this.updatedUser} logOut={this.logOut}/>)
                            : (<Redirect to="/preview" />)  )}/>
                            <Route path="/friends" render={(props) => ((this.requireAuth()) ? (<FriendProfile setFriendToMessage={this.setFriendToMessage} friend={this.state.infoBarData} accessToken={this.state.user.access_token}/>) : (<Redirect to="/preview"/>) )} />
                            <Route path="/messenger" render={(props) => ((this.requireAuth()) ? (<Messenger {...props} pThis={this}
                            message={this.state.message[this.state.message.length-1]} friendData={this.state.infoBarData} messageChangeToEvent={this.messageChangeToEvent} messageChange={this.messageChange}
                            friend_to_message={friend_to_message} uid={user.user_id}
                            setFriendToMessage={this.setFriendToMessage} sendMessage={this.sendMessage} friends={friends} /> )
                            : (<Redirect to="/preview"/>))} />
                            <Route exact path="/" render={(props) => (<Redirect to="/preview"/>)} />
                        </Switch>
                    </div>
                </div>
            </div>
            <div className="row">
                <Friends uid={user.user_id} friends={friends} activeProfile={this.state.active_profile}
                updatedInfoData={this.updatedInfoData} setActiveProfile={this.setActiveProfile} setFriendToMessage={this.setFriendToMessage}/>
            </div>
        </div>
        );

  }


}



export default Base;
