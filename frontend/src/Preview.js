/*global FB*/
import React, { Component } from 'react';


class Preview extends Component {

    componentDidMount () {
        let _this = this;
        const history = this.props.history;
        document.addEventListener('fb_init', function() {
            FB.Event.subscribe('auth.statusChange', function(response) {
                if ((response.status === "connected")) {
                    _this.props.forceUpdate;
                }
            })
        })
    }


    render () {
        return (
        <div>
            <div id="h4 frontPageText">
                <strong>Need a place to crash? Find a friend (or a friend of a friend) to host you on <em>Stayw/me!</em></strong>
            </div>
            <div id="frontPageDiv">
                <img id="frontPageImg" src={require("./images/frontpageimg.png")} />
            </div>
            <div id="fbLoginDiv">
                <button className="fa loginBtn" onClick={this.props.logIn.bind(this)}><i className="fa fa-facebook left fbSize"></i> Continue with facebook</button>
            </div>
        </div>
        );

    }
}

export default Preview;