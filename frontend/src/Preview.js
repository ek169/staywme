/*global FB*/
import $ from 'jquery';
import React, { Component } from 'react';
import ReactLoading from 'react-loading';


class Preview extends Component {

    componentDidMount () {
        let _this = this;
        document.addEventListener('fb_init', function() {
            FB.Event.subscribe('auth.statusChange', function(response) {
                if ((response.status === "connected")) {
                    _this.props.forceUpdate;
                }
            })
        })

    }

    clickNews = () => {
        $('html, body').animate({
          scrollTop: $("#newDiv").offset().top
        }, 800, function(){
        });
    }

    clickWorks = () => {
        $('html, body').animate({
          scrollTop: $("#worksDiv").offset().top
        }, 800, function(){
        });
    }

    render () {
        return (
        <div className="container" id="previewContainer">
            <div id="previewNavDiv">
                <img src={require("./images/staywmelogo.png")} className="navbar-left" id="navBarLogo"></img>
                <div onClick={this.clickNews} className="col-lg-3 col-md-3 col-sm-3 pNavItem">
                    <span className="pNavDiv whatsNew">
                        WHAT'S NEW
                    </span>
                </div>
                <div onClick={this.clickWorks} className="col-lg-3 col-md-3 col-sm-3 hidden-xs pNavItem">
                    <span className="pNavDiv">
                        HOW IT WORKS
                    </span>
                </div>
                <div id="fbLoginDiv">
                    <button className="fa loginBtn" onClick={this.props.logIn.bind(this)}><i className="fa fa-facebook left fbSize"></i> Continue with Facebook</button>
                </div>
            </div>
            <div>
                <div className="row" id="mainDiv">
                    <div id="landImgTxt">
                        <div id="landImgTxtBorder">
                        </div>
                        Wherever you are, stay with a friend
                    </div>
                    <div className="row">
                        <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6">
                            <button className="fa goBtn" onClick={this.props.logIn.bind(this)}> GET STARTED <i className="fa fa-map-o left goSize"></i></button>
                        </div>
                        <div id="shareDiv" className="col-lg-6 col-md-6 col-sm-6 hidden-xs">
                            <a className="fbShareBtn" href="https://www.facebook.com/sharer/sharer.php?u=https://www.stayw.me">
                                <i className="left fa fa-facebook fbSizeMd"></i>
                                Share
                            </a>
                            <a className="twitterShareBtn" href="https://twitter.com/intent/tweet?text=Never pay for an accomodation again. Stay with a friend on - https://www.stayw.me -">
                                <i className="twitterLogo fa fa-twitter"></i>
                                Tweet
                            </a>
                        </div>
                    </div>
                    <div id="worksDiv"></div>
                    </div>
                </div>
            <div>
                <div id="frontPageDiv" className="row">
                    <div className="col-lg-3 col-md-3 col-sm-3 col-xs-6 infoItemDiv">
                        <div className="row infoIcon">
                            <i className="fa fa-sign-in"></i>
                        </div>
                        <div className="row">
                            <span className="infoTxt">1 Click Sign Up</span>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-6 col-xs-6 middleItemDiv">
                        <div className="row infoIcon">
                            <i className="fa fa-users"></i>
                        </div>
                        <div className="row">
                            <span className="infoTxt">Access a network of anyone you have a mutual friend with</span>
                        </div>
                    </div>
                    <div className="col-lg-3 col-md-3 col-sm-3 hidden-xs infoItemDiv">
                        <div className="row infoIcon">
                            <i className="fa fa-bed"></i>
                        </div>
                        <div className="row">
                            <span className="infoTxt">Set up a stay</span>
                        </div>
                    </div>
                </div>
            </div>
            <div id="secondaryDiv">
                <div id="secondaryTxt">
                    "Once you have the experience of staying with a friend or a friend of a friend, you truly never want to go back"
                </div>
                <div id="secondaryBottomTxt" className="hidden-xs">
                   Continue reading
                   <i className="fa fa-arrow-circle-down downArrow"></i>
                </div>
            </div>
            <div id="newDiv">
                <div id="whatsNewTitle" className="col-lg-2 col-md-2 col-sm-2 col-xs-2">
                    New
                </div>
                <div id="whatsNew" className="col-lg-10 col-md-10 col-sm-10 col-xs-10">
                    Updates: V 1.0 - release beta Aug 2017
                </div>
            </div>
        </div>
        );

    }
}

export default Preview;