import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter, Route, Switch, Redirect } from 'react-router-dom';

import page404 from './pages/404';
import index from './pages/index';
import WebServer from './pages/web-server';

class App extends Component {
    render() {
        const currentUrl = new URL(window.location.href);
        return (
            <div>
                <Switch>
                    <Route path="/" exact component={index} />
                    <Route path="/www" component={WebServer} />
                    <Route path="/error" component={page404} />
                    <Route path="*" render={() => <Redirect to="/" />} />
                </Switch>
                {currentUrl.searchParams.get('redirectTo') ? (
                    <Redirect
                        to={decodeURIComponent(
                            currentUrl.searchParams.get('redirectTo')
                        )}
                    />
                ) : null}
            </div>
        );
    }
}

ReactDOM.render(
    <BrowserRouter>
        <App />
    </BrowserRouter>,
    document.getElementById('container')
);
