import React, {Component} from 'react';
import { connect } from 'react-redux';
import HeaderForApi from './ui/HeaderForApi';


import RestConsole from './common/RestConsole';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

import axios from 'axios';

const PANDA_API_URL = process.env.REACT_APP_PRICE_AVAILABILITY_URL;

const ERROR_MSG_API_KEY_MISSING  = process.env.REACT_APP_ERROR_API_KEY_MISSING ;
const ERROR_PRODUCT_CODE_MISSING = process.env.REACT_APP_ERROR_PRODUCT_CODE_MISSING ;
const ERROR_CANNOT_CONNECT_TO_SERVER = process.env.REACT_APP_ERROR_CONNECTIVITY ;

const ERROR_INVALID_INPUT = 'Please check your input' ;

class PriceAvailabilityApi extends Component {
	constructor(props) {
		super(props);
		this.state = { url: PANDA_API_URL, error:'', status2xx:false};
	}

	locationQuantitiesFormatter(cell, row) {
		var formattedData = [];
		cell.forEach(function(item) {
			formattedData.push(item.location + ":" + item.availQuantity);
		});
		return formattedData.join(";");
	}

	productFormatter(cell, row) {
	  return `<a  title='View detail' href='https://www.aviall.com/aviallstorefront/p/${cell}' target='_blank'>${cell}</a>`;
	}

	buildMetadata(startTime, res) {
		var endTime = new Date().getTime();
		var responseTime = endTime - startTime;
		return {name: 'price-availability', responseTime: responseTime, status: res.status, contentType: res.headers['content-type'], contentLength: Math.floor((JSON.stringify(res.data).length / 1024) * 100)/100};
	}


	validateInput(){
		var isContinued = true ;

		if(this.refs.apiKey.value === ""){
			this.refs.errorMessage = ERROR_MSG_API_KEY_MISSING ;

			isContinued = false ; 
			this.props.dispatch({type: "Search", error: ERROR_MSG_API_KEY_MISSING, searching: false, status2xx:false});	
		} else if(this.refs.productCodes.value === ""){
			
			this.refs.errorMessage = ERROR_PRODUCT_CODE_MISSING ;

			isContinued = false ; 
			this.props.dispatch({type: "Search", error: ERROR_PRODUCT_CODE_MISSING, searching: false, status2xx:false});	
		}

		return isContinued; 
	}

	getPriceAndAvailability() {

		var priceAvailabilityEndpoint = this.state.url ;

		var isContinued = this.validateInput() ; 

		if (isContinued) {

			var self = this;
			var auth = {headers: {'x-api-key': this.refs.apiKey.value, 'x-username': this.refs.username.value,'x-password': this.refs.password.value}};
			var body = { "showNoStock": this.refs.shownostock.checked,"productCodes": this.refs.productCodes.value.split(",")};
			self.props.dispatch({type: "Search", searching: true});
			var startTime = new Date().getTime();
			
			axios.post(priceAvailabilityEndpoint, body, auth)
				.then(res => {
					console.log(res);
					self.props.dispatch({type: "Search", searching: false, metadata: self.buildMetadata(startTime, res), result: res.data, status2xx:true});

				}).catch(function (error) {

					if (error.response && error.response.data) {
						var errorMessage = "Error message: " + error.response.status;
						if (error.response.data.message) {
							errorMessage = errorMessage + ": " + error.response.data.message;
						}
						if (error.response.data.description) {
							errorMessage = errorMessage + ": " + error.response.data.description;
						}
						if (error.response.status  == '403') {
							errorMessage = "API key or credentials info is incorrect" ;
						} else {
							errorMessage = ERROR_INVALID_INPUT ;
						}
		
						self.props.dispatch({type: "Search", searching: false, metadata: self.buildMetadata(startTime, error.response), result: {}, error: errorMessage, status2xx:false});
					} else {
		
						self.props.dispatch({type: "Search", error: ERROR_CANNOT_CONNECT_TO_SERVER, searching: false, status2xx:false});	
					}
		  		});	
		}
		

	}

	
	render() {
		var pandAendpoint = this.state.url ;

		/*
		if (this.state.apis && this.state.apis['price-availability-api']) {
			priceAvailabilityEndpoint = this.state.apis['price-availability-api'].endpoint;	
		}
		/*
	/* local style Start */	
		var checkboxStyle = {width: "20px", opacity:1, height:"20px"} ; 
		var styleCurrency = {padding: "1px", float:"right", color:"#0095da"} ; 
	/* local style End */		
		var waiting = {display: "none"};
		var showContent = {display: "none"};
		if (this.props && this.props.searching === true) {
			waiting = {display: "block"};
			showContent = {display: "none"};
		}
		if (this.props && this.props.searching === false) {
			showContent = {display: "block"};
		}

		var noDisplay = {display: "none"} ;

		var errorMessage = "";
		if (this.props.error) {
			errorMessage = this.props.error;
			
			styleCurrency = {display: "none"} ;
		}

		const options = {
		    defaultSortName: 'quantity',
		    sizePerPage: 50
		  };

		var metadata = this.props.metadata ? this.props.metadata : {};
		var items = [];
		var currency = "USD";
		if (this.props.result && this.props.result.lineItems) {
			currency = this.props.result.currency;
			this.props.result.lineItems.forEach(function(item) {
				var newItem = Object.assign({}, item);
				//newItem.netPrice = newItem.netPrice + currency;
				if (!newItem.errors && (newItem.hasOwnProperty("partNumber")))	 {
					//console.log(newItem) ;
					items.push(newItem);
					errorMessage = "" ; 
				}
			});
			
		}

		if (this.props.status2xx && items.length === 0) {
			errorMessage = process.env.REACT_APP_ERROR_PRODCODE_INCORRECT ; 
		}

		return (
				<div id="wrapper">
					<HeaderForApi apiName={'Price Availability Api'} apiDescription={'Return price and availability of products'} />
		        	<div id="main">
		        		<div className="apicontainer inner">
							<div className="container-request">
								<h3 className="request-info">Request</h3>
								<ul>
									<li><label>X-API-Key</label> <input type="text" ref="apiKey"/></li>
									<li><label>X-Username</label> <input type="text" ref="username"/></li>
									<li><label>X-Password</label> <input type="password" ref="password"/></li>
									<li><label>Product codes</label> <input type="text" ref="productCodes"/></li>
									<li className="PandACheckbox"> <label>Show out-of-stock items </label>
										<input type="checkbox" ref="shownostock"
										 id="showall" style={checkboxStyle}	/>
									 </li>									
								    <li>
								    	<div className="buttonContainer">
									    	<input type="button" className="button left" value="Get Price and Availability" onClick={this.getPriceAndAvailability.bind(this)}/>
									    	<img className="left" style={waiting} src="https://www.aviall.com/aviallstorefront/_ui/desktop/common/images/spinner.gif"/>
										</div>
								    </li>
								</ul>
								<div className="padding10 clear"> </div>
							</div>
							<div style={showContent} className="container-response">
								<h3 className="response-info">Response</h3>
								<div className="error">
									{errorMessage}
								</div>
								<div className="clear">
									<RestConsole metadata={metadata} data={this.props.result} />
									<div className="padding20 clear" style={styleCurrency}>Currency: USD </div>
									<BootstrapTable data={items} striped hover pagination search options={ options } exportCSV csvFileName='Export_parts.csv'>
										<TableHeaderColumn dataField='partNumber' isKey={true} headerAlign='center' dataFormat={ this.productFormatter }  width='150' dataAlign='center'>Part Number</TableHeaderColumn>
										<TableHeaderColumn dataField='supplierName' headerAlign='center' width='150' dataAlign='left'>Supplier Name</TableHeaderColumn>
										<TableHeaderColumn dataField='inStock' headerAlign='center' dataAlign='center'>InStock</TableHeaderColumn>
										<TableHeaderColumn dataField='quantity' headerAlign='center' dataAlign='right' dataSort={ true }>Quantity</TableHeaderColumn>
										<TableHeaderColumn dataField='netPrice' headerAlign='center' dataAlign='right' dataSort={ true }>Net Price</TableHeaderColumn>
										<TableHeaderColumn dataField='hazmatCode' headerAlign='center'  width='140' dataAlign='right'>Hazmat Code</TableHeaderColumn>
										<TableHeaderColumn dataField='NSN' headerAlign='center' width='130' dataAlign='right'>NSN</TableHeaderColumn>
										{ /* 
			
										<TableHeaderColumn dataField='netPrice' dataFormat={ this.priceFormatter} headerAlign='center' dataAlign='right' dataSort={ true }>Net Price</TableHeaderColumn> -- original price column with price Formatter
										
										<TableHeaderColumn dataField='locationAvailabilities' dataFormat={ this.locationQuantitiesFormatter } headerAlign='center' dataAlign='right' width='250'>Location:Quantity</TableHeaderColumn> */ }
									</BootstrapTable>
								</div>
							</div>
						</div>
					</div>	
				</div>
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

PriceAvailabilityApi = connect(mapStateToProps)(PriceAvailabilityApi)
export default PriceAvailabilityApi