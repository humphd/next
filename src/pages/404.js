import React, { Component } from 'react';

class Response404 extends Component {
    render() {
        return (
            <div>
                <h1>Not Found</h1>
                <p>
                    The requested URL{' '}
                    {this.props.location.state
                        ? this.props.location.state.referrer + ' '
                        : ''}
                    was not found on this server.
                </p>
                <hr />
                <address>nohost/0.0.2 (Web)</address>
            </div>
        );
    }
}

export default Response404;
