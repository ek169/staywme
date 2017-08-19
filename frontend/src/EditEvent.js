import React, { Component} from 'react';
import DatePicker from 'react-datepicker';
import moment from 'moment';
import jQuery from 'jquery';
import 'react-datepicker/dist/react-datepicker.css';
import $ from 'jquery';

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

class EditEvent extends Component {
  constructor (props) {
    super(props);
    const start = moment(this.props.event.start_date);
    const end = moment(this.props.event.end_date);
    this.state = {
      startDate: start,
      endDate: end,
      error: false,
    };
  }

  handleChangeStart = (date) => {
    var endDate = this.state.endDate;
    if(date > endDate) {
        endDate = date;
    }
    this.setState({
      startDate: date,
      endDate: endDate
    });
  }

  handleChangeEnd = (date) => {
    this.setState({
      endDate: date
    });
  }

  sendEdit = () => {
    if((moment(this.props.event.startDate) !== this.state.startDate) && (moment(this.props.event.endDate) !== this.state.endDate)) {
        var csrftoken = getCookie('csrftoken');
        var event = this.props.event;
        const startDate = this.state.startDate.format("YYYY-MM-DD");
        const endDate = this.state.endDate.format("YYYY-MM-DD");
        $.ajax({
            type: "POST",
            url: 'api/edit_event/',
            data: {data : JSON.stringify({"eventId" : event.id, "startDate": startDate, "endDate": endDate}), csrfmiddlewaretoken: csrftoken},
            dataType: 'json',
        }).done(function(msg) {
        }).fail(function(msg) {
        });
        event.start_date = startDate;
        event.end_date = endDate;
        event.response = null;
        this.props.updateEvent(event);
        this.props.edit();
    }
  }

  render () {
        return (
          <div>
              <div className="eventEditDiv col-lg-7 col-md-7 col-sm-7 col-xs-7">
                  <DatePicker
                          selected={this.state.startDate}
                          selectsStart
                          startDate={this.state.startDate}
                          minDate={moment()}
                          endDate={this.state.endDate}
                          onChange={this.handleChangeStart}
                          className={"form-control datePickText"}
                   />
                    <DatePicker
                      selected={this.state.endDate}
                      selectsEnd
                      minDate={moment()}
                      startDate={this.state.startDate}
                      endDate={this.state.endDate}
                      onChange={this.handleChangeEnd}
                      className={"form-control datePickText"}
                    />
              </div>
              <div className="editEventBtn col-lg-3 col-md-3 col-sm-3 col-xs-3">
                <span onClick={this.sendEdit} className="sendButton">Update</span>
              </div>
          </div>
          );
  }
  }

export default EditEvent;