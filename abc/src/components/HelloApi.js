import React, {Component} from 'react';
import { connect } from 'react-redux';
import HeaderForApi from './ui/HeaderForApi';

class HelloApi extends Component {
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
						<div className="inner">hello api</div>
					</div>
				</div>
			);
	}
}

const mapStateToProps = (state) => ({
  keyword: state.keyword,
  error: state.error
})

HelloApi = connect(mapStateToProps)(HelloApi)
export default HelloApi