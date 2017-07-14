/*global FB*/
import React, { Component } from 'react';

var r = new RegExp('^(?:[a-z]+:)?//', 'i');

class InfoBar extends Component {

getMutualFriends () {
    const friendId = this.props.infoBarData.user_id;
    var contextId;
    FB.api(
        "/" + friendId,
        {
            "fields": "context.fields(all_mutual_friends)",

        },
        function (response) {
            if (response && !response.error) {
                contextId = response.context.id;
                FB.api(
                    "/" + contextId + "/mutual_friends",
                    function (response) {
                        if (response && !response.error) {
                            // looks like it's returning an array but won't know until
                            // test users try it out
                        }
                    }
                );
            }
    }
  );
}

render () {
    const friend = this.props.infoBarData;
    const toggleInfoBar = this.props.toggleInfoBar;
    this.getMutualFriends();
    var infoBarClass = this.props.infoBarIsOpen ? 'infoBar infoBarOpen' : 'infoBar';
    return (
        <div className={infoBarClass + " row"}>
            <div className="col-sm-11">
                <div className="row">
                    <i onClick={toggleInfoBar} className="infoBarX fa fa-times-circle" aria-hidden="true"></i>
                </div>
                <div className="row">
                    <img className="picSize img-circle"
                    src={((r.test(friend.picture_url) ? (friend.picture_url) : (require("./images/globe.png"))))}
                    alt={require("./images/globe.png")} />
                </div>
                <div className="infoBarTopDiv row">
                    <small className="infoBarFriendName">{friend.name}</small>
                </div>
                <div className="infoBarMidDiv row">
                    <p className="infoBarInfo">
                    <strong>I am...</strong>
                    <small>{friend.question1}</small>
                    </p>
                </div>
            </div>
        </div>
    );

    }
}

export default InfoBar;