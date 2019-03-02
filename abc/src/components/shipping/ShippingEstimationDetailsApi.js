import React, {Component, Fragment} from 'react';
import axios from 'axios';

import HeaderForApi from '../ui/HeaderForApi';
import RestConsole from '../common/RestConsole';
import ShippingEstimationDetailsTable from './ShippingEstimationDetailsTable';
import ShippingEstimationDetailsChart from './ShippingEstimationDetailsChart';

const SHIPPING_URL = process.env.REACT_APP_SHIPPING_URL;
const ERROR_MSG_QUANTITY_MISSING = process.env.REACT_APP_ERROR_MSG_QUANTITY_MISSING;
const ERROR_TO_ZIP_CODE_MISSING = process.env.REACT_APP_ERROR_TO_ZIP_CODE_MISSING;
const ERROR_CANNOT_CONNECT_TO_SERVER = process.env.REACT_APP_ERROR_CONNECTIVITY;
const ERROR_INVALID_INPUT = 'Please check your input';

const X_API_KEY=process.env.REACT_APP_X_API_KEY;
const X_USERNAME=process.env.REACT_APP_X_USERNAME;
const X_PASSWORD=process.env.REACT_APP_X_PASSWORD;

class ShippingEstimationDetailsApi extends Component {
    state = {
        apiKey: X_API_KEY,
        username: X_USERNAME,
        password: X_PASSWORD,
        searching: false,
        quantity: '',
        fromZipCode: '98059',
        toZipCode: '75019',
        expectedDeliveryDate: '2019-02-28T00:00:00Z',
        result: [],
        viewResult: 'table',
        metadata: {}
    };

    buildMetadata(startTime, res) {
        const endTime = new Date().getTime();
        const responseTime = endTime - startTime;
        return {
            name: 'price-availability',
            responseTime: responseTime,
            status: res.status,
            contentType: res.headers['content-type'],
            contentLength: Math.floor((JSON.stringify(res.data).length / 1024) * 100) / 100
        };
    }

    validateInput() {
        if (!this.state.quantity) {
            this.setState({
                error: ERROR_MSG_QUANTITY_MISSING,
                searching: false,
                status2xx: false,
                result: {}
            });
            return false;
        }

        if (!this.state.toZipCode) {
            this.setState({
                error: ERROR_TO_ZIP_CODE_MISSING,
                searching: false,
                status2xx: false,
                result: {}
            });
            return false;
        }

        return true;
    }

    getShippingEstimation = () => {
        if (!this.validateInput()) {
            return;
        }

        const auth = {headers: {'x-api-key': this.state.apiKey, 'x-username': this.state.username, 'x-password': this.state.password}};
        const body = {
            'productCode': this.props.match.params.id,
            'orderQuantity': +this.state.quantity,
            'expectedDeliveryDate': this.state.expectedDeliveryDate,
            'shipFrom': this.state.fromZipCode,
            'shipTo': this.state.toZipCode
        };

        this.setState({searching: true});
        const startTime = new Date().getTime();

        axios.post(SHIPPING_URL, body, auth)
            .then(res => {
                this.setState({
                    result: res.data
                });

                this.setState({
                    error: '',
                    searching: false,
                    metadata: this.buildMetadata(startTime, res),
                    status2xx: true,
                });

            })
            .catch(error => {
                if (error.response && error.response.data) {
                    let errorMessage = "Error message: " + error.response.status;
                    if (error.response.data.message) {
                        errorMessage = errorMessage + ": " + error.response.data.message;
                    }
                    if (error.response.data.description) {
                        errorMessage = errorMessage + ": " + error.response.data.description;
                    }

                    this.setState({
                        error: errorMessage,
                        searching: false,
                        metadata: this.buildMetadata(startTime, error.response),
                        result: {},
                        status2xx: false
                    });
                } else {
                    this.setState({
                        error: ERROR_CANNOT_CONNECT_TO_SERVER,
                        searching: false,
                        status2xx: false,
                        result: {}
                    });
                }
            });
    }

    goBack = () => {
        this.props.history.replace('/shipping-estimation');
    }

    buildRequest = () => {
        let waiting = null;
        if (this.state.searching) {
            waiting = (
                <img className="left" style={waiting}
                     src="https://www.aviall.com/aviallstorefront/_ui/desktop/common/images/spinner.gif"/>
            );
        }

        return (
            <div className="container-request">
                <h3 className="request-info">Request</h3>
                <ul>
                    <li>
                        <label>Part Number</label>
                        <input type="text" value={this.props.match.params.id} disabled />
                    </li>
                    <li>
                        <label>Order Quantity</label>
                        <input type="text" value={this.state.quantity} onChange={(event) => this.setState({quantity: event.target.value})} />
                    </li>
                    <li>
                        <label>Ship From</label>
                        <input type="text" value={this.state.fromZipCode} onChange={(event) => this.setState({fromZipCode: event.target.value})} />
                    </li>
                    <li>
                        <label>Ship To</label>
                        <input type="text" value={this.state.toZipCode} onChange={(event) => this.setState({toZipCode: event.target.value})} />
                    </li>
                    <li>
                        <label>Expected Delivery Date</label>
                        <input type="text" value={this.state.expectedDeliveryDate} onChange={(event) => this.setState({expectedDeliveryDate: event.target.value})} />
                    </li>
                    <li>
                        <div className="buttonContainer">
                            <input type="button" className="button left" value="Shipping Estimate"
                                   onClick={this.getShippingEstimation}/>
                            {waiting}
                        </div>
                    </li>
                </ul>
                <div className="clear"></div>
                <p>
                    <button className="left" onClick={this.goBack}>&#8249;</button>
                </p>
                <div className="clear"></div>
            </div>
        );
    }

    buildResponse = () => {
        if (this.state.searching) {
            return null;
        }

        let errorDisplay = null;
        if (this.state.error) {
            errorDisplay = (
                <div className="error">
                    {this.state.error}
                </div>
            );
        }

        const metadataDisplay = this.state.metadata.hasOwnProperty('name') ? <RestConsole metadata={this.state.metadata} data={this.state.result}/> : null;

        let viewResult = null;
        if (this.state.result.length > 0) {
            if (this.state.viewResult === 'table') {
                viewResult = (
                    <div>
                        <ShippingEstimationDetailsTable data={this.state.result}/>
                        <a className="pointer" onClick={() => this.setState({viewResult: 'chart'})}>View Chart</a>
                    </div>
                );
            } else if (this.state.viewResult === 'chart') {
                viewResult = (
                    <div>
                        <ShippingEstimationDetailsChart data={this.state.result}/>
                        <a className="pointer" onClick={() => this.setState({viewResult: 'table'})}>View Table</a>
                    </div>
                );
            }
        }

        let responseDisplay = null;
        if (errorDisplay || viewResult) {
            responseDisplay = (
                <div className="container-response">
                    <h3 className="response-info">Response</h3>
                    {errorDisplay}
                    <div className="clear">
                        {metadataDisplay}
                        {viewResult}
                    </div>
                </div>
            );
        }

        return responseDisplay;
    }

    render() {
        return (
            <Fragment>
                <HeaderForApi apiName={'Shipping Estimation Api 2'}
                              apiDescription={'Return Shipping Cost Estimation 2'}/>
                <div id="main">
                    <div className="apicontainer inner">
                        {this.buildRequest()}
                        {this.buildResponse()}
                    </div>
                </div>
            </Fragment>
        );
    }
}

export default ShippingEstimationDetailsApi;