import React, { Component } from 'react';
import { Link } from 'react-router-dom';

var r = new RegExp('^(?:[a-z]+:)?//', 'i');

class InfoBar extends Component {

render () {
    if(this.props.dataIsMissing) {
        return (
            <div className="row infoBarWarning infoBar infoBarOpen">
                <div className="infoWarningTxt">
                    You're missing
                    either your <strong>email</strong> or <strong>location</strong>. You won't
                    be visible to your network.
                    <div className="">
                        <Link to="/profile">Update Info</Link>
                    </div>
                </div>
            </div>

        );
    }
    /*
    const friend = this.props.infoBarData;
    const toggleInfoBar = this.props.toggleInfoBar;
    var infoBarClass = this.props.infoBarIsOpen ? 'infoBar infoBarOpen' : 'infoBar';
    return (
        <div className={infoBarClass + " row hidden-md hidden-sm hidden-xs"}>
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
                    <strong>I am...{friend.status}</strong>
                    </p>
                </div>
                <div className="infoBarMidDiv row">
                    <p className="infoBarInfo">
                    {friend.location}
                    <br/>
                    -
                    <br/>
                    {friend.bio}
                    </p>
                </div>
            </div>
        </div>
    );*/
    return (<div hidden="hidden"></div>);

    }
}

export default InfoBar;