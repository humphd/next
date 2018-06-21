import React, { Component } from 'react';
import Link from 'react-router-dom/Link';

class Index extends Component {
    render() {
        return (
            <ul>
                <li>
                    <Link to="/www/">/www</Link> - browse files
                </li>
                <li>
                    <a href="/terminal/">/terminal</a> - boot Linux VM
                </li>
                <li>
                    <a href="/editor/">/editor</a> - edit files
                </li>
                <li>
                    <a href="../db/index.html">/data</a> - REST API into
                    indexed.db
                </li>
                <li>
                    <a href="../db/db-mutation.html">
                        /data/{'{upload,download,reset}'}
                    </a>
                    - Reset, upload and download database.
                </li>
            </ul>
        );
    }
}

export default Index;
