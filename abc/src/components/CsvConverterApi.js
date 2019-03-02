import React, {Component} from 'react';
import { connect } from 'react-redux';
import HeaderForApi from './ui/HeaderForApi';

class CsvConverterApi extends Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	componentWillReceiveProps(props) {
		
	}

	render() {
		return (
				<div id="wrapper">
					<HeaderForApi/>
		        	<div id="main">
						<div className="inner">CsvConverter-api: This api is under construction</div>
					</div>
				</div>
			);
	}
}

const mapStateToProps = (state) => ({
  keyword: state.keyword,
  error: state.error
})

CsvConverterApi = connect(mapStateToProps)(CsvConverterApi)
export default CsvConverterApi