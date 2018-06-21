import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { HashRouter, Route, Switch } from 'react-router-dom';

import page404 from './pages/404';
import index from './pages/index';
import WebServer from './pages/web-server';
import Redirect from 'react-router/Redirect';

class App extends Component {
    render() {
        return (
            <div>
                <Switch>
                    <Route path="/" exact component={index} />
                    <Route path="/www" component={WebServer} />
                    <Route path="/error" component={page404} />
                    <Route path="*" render={() => <Redirect to="/" />} />
                </Switch>
            </div>
        );
    }
}

ReactDOM.render(
    <HashRouter>
        <App />
    </HashRouter>,
    document.getElementById('container')
);
