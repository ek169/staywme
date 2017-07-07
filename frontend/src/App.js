import React, { Component } from 'react';
import './jumbotron-narrow.css';
import Info from './javascriptSDK';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

class App extends Component {
    render () {
        return (
        <Router>
            <div>
                <Route path="/" component={Info}/>
            </div>
        </Router>
        )
    }
}
export default App;
