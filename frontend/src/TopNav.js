import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import 'react-select/dist/react-select.css';
import { withRouter } from 'react-router';

function arrowRenderer () {
	return (
		<span>+</span>
	);
}

class TopNav extends Component {

    logChange = (val) => {
        if(val.value.user_id > 0) {
            const { history: { push } } = this.props;
            this.props.updatedInfoData(val.value);
            push("/friends");
        }
     }

    render () {
        var Select = require('react-select');
        var options = [];
        if(this.props.friends.length > 0) {
            const friends = this.props.friends;
            for(var f = 0; f < friends.length; f++) {
                options.push({value: friends[f], label: friends[f].name})
            }
        }
        const user = this.props.user;
        var firstName = "";
        if(user.user_id > 0) {
            var nameSplit = user.name.split(" ");
            firstName = nameSplit[0];
            }
        var r = new RegExp('^(?:[a-z]+:)?//', 'i');
        return (
        <div>
            <div className="col-md-8 col-sm-8 col-xs-12">
                <div className='col-md-2 col-sm-2 col-xs-2'>
                    <a href="http://www.stayw.me"><img src={require("./images/staywmelogo.png")} className="navbar-left" id="navBarLogo"></img></a>
                </div>
                <Link to="map" className="navItem">
                    <span className="navDiv col-md-3 col-sm-3 col-xs-3">
                        Map
                    </span>
                </Link>
                <Link to="messenger" className="navItem">
                    <span className="navDiv col-md-3 col-sm-3 col-xs-3">
                        Messenger
                    </span>
                </Link>
                <Link to="profile" className="navItem">
                    <span className="navDiv col-md-4 col-sm-4 col-xs-4">
                        <img className="navBarProfilePic img-circle" src={((r.test(user.picture)) ? (user.picture) : (require("./images/globe.png")))} alt={require("./images/globe.png")}></img>
                        <span className="navItem">{firstName}</span>
                    </span>
                </Link>
            </div>
            <div className="col-md-4 col-sm-4 hidden-xs">
                <div className="searchBarDiv hidden-xs">
                    {<Select
                     arrowRenderer={arrowRenderer}
                     value="one"
                     placeholder="search for..."
                     options={options}
                     clearable={false}
                     onChange={this.logChange}
                     />}
                </div>
            </div>
         </div>
         );
    }
}

export default withRouter(TopNav);