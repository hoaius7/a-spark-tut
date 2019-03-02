import React, {Component} from 'react';
import { connect } from 'react-redux';
import HeaderForApi from './ui/HeaderForApi';
import axios from 'axios';

var retries = 0;
const MAX_RETRIES = 3;
class JsonConverterApi extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillReceiveProps(props) {
	}
	
	loadApis(apis) {
		console.log('loadapi', apis);
		this.setState({apis: apis});
	}

	convertJson() {
		retries++;
		var jsonConverterEndpoint = '';
		if (this.state.apis && this.state.apis['json-converter-api']) {
			jsonConverterEndpoint = this.state.apis['json-converter-api'].endpoint;	
		}
		var self = this;
		var auth = {headers: {'x-api-key': this.refs.apiKey.value}};
		var input = "";
		try {
			input = JSON.parse(this.refs.input.value);
		} catch(e) {
			alert('Invalid json input, please check json format');
			return;
		}
		var spec = "";
		try {
			spec = JSON.parse(this.refs.spec.value);
		} catch(e) {
			alert('Invalid spec input, please check json format');
			return;
		}
		this.setState({output: ''});
		var body = {"input": input, "spec": spec};
		axios.post(jsonConverterEndpoint, body, auth)
			.then(res => {
				this.setState({output: JSON.stringify(res.data, null, 4)});
			}).catch(function (error) {
				console.log(error)
				if (retries < MAX_RETRIES) {
					self.convertJson();
				} else {
					retries = 0;
					if (error.response && error.response.data) {
						var errorMessage = "Error message: " + error.response.status;
						if (error.response.data.message) {
							errorMessage = errorMessage + ": " + error.response.data.message;
						}
						if (error.response.data.description) {
							errorMessage = errorMessage + ": " + error.response.data.description;
						}
						alert(errorMessage);
					} else {
						alert('Cannot talk with server');
					}
				}
	  		});	

	}

	render() {
		var jsonConverterEndpoint = '';
		if (this.state.apis && this.state.apis['json-converter-api']) {
			jsonConverterEndpoint = this.state.apis['json-converter-api'].endpoint;	
		}
		return (
				<div id="wrapper">
					<HeaderForApi apiName={'Json Converter Api'}  apiDescription={'Convert JSON to JSON using Jolt spec'} apis={this.loadApis.bind(this)}/>
		        	<div id="main">
						<div className="apicontainer inner">
							<div className="container-request padding10">
								<ul>
									<li><label>URL</label>{jsonConverterEndpoint}</li>
									<li><label>Method</label>POST</li>
									<li><label>X-Api-Key</label> <input type="text" ref="apiKey"/></li>
									<li>
								    	<div className="buttonContainer">
									    	<input type="button" className="button left" value="Transform" onClick={this.convertJson.bind(this)}/>
										</div>
								    </li>
								</ul>
								<div className="padding10 clear"> </div>
								<table>
								<thead>
									<tr>
										<td>Input</td>
										<td>Spec</td>
										<td>Result</td>
									</tr>
								</thead>
								<tbody>
									<tr>
										<td><textarea rows="20" cols="50" value={this.state.input} ref="input"/></td>
										<td><textarea rows="20" cols="50" value={this.state.spec} ref="spec"/></td>
										<td><textarea rows="20" cols="50" value={this.state.output} onClick={this.convertJson.bind(this)} ref="output"/></td>
									</tr>	
								</tbody>
							</table>
							</div>
							
						</div>
					</div>
				</div>
			);
	}
}

const mapStateToProps = (state) => ({
  keyword: state.keyword,
  error: state.error
})

JsonConverterApi = connect(mapStateToProps)(JsonConverterApi)
export default JsonConverterApi