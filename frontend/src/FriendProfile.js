import $ from 'jquery';
import jQuery from 'jquery';
import React, { Component} from 'react';
import { Link } from 'react-router-dom';

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


class FriendProfile extends Component {
    constructor () {
        super();
        this.state = {
            friendData: [],
        }
    }

    onClick = (friendId, e) => {
        this.props.setFriendToMessage(friendId);
    }

    componentDidMount () {
        this.getMutualFriends();
    }

    getMutualFriends () {
        let _this = this;
        var csrftoken = getCookie('csrftoken');
        const friendId = this.props.friend.user_id;
        const accessToken = this.props.accessToken;
        $.ajax({
            type: "POST",
            url: 'api/get_mutual_friends/',
            data: {data : JSON.stringify({'user_id': friendId, 'access_token' : accessToken}), csrfmiddlewaretoken: csrftoken},
            dataType: 'json',
        }).done(function(msg) {
            _this.setState({friendData: msg.msg});
        }).fail(function(msg) {
        });
    }

    render () {
        const friend = this.props.friend;
        const friendData = this.state.friendData;
        var theMutualFriends;
        const friendDataArrived = (typeof friendData.data !== 'undefined');
        if(friendDataArrived) {
             theMutualFriends = friendData.data.map((friend) =>
                <div key={friend.picture.data.url} className="mutualFriendDiv col-lg-4 col-md-4 col-sm-4 xs-hidden">
                    <img src={friend.picture.data.url} alt={require("./images/globe.png")}/>
                </div>
            );
        }

        return (
            <div id="friendProfileArea" className="well col-md-12 col-sm-12 col-xs-12">
                <div className="row">
                    <div className="col-lg-12 col-md-12 col-sm-12 col-xs-12">
                        <div className="form-group col-md-2 col-sm-2 col-xs-2">
                            <img className="img-circle" src={friend.picture_url} alt={require("./images/globe.png")}/>
                        </div>
                        <div id="profileName" className="form-group col-lg-6 col-md-6 col-sm-6 col-xs-6">
                            <span >{friend.name}</span><small className="friendStatusTxt">({friend.status})</small>
                        </div>
                        <div className="friendProfileMessageBtn col-lg-2 col-md-2 col-sm-2 col-xs-2">
                            <Link to="/messenger" onClick={this.onClick.bind(this, friend.user_id)}>
                                <button className="sendButton">
                                    Message
                                </button>
                            </Link>
                        </div>
                     </div>
                </div>
                <div className="row">
                    <div className="well profileBlockArea col-lg-7 col-md-7 col-sm-7 hidden-xs">

                    </div>
                    <div className="col-lg-5 col-md-5 col-sm-5 col-xs-12">
                        {friendDataArrived ?
                            (<div className="profileBlockArea well col-lg-12 col-md-12 col-sm-12 col-xs-6">
                                <div id="mutualFriendCount" className="col-lg-4 col-md-4 col-sm-4 col-xs-4">
                                   <strong>{friendData.summary.total_count}</strong> Mutual Friends
                                </div>
                                {theMutualFriends}
                            </div>)
                            :
                            <div></div>}
                        <div className="profileBlockArea well col-lg-12 col-md-12 col-sm-12 col-xs-6">
                            <div className="locationProfileDiv">
                                <div className="row">
                                    <label>Location</label>
                                </div>
                                <div className="row">
                                    {friend.location}
                                </div>
                           </div>
                           <div className="row">
                               <label>Bio</label>
                           </div>
                           <div className="row">
                               {friend.bio ? friend.bio : <div>* Has not created a bio *</div>}
                           </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default FriendProfile;