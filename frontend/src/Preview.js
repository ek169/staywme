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
            <button className="fa loginBtn" onClick={this.props.logIn.bind(this)}><i className="fa fa-facebook left fbSize"></i> Continue with facebook</button>
        </div>
        );

    }
}

export default Preview;