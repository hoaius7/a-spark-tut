import React, {Component} from 'react'
import {connect} from 'react-redux'
import axios from 'axios';
import {
    BrowserRouter as Router,
    Route,
    Link
} from 'react-router-dom'

const username = process.env.REACT_APP_SHIPPING_USER;
const password = process.env.REACT_APP_api_password;
const apiKey = process.env.REACT_APP_api_key;
const partSearchEndpointUrl = process.env.REACT_APP_SERVER_URL_TMP + process.env.REACT_APP_PRODUCT_PANDA_TMP;

class SearchBox extends Component {
    input: HTMLInputElement;

    constructor(props) {
        super(props);
        this.state = {
            keyword: '', searching: false
        }
        const {dispatch} = props;
    }

    handleChange = (event: SyntheticKeyboardEvent<HTMLInputElement>) => {
        this.setState({keyword: event.currentTarget.value});
    }

    search(event) {

        event.preventDefault();
        this.searchProduct();
    }

    searchProduct() {
        var self = this;
        this.setState({searching: true});
        var auth = {headers: {'x-api-key': apiKey, 'x-username': username, 'x-password': password}};
        var query = {"productCodes": [this.state.keyword]};
        console.log(partSearchEndpointUrl);
        axios.post(partSearchEndpointUrl, query, auth)
            .then(res => {
                alert(partSearchEndpointUrl);
                self.props.dispatch({
                    keyword: self.state.keyword,
                    token: self.state.token,
                    type: "Search",
                    priceAndAvailability: res.data
                });
                console.log(res.data);
                self.setState({searching: false});
            }).catch(function (error) {
            console.log(error);
            self.props.dispatch({
                keyword: self.state.keyword,
                token: self.state.token,
                type: "Search",
                product: {},
                error: error
            });
            self.setState({searching: false});
        });
    }

    loadApis(apis) {
        console.log('loadapi', apis);
        this.setState({apis: apis});
    }

    render() {
        var inputStyle = {lineHeight: "initial", width: "auto"};
        var ulStyle = {display: "inline-flex"}
        var nowrapStyle = {whiteSpace: "nowrap", width: "138px"};
        var nowrapAndLessWidthStyle = {whiteSpace: "nowrap", width: "100px"};
        var nowrapAndMoreWidthStyle = {whiteSpace: "nowrap", width: "188px"};
        var waiting = {padding: "5px", display: "inline", width: "20px", margin: "20px"};
        if (this.state.searching === false) {
            waiting = {display: "none"};
        }

        var listStyle = {display: "inline"};
        var labelStyle = {padding: "5px 0px 0px 0px"};
        var mainDivStyle = {padding: "10px"};
        var searchIconStyle = {background: "none", width: "auto", padding: "0"};

        return (
            <div id="nav_main" style={mainDivStyle}>
                <ul style={ulStyle}>
                    <li>
                        <div style={labelStyle}>Search parts</div>
                    </li>
                    <li>
                        <input id="search" value={this.state.keyword} onChange={this.handleChange.bind(this)}
                               style={inputStyle} className="baseInput search_input_ie8 ui-autocomplete-input"
                               type="text" name="text" placeholder="Part number"/>
                    </li>
                    <li>
                        <input className="button absolute" onClick={this.search.bind(this)} type="image"
                               src={"https://www.aviall.com/aviallstorefront/_ui/desktop/theme-aviall/images/button/search-blue.png"}
                               alt="Search"
                               style={searchIconStyle}/>
                    </li>
                </ul>

                <div style={waiting}>
                    <img src="https://www.aviall.com/aviallstorefront/_ui/desktop/common/images/spinner.gif"/>
                </div>
            </div>

        );
    }
}

export default connect()(SearchBox);