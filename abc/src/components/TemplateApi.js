import React, {Component} from 'react';
import { connect } from 'react-redux';
import HeaderForApi from './ui/HeaderForApi';
import RestConsole from './common/RestConsole';

import axios from 'axios';
import {BootstrapTable, TableHeaderColumn} from 'react-bootstrap-table';


class TemplateApi extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	
	buildMetadata(startTime, res) {
		var endTime = new Date().getTime();
		var responseTime = endTime - startTime;
		return {name: 'Template api', responseTime: responseTime, status: res.status, contentType: res.headers['content-type'], contentLength: Math.floor((JSON.stringify(res.data).length / 1024) * 100)/100};
	}

	formatFont(cell, row) {   // String example
	  return `<p  style='font-size: 18px'>${cell}</p>`;
	}

	invokeAPI() {
		var apiKey = this.refs.apiKey.value;
		var supplier = this.refs.supplier.value.toLowerCase();

		var self = this;
		var auth = {headers: {'x-api-key': apiKey}};
		var apiUrl = partsOfSupplierEndpoint + "/" + supplier;
		
		self.props.dispatch({type: "invokeAPI", error: "", invokeApiProgress: "inprogress"});

		var startTime = new Date().getTime();

		axios.get(apiUrl, auth)
			.then(res => {
				self.props.dispatch({type: "invokeAPI", parts: self.formatLocationQuantities(res.data), rawData: res.data, metadata: self.buildMetadata(startTime, res), error: "", invokeApiProgress: "done"});
			}).catch(function (error) {
				if (error.response && error.response.data) {
					var errorMessage = "Error message: " + error.response.status;
					if (error.response.data.message) {
						errorMessage = errorMessage + ": " + error.response.data.message;
					}
					if (error.response.data.description) {
						errorMessage = errorMessage + ": " + error.response.data.description;
					}
					self.props.dispatch({type: "invokeAPI", error: errorMessage, rawData: error.response.data, metadata: self.buildMetadata(startTime, error.response), invokeApiProgress: "done"});	
				} else {
					self.props.dispatch({type: "invokeAPI", error: 'Cannot talk with server', invokeApiProgress: "done"});	
				}
	   		});
	}

	loadApis(apis) {
			console.log('loadapi', apis);
			this.setState({apis: apis});
	}
	
	render() {
		var waiting = {display: "none"};
		var showContent = {display: "none"};
		if (this.props && this.props.invokeApiProgress === "inprogress") {
			waiting = {display: "block"};
			showContent = {display: "none"};
		}
		if (this.props && this.props.invokeApiProgress === "done") {
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
					<HeaderForApi apiName={'Template Api'} apiDescription={'This is description for API template'}  apis={this.loadApis.bind(this)}/>
		        	<div id="main">
		        		<div className="apicontainer inner">
							<div className="container-request">
								<h3 className="request-info">Request</h3>
								<ul>
									<li><label>URL</label>{partsOfSupplierEndpoint}/&#123;Supplier&#125;</li>
									<li><label>Method</label>GET</li>
									<li><label>X-Api-Key</label> <input type="text" ref="apiKey"/></li>
									<li><label>Supplier</label> <input type="text" ref="supplier"/></li>
								    <li>
								    	<div className="buttonContainer">
									    	<input type="button" className="button left" value="Get Inventory" onClick={this.invokeAPI.bind(this)}/>
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
									<RestConsole metadata={metadata} data={this.props.rawData} />
									<div className="padding20 clear"> </div>
									<BootstrapTable data={this.props.rawData} striped hover pagination search options={ options } exportCSV csvFileName='Export_parts.csv'>
										<TableHeaderColumn isKey dataField='aviall_partnumber' width='150' headerAlign='center' dataAlign='center'>Aviall Part</TableHeaderColumn>
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
	invokeApiProgress: state.invokeApiProgress,
    error: state.error
})

TemplateApi = connect(mapStateToProps)(TemplateApi)
export default TemplateApi