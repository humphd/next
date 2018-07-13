import React, { Component } from 'react';
import { Route, Redirect, Link } from 'react-router-dom';

import { isMedia, isImage } from '../web-server/content-type';
import iconImage from '../web-server/icons/image2.png';
import iconFolder from '../web-server/icons/folder.png';
import iconMovie from '../web-server/icons/movie.png';
import iconText from '../web-server/icons/text.png';
import iconBack from '../web-server/icons/back.png';
import iconBlank from '../web-server/icons/blank.png';
import path from '../lib/path';

class Content extends Component {
    constructor(props) {
        super(props);
        this.state = { resp: [] };
        this.months = [
            'Jan',
            'Feb',
            'Mar',
            'Apr',
            'May',
            'Jun',
            'Jul',
            'Aug',
            'Sep',
            'Oct',
            'Nov',
            'Dec',
        ];
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
        const dirPath = window.location.pathname.match(/^\/www(\/.*)/)[1];
        const parent = path.dirname(dirPath);
        return (
            <div>
                <h1>Index of {location.pathname}</h1>
                <table>
                    <tr>
                        <th>
                            <img src={iconBlank} alt="[ICO]" />
                        </th>
                        <th>
                            <b>Name</b>
                        </th>
                        <th>
                            <b>Last modified</b>
                        </th>
                        <th>
                            <b>Size</b>
                        </th>
                        <th>
                            <b>Description</b>
                        </th>
                    </tr>
                    <tr>
                        <th colSpan="5">
                            <hr />
                        </th>
                    </tr>
                    <tr>
                        <td valign="top">
                            <img src={iconBack} alt="[DIR]" />
                        </td>
                        <td>
                            <Link to={`/www${parent}`}>Parent Directory</Link>
                        </td>
                        <td>&nbsp;</td>
                        <td align="right"> - </td>
                        <td>&nbsp;</td>
                    </tr>
                    {this.state.resp.map(entry => {
                        const ext = path.extname(entry.name);
                        const href = '/www' + path.join(dirPath, entry.name);
                        let icon;
                        let alt;

                        if (entry.type === 'DIRECTORY') {
                            icon = iconFolder;
                            alt = '[DIR]';
                        } else {
                            if (isImage(ext)) {
                                icon = iconImage;
                                alt = '[IMG]';
                            } else if (isMedia(ext)) {
                                icon = iconMovie;
                                alt = '[MOV]';
                            } else {
                                icon = iconText;
                                alt = '[TXT]';
                            }
                        }
                        return (
                            <tr key={entry.name + entry.size + entry.mtime}>
                                <td valign="top">
                                    <img src={icon} alt={alt} />
                                </td>
                                <td>
                                    {entry.type === 'DIRECTORY' ? (
                                        <Link to={href}>{entry.name}</Link>
                                    ) : (
                                        <a href={`${href}?raw=true`}>
                                            {entry.name}
                                        </a>
                                    )}
                                </td>
                                <td align="right">
                                    {this.formatDate(new Date(entry.mtime))}
                                </td>
                                <td align="right">
                                    {this.formatSize(entry.size)}
                                </td>
                                <td>&nbsp;</td>
                            </tr>
                        );
                    })}
                    <tr>
                        <th colSpan="5">
                            <hr />
                        </th>
                    </tr>
                </table>
                <address>nohost/0.0.2 (Web)</address>
            </div>
        );
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
        const response = await fetch(`${window.location.href}?raw=true`);
        if (response.status === 404) {
            this.setState({
                failed: true,
            });
        } else {
            this.setState({
                resp: await response.json(),
            });
        }
    }

    // 20-Apr-2004 17:14
    formatDate(d) {
        return `${d.getDate()}-${
            this.months[d.getMonth()]
        }-${d.getFullYear()} ${d.getHours()}:${d.getMinutes()}`;
    }

    formatSize(s) {
        const units = ['', 'K', 'M'];
        if (!s) {
            return '-';
        }
        const i = Math.floor(Math.log(s) / Math.log(1024)) | 0;
        return Math.round(s / Math.pow(1024, i), 2) + units[i];
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
