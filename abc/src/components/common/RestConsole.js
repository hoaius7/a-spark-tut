import React, {Component} from 'react';
import ReactJson from 'react-json-view';
import {downloadFile} from '../../utils/Download';

class RestConsole extends Component {
    state = {
        show: false
    }

    download() {
        downloadFile(this.props.metadata.name + '.json', 'text/plain', JSON.stringify(this.props.data, null, 4))
    }

    render() {
        let consoleResult = null;
        let viewLink = <a className="pointer" onClick={() => this.setState({show: true})}>View Technical Details</a>;

        if (this.state.show) {
            viewLink = <a className="pointer" onClick={() => this.setState({show: false})}>Close technical details</a>;
            consoleResult = (
                <div>
                    <div>Status: {this.props.metadata.status}, Content Type: {this.props.metadata.contentType}, Content
                        Length: {this.props.metadata.contentLength} KB, Response
                        time: {this.props.metadata.responseTime} ms
                    </div>
                    <div className="left">Raw json response:</div>
                    <div className="right"><a className="pointer" onClick={this.download.bind(this)}>Download</a></div>
                    <div className="clear">
                        <ReactJson
                            src={this.props.data}
                            name={false}
                            groupArraysAfterLength={20}
                            collapsed={false}
                            theme="flat"
                            enableClipboard={() => alert('Copied to clipboard!')}
                        />
                    </div>
                </div>
            );
        }

        return (
            <div className="console">
                <div>
                {viewLink}
                </div>
                {consoleResult}
            </div>
        );
    }
}

export default RestConsole;