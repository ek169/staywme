import React, { Component } from 'react';
import './jumbotron-narrow.css';
import Info from './javascriptSDK';
import createBrowserHistory from 'history/createBrowserHistory';
import {
  BrowserRouter as Router,
  Route,
} from 'react-router-dom';

const history = createBrowserHistory();

class App extends Component {
    render () {
        return (
        <Router history={history}>
            <div>
                <Route path="/" component={Info}/>
            </div>
        </Router>
        )
    }
}
export default App;
