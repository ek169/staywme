import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import 'react-select/dist/react-select.css';
import { withRouter } from 'react-router';

function arrowRenderer () {
	return (
		<span>+</span>
	);
}

class SideNav extends Component {

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
            <div className="col-lg-12 hidden-md hidden-sm hidden-xs sideNavBar">
               <div>
                   <div className='sideNavLogoDiv'>
                       <a href="http://www.stayw.me"><img src={require("./images/staywmelogo.png")} id="sideNavBarLogo"></img></a>
                   </div>
                   <div>
                       <div className="col-lg-12 searchBarDiv">
                           {<Select
                             value="one"
                             arrowRenderer={arrowRenderer}
                             placeholder="search for..."
                             clearable={false}
                             options={options}
                             onChange={this.logChange}
                           />}
                       </div>
                   </div>
                   <div className="sideNavDiv">
                       <Link to="profile" className="navItem">
                           <span className="sideNavDiv">
                               <img className="navBarProfilePic img-circle" src={((r.test(user.picture)) ? (user.picture) : (require("./images/globe.png")))} alt={require("./images/globe.png")}></img>
                               <span className="navItem">{firstName}</span>
                           </span>
                       </Link>
                   </div>
                   <div>
                       <Link to="map" className="navItem">
                           <span className="sideNavDiv">
                               Map
                           </span>
                       </Link>
                   </div>
                   <div>
                       <Link to="messenger" className="navItem">
                           <span className="sideNavDiv">
                               Messenger
                           </span>
                       </Link>
                   </div>
               </div>
            </div>
         </div>
         );
        }
    }

export default withRouter(SideNav);