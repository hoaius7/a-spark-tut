import React, {Component, Fragment} from 'react';
import {connect} from 'react-redux';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';
import axios from 'axios';

import HeaderForApi from '../ui/HeaderForApi';
import RestConsole from '../common/RestConsole';

const PANDA_API_URL = process.env.REACT_APP_PRICE_AVAILABILITY_URL;
const ERROR_MSG_API_KEY_MISSING = process.env.REACT_APP_ERROR_API_KEY_MISSING;
const ERROR_PRODUCT_CODE_MISSING = process.env.REACT_APP_ERROR_PRODUCT_CODE_MISSING;
const ERROR_CANNOT_CONNECT_TO_SERVER = process.env.REACT_APP_ERROR_CONNECTIVITY;
const ERROR_PRODCODE_INCORRECT = process.env.REACT_APP_ERROR_PRODCODE_INCORRECT;
const ERROR_INVALID_INPUT = 'Please check your input';

const X_API_KEY=process.env.REACT_APP_X_API_KEY;
const X_USERNAME=process.env.REACT_APP_X_USERNAME;
const X_PASSWORD=process.env.REACT_APP_X_PASSWORD;
const PRODUCT_CODES=process.env.REACT_APP_PRODUCT_CODES;

const name = 'price-availability';

class ShippingEstimationApi extends Component {
    state = {
        apiKey: X_API_KEY,
        username: X_USERNAME,
        password: X_PASSWORD,
        productCodes: PRODUCT_CODES,
        searching: false,
        error: '',
        status2xx: false,
        metadata: {},
        items: [],
        currency: 'USD',
        result: {}
    };

    buildMetadata(startTime, res) {
        const endTime = new Date().getTime();
        const responseTime = endTime - startTime;
        return {
            name: name,
            responseTime: responseTime,
            status: res.status,
            contentType: res.headers['content-type'],
            contentLength: Math.floor((JSON.stringify(res.data).length / 1024) * 100) / 100
        };
    }

    validateInput() {
        if (!this.state.apiKey) {
            this.setState({
                error: ERROR_MSG_API_KEY_MISSING,
                searching: false,
                status2xx: false,
                result: {}
            });
            return false;
        }

        if (!this.state.productCodes) {
            this.setState({
                error: ERROR_PRODUCT_CODE_MISSING,
                searching: false,
                status2xx: false,
                result: {}
            });
            return false;
        }

        return true;
    }

    getPriceAndAvailability = () => {
        if (!this.validateInput()) {
            return;
        }

        const auth = {headers: {'x-api-key': this.state.apiKey, 'x-username': this.state.username, 'x-password': this.state.password}};
        const body = {
            'showNoStock': false,
            'productCodes': this.state.productCodes.split(',')
        };

        this.setState({searching: true});
        const startTime = new Date().getTime();

        axios.post(PANDA_API_URL, body, auth)
            .then(res => {
                let items = [];
                if (res.data && res.data.lineItems) {
                    items = res.data.lineItems.filter(lineItem => !lineItem.errors && lineItem.hasOwnProperty("partNumber"));
                }

                let error = '';
                let currency = 'USD';
                if (!items) {
                    error = ERROR_PRODCODE_INCORRECT;
                } else {
                    currency = res.data.currency;
                }

                this.setState({
                    error: error,
                    searching: false,
                    metadata: this.buildMetadata(startTime, res),
                    items: items,
                    status2xx: true,
                    currency: currency,
                    result: res.data
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

    buildRequest = () => {
        let waiting = null;
        if (this.state.searching) {
            waiting = (
                <img className="left" src="https://www.aviall.com/aviallstorefront/_ui/desktop/common/images/spinner.gif"/>
            );
        }

        return (
            <div className="container-request">
                <h3 className="request-info">Request</h3>
                <ul>
                    <li>
                        <label>X-API-Key</label>
                        <input type="text" value={this.state.apiKey} onChange={(event) => this.setState({apiKey: event.target.value})} />
                    </li>
                    <li>
                        <label>X-Username</label>
                        <input type="text" value={this.state.username} onChange={(event) => this.setState({username: event.target.value})} />
                    </li>
                    <li>
                        <label>X-Password</label>
                        <input type="password" value={this.state.password} onChange={(event) => this.setState({password: event.target.value})} />
                    </li>
                    <li>
                        <label>Product codes</label>
                        <input type="text" value={this.state.productCodes} onChange={(event) => this.setState({productCodes: event.target.value})} />
                    </li>
                    <li>
                        <div className="buttonContainer">
                            <input type="button" className="button left" value="Get Price and Availability"
                                   onClick={this.getPriceAndAvailability}/>
                            {waiting}
                        </div>
                    </li>
                </ul>
                <div className="padding10 clear"></div>
            </div>
        );
    }

    onRowClick = (row) => {
        this.props.history.replace('/shipping-estimation/' + row.partNumber);
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

        let tableDisplay = null;
        let currencyDisplay = null;
        if (this.state.items.length > 0) {
            currencyDisplay = (
                <div className="padding20 clear currency">Currency: {this.state.currency}</div>
            );

            const options = {
                defaultSortName: 'quantity',
                sizePerPage: 10,
                onRowClick: this.onRowClick
            };

            tableDisplay = (
                <div className="clear">
                    <BootstrapTable data={this.state.items} hover pagination search options={options} exportCSV csvFileName='Export_products.csv'>
                        <TableHeaderColumn dataField='partNumber' isKey width='200' headerAlign='center' dataAlign='center' dataSort={true}>Code</TableHeaderColumn>
                        <TableHeaderColumn dataField='supplierName' width='150' headerAlign='center' dataAlign='left' dataSort={true}>Name</TableHeaderColumn>
                        <TableHeaderColumn dataField='quantity' width='150' headerAlign='center' dataAlign='left' dataSort={true}>Part Number</TableHeaderColumn>
                        <TableHeaderColumn dataField='netPrice' width='150' headerAlign='center' dataAlign='left' dataSort={true}>Manufacturer</TableHeaderColumn>
                        <TableHeaderColumn dataField='hazmatCode' headerAlign='center'  width='140' dataAlign='right'>Hazmat Code</TableHeaderColumn>
                        <TableHeaderColumn dataField='NSN' headerAlign='center' width='130' dataAlign='right'>NSN</TableHeaderColumn>
                        <TableHeaderColumn dataField='inStock' headerAlign='center' dataAlign='center'>In Stock</TableHeaderColumn>
                    </BootstrapTable>
                </div>
            );
        }

        const metadataDisplay = this.state.metadata.hasOwnProperty('name') ? <RestConsole metadata={this.state.metadata} data={this.state.result}/> : null;

        let responseDisplay = null;
        if (errorDisplay || tableDisplay) {
            responseDisplay = (
                <div className="container-response">
                    <h3 className="response-info">Response</h3>
                    {errorDisplay}
                    <div className="clear">
                        {metadataDisplay}
                        {currencyDisplay}
                        {tableDisplay}
                    </div>
                </div>
            );
        }

        return responseDisplay;
    }

    render() {
        return (
            <Fragment>
                <HeaderForApi apiName={'Shipping Estimation Api'}
                              apiDescription={'Return Shipping Cost Estimation'}/>
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

const mapStateToProps = (state) => ({
    searching: state.searching,
    metadata: state.metadata,
    result: state.result,
    error: state.error,
    status2xx: state.status2xx
});

export default connect(mapStateToProps)(ShippingEstimationApi);