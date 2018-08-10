/**
 * Copyright (c) 2017-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

const React = require('react');

const CompLibrary = require('../../core/CompLibrary.js');
const Container = CompLibrary.Container;
const GridBlock = CompLibrary.GridBlock;

const siteConfig = require(process.cwd() + '/siteConfig.js');

class Share extends React.Component {
    render() {
        let language = this.props.language || '';

        return (
            <div className="docMainWrapper wrapper">
                <Container className="mainContainer documentContainer postContainer">
                    <div className="post">
                        <main>
                            <header className="postHeader">
                                <h2>Start sharing</h2>
                            </header>
                            <p>Press button to start seeding files</p>
                            <input
                                type="button"
                                id="btnSeed"
                                value="Start Seed"
                            />
                            <div id="magnetProgress" />
                            <p id="magnetURI_p" />
                            <div class="magnet" ud="magnetURI" />
                            <br />
                            <hr />
                            <br />
                            <h2>Start Downloading</h2>
                            <label>Download torrent from a magnet link</label>
                            <br />
                            <br />
                            <input
                                class="magnetInput"
                                id="torrentId"
                                placeholder="magnet:"
                                required=""
                            />
                            <button id="downloadInfo">Download</button>

                            <div id="downloadInfo" class="import-status">
                                <div class="wrap">
                                    <div class="left_col">
                                        <p>Progress bar:</p>
                                        <div id="progressBar" />
                                        <br />
                                        <p>Download speed:</p>
                                        <div id="downloadSpeed" />
                                        <br />
                                        <p>Upload speed:</p>
                                        <div id="uploadSpeed" />
                                        <br />
                                        <p>Total:</p>
                                        <div id="total" />
                                        <br />
                                    </div>
                                    <div class="right_col">
                                        <p>Remining:</p>
                                        <div id="remaining" />
                                        <br />
                                        <p>Download progress:</p>
                                        <div id="downloaded" />
                                        <br />
                                        <p>Number of peers:</p>
                                        <div id="numPeers" />
                                        <br />
                                        <div id="isComplete" />
                                    </div>
                                </div>
                            </div>
                        </main>
                    </div>
                </Container>
            </div>
        );
    }
}

module.exports = Share;
