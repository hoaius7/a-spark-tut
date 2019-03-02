import React, {Component} from 'react';
import { connect } from 'react-redux';
import HeaderForApi from './ui/HeaderForApi';
import RestConsole from './common/RestConsole';

import axios from 'axios';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';

class SupplierApi extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	formatLocationQuantities(data) {
		var formattedData = [];
		data.forEach(function(item) {
			var newItem = Object.assign({}, item);
			if (newItem.locationQuantities) {
				newItem.locationQuantities = JSON.stringify(newItem.locationQuantities).replace("{","").replace("}","").replace(/"/g, "");	
			}
			formattedData.push(newItem);
		});
		return formattedData;
	}

	productFormatter(cell, row) {   // String example
	  return `<a  title='View detail' href='https://www.aviall.com/aviallstorefront/p/${cell}' target='_blank'>${cell}</a>`;
	}

	buildMetadata(startTime, res) {
		var endTime = new Date().getTime();
		var responseTime = endTime - startTime;
		return {name: this.refs.supplier.value, responseTime: responseTime, status: res.status, contentType: res.headers['content-type'], contentLength: Math.floor(JSON.stringify(res.data).length / 1024)};
	}

	formatFont(cell, row) {   // String example
	  return `<p  style='font-size: 18px'>${cell}</p>`;
	}

	showInventory() {
		var partsOfSupplierEndpoint = '';
		if (this.state.apis && this.state.apis['supplier-api']) {
			partsOfSupplierEndpoint = this.state.apis['supplier-api'].endpoint;	
		}
		var apiKey = this.refs.apiKey.value;
		var supplier = this.refs.supplier.value.toLowerCase();

		var self = this;
		var auth = {headers: {'x-api-key': apiKey}};
		var apiUrl = partsOfSupplierEndpoint + "/" + supplier;
		
		self.props.dispatch({type: "PartsOfSupplier", error: "", getInventory: "inprogress"});

		var startTime = new Date().getTime();

		axios.get(apiUrl, auth)
			.then(res => {
				self.props.dispatch({type: "PartsOfSupplier", parts: self.formatLocationQuantities(res.data), rawData: res.data, metadata: self.buildMetadata(startTime, res), error: "", getInventory: "done"});
			}).catch(function (error) {
				if (error.response && error.response.data) {
					var errorMessage = "Error message: " + error.response.status;
					if (error.response.data.message) {
						errorMessage = errorMessage + ": " + error.response.data.message;
					}
					if (error.response.data.description) {
						errorMessage = errorMessage + ": " + error.response.data.description;
					}
					self.props.dispatch({type: "PartsOfSupplier", error: errorMessage, rawData: error.response.data, metadata: self.buildMetadata(startTime, error.response), getInventory: "done"});	
				} else {
					self.props.dispatch({type: "PartsOfSupplier", error: 'Cannot talk with server', getInventory: "done"});	
				}
	   		});
	}

	loadApis(apis) {
		console.log('loadapi', apis);
		this.setState({apis: apis});
	}

	render() {
		var partsOfSupplierEndpoint = '';
		if (this.state.apis && this.state.apis['supplier-api']) {
			partsOfSupplierEndpoint = this.state.apis['supplier-api'].endpoint;	
		}
		var waiting = {display: "none"};
		var showContent = {display: "none"};
		if (this.props && this.props.getInventory === "inprogress") {
			waiting = {display: "block"};
			showContent = {display: "none"};
		}
		if (this.props && this.props.getInventory === "done") {
			showContent = {display: "block"};
		}

		var errorMessage = "";
		if (this.props.error) {
			errorMessage = this.props.error;
		}
		const options = {
		    defaultSortName: 'quantity',
		    sizePerPage: 50
		  };

		var metadata = this.props.metadata ? this.props.metadata : {};

		return (
				<div id="wrapper">
					<HeaderForApi apiName={'Supplier Api'} apiDescription={'Lookup Supplier Parts in Aviall Inventory by Location'} apis={this.loadApis.bind(this)}/>
		        	<div id="main">
		        		<div className="apicontainer inner">
							<div className="container-request">
								<h3 className="request-info">Request</h3>
								<ul>
									<li><label>URL</label>{partsOfSupplierEndpoint}/&#123;supplier&#125;</li>
									<li><label>Method</label>GET</li>
									<li><label>X-Api-Key</label> <input type="text" ref="apiKey"/></li>
									<li><label>Supplier</label> <input type="text" ref="supplier"/></li>
								    <li>
								    	<div className="buttonContainer">
									    	<input type="button" className="button left" value="Get Inventory" onClick={this.showInventory.bind(this)}/>
									    	<img className="left" alt="waiting..." style={waiting} src="https://www.aviall.com/aviallstorefront/_ui/desktop/common/images/spinner.gif"/>
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
									<RestConsole metadata={metadata} data={this.props.rawData} />
									<div className="padding20 clear"> </div>
									<BootstrapTable data={this.props.parts} striped hover pagination search options={ options } exportCSV csvFileName='Export_parts.csv'>
										<TableHeaderColumn isKey dataField='aviall_partnumber' dataFormat={ this.productFormatter }  width='150' headerAlign='center' dataAlign='center'>Aviall Part</TableHeaderColumn>
										<TableHeaderColumn dataField='supplier_partnumber' headerAlign='center' width='150' dataAlign='center'>Supplier Part</TableHeaderColumn>
										<TableHeaderColumn dataField='quantity' headerAlign='center' dataAlign='right' width='100' dataSort={ true }>Quantity</TableHeaderColumn>
										<TableHeaderColumn dataField='locationQuantities' dataFormat={ this.formatFont } headerAlign='center' dataAlign='left' width='450' dataSort={ true }>Location:Quantity</TableHeaderColumn>
										<TableHeaderColumn dataField='modified_time' dataFormat={ this.formatFont } headerAlign='center' width='250' dataAlign='center' dataSort={ true }>Last Updated</TableHeaderColumn>
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
	parts: state.parts,
	rawData: state.rawData,
	metadata: state.metadata,
	getInventory: state.getInventory,
    error: state.error
})

SupplierApi = connect(mapStateToProps)(SupplierApi)
export default SupplierApi