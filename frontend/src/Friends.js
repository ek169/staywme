import React, { Component } from 'react';
import { Link } from 'react-router-dom';

class Friends extends Component {

    onClick = (friend, e) => {
        this.props.setFriendToMessage(friend.user_id);
        this.props.setActiveProfile(friend.user_id);
        this.props.updatedInfoData(friend);
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
                  <div className="friendPicIcon col-md-3 col-sm-3 col-xs-3">
                      <img className="picSize img-circle" src={((r.test(friend.picture_url) ? (friend.picture_url) : (require("./images/globe.png"))))} alt={require("./images/globe.png")} />
                  </div>
                  <div className="friendListItem col-md-3 col-sm-3 col-xs-3 h4">
                    <Link to="/friends">
                        <span onClick={this.props.updatedInfoData.bind(this, friend)}>{friend.name}</span>
                    </Link>
                  </div>
                  <div className="friendListItem col-md-3 col-sm-3 col-xs-3 h5">
                      {friend.location}
                  </div>
                  <div className="friendBtnMsg col-md-3 col-sm-3 col-xs-3">
                       <Link to="/messenger" onClick={this.onClick.bind(this, friend)}>
                            <button className="btn sendButton">
                                 Message
                            </button>
                       </Link>
                  </div>
               </div>
            );
            return (
                <div className="col-md-12 col-sm-12 col-xs-12" id="friendListMain">
                    {listOfFriends}
                </div>
            );
        } else {
            return (
                <div hidden="hidden"></div>
                /*<div className="col-md-12 col-sm-12 col-xs-12" id="friendListMain">
                    <div className="activeFriend list-group-item row">
                      <div className="friendPicIcon col-md-3 col-sm-3 col-xs-3">
                          <img className="picSize img-circle" src={require("./images/globe.png")} />
                      </div>
                      <div className="friendListItem col-md-3 col-sm-3 col-xs-3 h4">
                          Your Friends...
                      </div>
                      <div className="friendListItem col-md-3 col-sm-3 col-xs-3 h5">
                          Are On The Way!
                      </div>
                      <div className="friendBtnMsg col-md-3 col-sm-3 col-xs-3">
                        <button className="btn sendButton">
                            = )
                        </button>
                      </div>
                    </div>
                </div>*/
            );
        }
    }
}

export default Friends;