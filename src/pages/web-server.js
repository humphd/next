import React, { Component } from 'react';
import { Route } from 'react-router-dom';
import Redirect from 'react-router-dom/Redirect';

class Content extends Component {
    constructor(props) {
        super(props);
        this.state = { resp: '' };
    }
    render() {
        if (this.state.failed) {
            return (
                <Redirect
                    to={{
                        pathname: '/error',
                        state: { referrer: window.location.href },
                    }}
                />
            );
        }
        return <div dangerouslySetInnerHTML={{ __html: this.state.resp }} />;
    }

    componentDidMount() {
        this.updateState();
    }
    componentDidUpdate(prevProps) {
        // eslint-disable-next-line react/prop-types
        if (prevProps.location.pathname != this.props.location.pathname) {
            this.updateState();
        }
    }

    async updateState() {
        const response = await fetch(window.location.href.replace('/#', ''));
        if (response.status === 404) {
            this.setState({
                failed: true,
            });
        } else {
            this.setState({
                resp: await response.text(),
            });
        }
    }
}

class WebServer extends Component {
    render() {
        return (
            <div>
                <Route path="/www/*" component={Content} />
            </div>
        );
    }
}

export default WebServer;
