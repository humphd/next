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
        const supportLinks = [
            {
                content: 'Download files from your peers',
                title: 'Import',
                image: siteConfig.baseUrl + '/img/import.svg',
                imageLink: 'www.google.ca',
            },
            {
                content: 'Seed your files<br/><img src="/img/export.svg">',
                title: 'Export',
                image: siteConfig.baseUrl + '/img/export.svg',
                imageLink: siteConfig.baseUrl + 'docs/introduction.html',
            },
        ];

        return (
            <div className="docMainWrapper wrapper">
                <Container className="mainContainer documentContainer postContainer">
                    <div className="post">
                        <header className="postHeader">
                            <h2>Share</h2>
                        </header>
                        <p>
                            This project is maintained by a dedicated group of
                            people.
                        </p>
                        <GridBlock
                            contents={supportLinks}
                            layout="threeColumn"
                        />
                    </div>
                </Container>
            </div>
        );
    }
}

module.exports = Share;
