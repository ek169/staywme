/*global google*/
import React, { Component } from 'react';
import jQuery from 'jquery';


class Map extends Component {

    componentDidMount () {
        return this.createMap();
    }

    createMap () {
        var lat = 42.361145;
        var lng = -71.057083;
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(function(position) {
              lat = position.coords.latitude;
              lng = position.coords.longitude;
              });
        }
        var mapOptions = {
            center: new google.maps.LatLng(lat, lng),
            zoom: 4,
            mapTypeId: google.maps.MapTypeId.ROADMAP
        };

        var map = new google.maps.Map(document.getElementById('map'), mapOptions);
        var friends = this.props.friends;
        if (friends && (friends.length > 0)) {
            const setActiveProfile = this.props.setActiveProfile;
            const changeInfoBarSource = this.props.changeInfoBarSource;
            for (var i = 0; i < friends.length; i++) {
                var latLng = new google.maps.LatLng(friends[i].latitude,friends[i].longitude);
                var friendInfo = new google.maps.InfoWindow({
                    content: friends[i].name,
                });
                var icon;
                var r = new RegExp('^(?:[a-z]+:)?//', 'i');
                if (r.test(friends[i].picture_url)) {
                    icon = {
                            url: friends[i].picture_url,
                            scaledSize: new google.maps.Size(50, 50),
                            };
                } else {
                    icon = require("./images/globe.png");
                }
                var friendMarker = new google.maps.Marker({
                    position: latLng,
                    map: map,
                    infowindow: friendInfo,
                    icon: icon,
                    friend_id: friends[i].user_id,
                    friend: friends[i]
                });
                google.maps.event.addListener(friendMarker, 'click', function() {
                    this.infowindow.open(map, this);
                    setActiveProfile(this.friend_id);
                    changeInfoBarSource(this.friend);
                });
            }
        }
    }

    render () {

        return (
            <div>
                <div id="map"></div>
                <div style={{paddingTop: 10}}>
                </div>
            </div>
        )
    }


}

export default Map;