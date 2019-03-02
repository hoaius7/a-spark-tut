import React, {Fragment, useState} from 'react';
import axios from 'axios';
import {AsyncTypeahead} from 'react-bootstrap-typeahead';

import ProductSearchTable from './ProductSearchTable';
import HeaderForApi from '../ui/HeaderForApi';
import RestConsole from '../common/RestConsole';
import ProductMenuItem from './ProductMenuItem';

const PRODUCT_SEARCH_API_URL = process.env.REACT_APP_PRODUCT_SEARCH_API_URL;
const ERROR_MSG_API_KEY_MISSING  = process.env.REACT_APP_ERROR_API_KEY_MISSING;
const ERROR_PRODUCT_CODE_MISSING = process.env.REACT_APP_ERROR_PRODUCT_CODE_MISSING;
const ERROR_PRODUCT_CODE_INCORRECT = process.env.REACT_APP_ERROR_PRODUCT_CODE_INCORRECT;
const ERROR_CANNOT_CONNECT_TO_SERVER = process.env.REACT_APP_ERROR_CONNECTIVITY;
const DEFAULT_SIZE_PER_PAGE = process.env.REACT_APP_DEFAULT_SIZE_PER_PAGE;

const productSearchApi = () => {
    const [apiKey, setApiKey] = useState('');
    const [productCodes, setProductCodes] = useState('');
    const [status2xx, setStatus2xx] = useState(false);
    const [error, setError] = useState('');
    const [metadata, setMetadata] = useState({});
    const [result, setResult] = useState({});
    const [sizePerPage, setSizePerPage] = useState(+DEFAULT_SIZE_PER_PAGE);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState([]);

    const buildMetadata = (startTime, res) => {
        return {
            name: 'product-search',
            responseTime: (new Date().getTime()) - startTime,
            status: res.status,
            contentType: res.headers['content-type'],
            contentLength: Math.floor((JSON.stringify(res.data).length / 1024) * 100) / 100
        };
    }

    const validateInput = () => {
        if (!apiKey) {
            setError(ERROR_MSG_API_KEY_MISSING);
            setIsLoading(false);
            setStatus2xx(false);
            setResult({});
            return false;
        }

        if (!productCodes) {
            setError(ERROR_PRODUCT_CODE_MISSING);
            setIsLoading(false);
            setStatus2xx(false);
            setResult({});
            return false;
        }

        return true;
    }

    const searchProducts = () => {
        if (!validateInput()) {
            return;
        }

        const auth = {headers: {'x-api-key': apiKey}};
        let url = PRODUCT_SEARCH_API_URL
            + '?query=' + productCodes
            + '&currentPage=' + (currentPage - 1)
            + '&pageSize=' + (sizePerPage ? sizePerPage : 10);

        setIsLoading(true);
        setCurrentPage(1);
        const startTime = new Date().getTime();

        axios.get(url, auth)
            .then(res => {
                setError('');
                setIsLoading(false);
                setMetadata(buildMetadata(startTime, res));
                setResult(res.data);
                setStatus2xx(true);
            })
            .catch(err => {
                if (err.response && err.response.data) {
                    let errorMessage = "Error message: " + err.response.status;
                    if (err.response.data.message) {
                        errorMessage = errorMessage + ": " + err.response.data.message;
                    }
                    if (err.response.data.description) {
                        errorMessage = errorMessage + ": " + err.response.data.description;
                    }
                    setError(errorMessage);
                    setIsLoading(false);
                    setMetadata(buildMetadata(startTime, err.response));
                    setResult([]);
                    setStatus2xx(false);
                } else {
                    setError(ERROR_CANNOT_CONNECT_TO_SERVER);
                    setIsLoading(false);
                    setResult([]);
                    setStatus2xx(false);
                }
            });
    }

    const searchProducts2 = (page, sizePerPage) => {
        console.log('searchProducts2:' + page + '=' + sizePerPage);
        const auth = {headers: {'x-api-key': apiKey}};
        let url = PRODUCT_SEARCH_API_URL
            + '?query=' + productCodes
            + '&currentPage=' + (page - 1)
            + '&pageSize=' + sizePerPage;

        setIsLoading(true);
        const startTime = new Date().getTime();

        axios.get(url, auth)
            .then(res => {
                setError('');
                setIsLoading(false);
                setMetadata(buildMetadata(startTime, res));
                setResult(res.data);
                setStatus2xx(true);
                setCurrentPage(page);
                setSizePerPage(sizePerPage);
            })
            .catch(error => {
            });
    }

    const _handleSearch = query => {
        setIsLoading(true);
        setProductCodes(query);

        const auth = {headers: {'x-api-key': apiKey}};
        let url = PRODUCT_SEARCH_API_URL + '?typeAhead=' + query;

        axios.get(url, auth)
            .then(res => {
                let products = [];
                let count = 0;
                if (res.data.suggestions && res.data.suggestions.length > 0) {
                    for (let i = 0; i < res.data.suggestions.length; i++) {
                        products.push({
                            id: count++,
                            isClickable: false,
                            code: res.data.suggestions[i].term
                        });
                    }
                }
                if (res.data.products && res.data.products.length > 0) {
                    for (let i = 0; i < res.data.products.length; i++) {
                        let imgSrc = 'https://www.aviall.com/content-images/327=3V_280.JPG';
                        if (res.data.products[i].images && res.data.products[i].images.length > 0 && res.data.products[i].images[0].url) {
                            imgSrc = res.data.products[i].images[0].url;
                        }
                        products.push({
                            id: count++,
                            isClickable: true,
                            code: res.data.products[i].code,
                            partNumber: res.data.products[i].shortCode,
                            name: res.data.products[i].name,
                            imgSrc: imgSrc
                        });
                    }
                }

                setIsLoading(false);
                setOptions(products);
            });
    }

    const _handleSelected = selected => {
        if (selected && selected.length > 0) {
            if (selected[0].isClickable) {
                window.location = 'https://www.aviall.com/aviallstorefront/p/' + selected[0].code;
            } else {
                setProductCodes(selected[0].code);
            }
        }
    }

    const onPageChange = (page, sizePerPage) => {
        console.log(page + '=' + sizePerPage);
        searchProducts2(page, sizePerPage);
    }

    const onSizePerPageList = sizePerPage => {
        console.log(sizePerPage);
    }

    const buildRequest = () => {
        let waiting = null;
        if (isLoading) {
            waiting = <img className="left" src="https://www.aviall.com/aviallstorefront/_ui/desktop/common/images/spinner.gif" />;
        }
        return (
            <div className="container-request">
                <h3 className="request-info">Request</h3>
                <div className='grid-container'>
                    <div className="grid-item">
                        <label>X-API-Key</label>
                    </div>
                    <div className="grid-item">
                        <input type="text" value={apiKey} onChange={event => setApiKey(event.target.value)}/>
                    </div>
                    <div className="grid-item">
                        <label>Product codes</label>
                    </div>
                    <div className="grid-item">
                        <AsyncTypeahead
                            isLoading={isLoading}
                            options={options}
                            onChange={selected => _handleSelected(selected)}
                            filterBy={option => option}
                            labelKey="code"
                            minLength={3}
                            onSearch={_handleSearch}
                            useCache={false}
                            renderMenuItemChildren={product => <ProductMenuItem key={product.id} product={product}/>} />
                    </div>
                </div>
                <div className="buttonContainer">
                    <input type="button" className="button left" value="Search Product" onClick={searchProducts}/>
                    {waiting}
                </div>
                <div className="padding10 clear"></div>
            </div>
        );
    }

    const buildResponse = () => {
        if (isLoading) {
            return null;
        }

        if (status2xx && result && result.products && result.products.length === 0) {
            setError(ERROR_PRODUCT_CODE_INCORRECT);
        }

        let errorDisplay = null;
        if (error) {
            errorDisplay = (
                <div className="error">
                    {error}
                </div>
            );
        }

        const metadataDisplay = metadata.hasOwnProperty('name') ? <RestConsole metadata={metadata} data={result}/> : null;

        let viewResult = null;
        if (status2xx && result && result.products && result.products.length > 0) {
            viewResult =
                <ProductSearchTable onPageChange={onPageChange}
                                    onSizePerPageList={onSizePerPageList}
                                    data={result.products}
                                    totalDataSize={result.pagination.totalResults}
                                    sizePerPage={sizePerPage}
                                    page={currentPage}
                                    productCodes={productCodes}/>
        }

        let responseDisplay = null;
        if (errorDisplay || viewResult) {
            responseDisplay = (
                <div className="container-response">
                    <h3 className="response-info">Response</h3>
                    {errorDisplay}
                    <div className="clear">
                        {metadataDisplay}
                        <div className="clear">
                            {viewResult}
                        </div>
                    </div>
                </div>
            );
        }

        return responseDisplay;
    }

    return (
        <Fragment>
            <HeaderForApi apiName={'Product Search Api'} apiDescription={'Enter keyword for searching product'}/>
            <div id="main">
                <div className="apicontainer inner">
                    {buildRequest()}
                    {buildResponse()}
                </div>
            </div>
        </Fragment>
    );
}

// class ProductSearchApi extends Component {
//     state = {
//         apiKey: '',
//         productCodes: '',
//         status2xx: false,
//         error: '',
//         metadata: {},
//         result: {},
//         totalDataSize: 0,
//         sizePerPage: +DEFAULT_SIZE_PER_PAGE,
//         currentPage: 1,
//         allowNew: false,
//         isLoading: false,
//         multiple: false,
//         options: []
//         options: []
//         options: []
//     }
//     }
//     buildMetadata(startTime, res) {
//         const endTime = new Date().getTime();
//         const responseTime = endTime - startTime;
//         return {
//             name: 'product-search',
//             responseTime: responseTime,
//             status: res.status,
//             contentType: res.headers['content-type'],
//             contentLength: Math.floor((JSON.stringify(res.data).length / 1024) * 100) / 100
//         };
//     }
//     }
//     productFormatter(cell, row) {
//         return `<a  title='View detail' href='https://www.aviall.com/aviallstorefront/p/${cell}' target='_blank'>${cell}</a>`;
//     }
//     }
//     validateInput() {
//         if (!this.state.apiKey) {
//             this.setState({
//                 error: ERROR_MSG_API_KEY_MISSING,
//                 searching: false,
//                 status2xx: false,
//                 result: {}
//             });
//             return false;
//         }
//         }
//         if (!this.state.productCodes) {
//             this.setState({
//                 error: ERROR_PRODUCT_CODE_MISSING,
//                 searching: false,
//                 status2xx: false,
//                 result: {}
//             });
//             return false;
//         }
//         }
//         return true;
//     }
//     }
//     searchProducts = () => {
//         if (!this.validateInput()) {
//             return;
//         }
//         }
//         const auth = {headers: {'x-api-key': this.state.apiKey}};
//         let url = PRODUCT_SEARCH_API_URL
//             + '?query=' + this.state.productCodes
//             + '&currentPage=' + (this.state.currentPage - 1)
//             + '&pageSize=' + (this.state.sizePerPage !== undefined ? this.state.sizePerPage : 10);
//             + '&pageSize=' + (this.state.sizePerPage !== undefined ? this.state.sizePerPage : 10);
//         this.setState({searching: true, currentPage: 1});
//         this.setState({searching: true, currentPage: 1});
//         const startTime = new Date().getTime();
//         const startTime = new Date().getTime();
//         axios.get(url, auth)
//             .then(res => {
//                 this.setState({
//                     error: '',
//                     searching: false,
//                     metadata: this.buildMetadata(startTime, res),
//                     result: res.data,
//                     status2xx: true
//                 });
//             })
//             .catch(error => {
//                 if (error.response && error.response.data) {
//                     let errorMessage = "Error message: " + error.response.status;
//                     if (error.response.data.message) {
//                         errorMessage = errorMessage + ": " + error.response.data.message;
//                     }
//                     if (error.response.data.description) {
//                         errorMessage = errorMessage + ": " + error.response.data.description;
//                     }
//                     this.setState({
//                         error: errorMessage,
//                         searching: false,
//                         metadata: this.buildMetadata(startTime, error.response),
//                         result: [],
//                         status2xx: false
//                     });
//                 } else {
//                     this.setState({
//                         error: ERROR_CANNOT_CONNECT_TO_SERVER,
//                         searching: false,
//                         status2xx: false,
//                         result: []
//                     });
//                 }
//             });
//     }
//     }
//     searchProducts2 = (page, sizePerPage) => {
//         const auth = {headers: {'x-api-key': this.state.apiKey}};
//         let url = PRODUCT_SEARCH_API_URL
//             + '?query=' + this.state.productCodes
//             + '&currentPage=' + (page - 1)
//             + '&pageSize=' + sizePerPage;
//         const startTime = new Date().getTime();
//         axios.get(url, auth)
//             .then(res => {
//                 this.setState({
//                     error: '',
//                     metadata: this.buildMetadata(startTime, res),
//                     result: res.data,
//                     status2xx: true,
//                     currentPage: page,
//                     sizePerPage: sizePerPage
//                 });
//             })
//             .catch(error => {
//             });
//     }
//     }
//     _handleSearch = (query) => {
//         this.setState({isLoading: true, productCodes: query});
//         const auth = {headers: {'x-api-key': this.state.apiKey}};
//         let url = PRODUCT_SEARCH_API_URL + '?typeAhead=' + query;
//         axios.get(url, auth)
//             .then(res => {
//                 let products = [];
//                 let count = 0;
//                 if (res.data.suggestions && res.data.suggestions.length > 0) {
//                     for (let i = 0; i < res.data.suggestions.length; i++) {
//                         products.push({
//                             id: count++,
//                             isClickable: false,
//                             code: res.data.suggestions[i].term
//                         });
//                     }
//                 }
//                 if (res.data.products && res.data.products.length > 0) {
//                     for (let i = 0; i < res.data.products.length; i++) {
//                         let imgSrc = 'https://www.aviall.com/content-images/327=3V_280.JPG';
//                         if (res.data.products[i].images && res.data.products[i].images.length > 0 && res.data.products[i].images[0].url) {
//                             imgSrc = res.data.products[i].images[0].url;
//                         }
//                         products.push({
//                             id: count++,
//                             isClickable: true,
//                             code: res.data.products[i].code,
//                             partNumber: res.data.products[i].shortCode,
//                             name: res.data.products[i].name,
//                             imgSrc: imgSrc
//                         });
//                     }
//                 }
//                 }
//                 this.setState({
//                     isLoading: false,
//                     options: products
//                 });
//             });
//     }
//     }
//     _handleSelected = (selected) => {
//         if (selected && selected.length > 0) {
//             if (selected[0].isClickable) {
//                 window.location = 'https://www.aviall.com/aviallstorefront/p/' + selected[0].code;
//             } else {
//                 this.setState({
//                     productCodes: selected[0].code
//                 });
//             }
//         }
//     }
//     }
//     onPageChange = (page, sizePerPage) => {
//         this.searchProducts2(page, sizePerPage);
//     }
//     }
//     onSizePerPageList = (sizePerPage) => {
//     }
//     }
//     buildRequest = () => {
//         let waiting = null;
//         if (this.state.searching) {
//             waiting = (
//                 <img className="left" src="https://www.aviall.com/aviallstorefront/_ui/desktop/common/images/spinner.gif" />
//             );
//         }
//         return (
//             <div className="container-request">
//                 <h3 className="request-info">Request</h3>
//                 <div className='grid-container'>
//                     <div className="grid-item">
//                         <label>X-API-Key</label>
//                     </div>
//                     <div className="grid-item">
//                         <input type="text" value={this.state.apiKey} onChange={(event) => this.setState({apiKey: event.target.value})}/>
//                     </div>
//                     <div className="grid-item">
//                         <label>Product codes</label>
//                     </div>
//                     <div className="grid-item">
//                         <AsyncTypeahead
//                             {...this.state}
//                             onChange={selected => this._handleSelected(selected)}
//                             filterBy={(option) => {
//                                 return option;
//                             }}
//                             labelKey="code"
//                             minLength={3}
//                             onSearch={this._handleSearch}
//                             useCache={false}
//                             renderMenuItemChildren={product => <ProductMenuItem key={product.id} product={product}/>}
//                         />
//                     </div>
//                 </div>
//                 <div className="buttonContainer">
//                     <input type="button" className="button left" value="Search Product" onClick={this.searchProducts}/>
//                     {waiting}
//                 </div>
//                 <div className="padding10 clear"></div>
//             </div>
//         );
//     }
//     }
//     buildResponse = () => {
//         if (this.state.searching) {
//             return null;
//         }
//         }
//         if (this.state.status2xx && this.state.result && this.state.result.products && this.state.result.products.length === 0) {
//             this.setState({'error': ERROR_PRODUCT_CODE_INCORRECT});
//         }
//         }
//         let errorDisplay = null;
//         if (this.state.error) {
//             errorDisplay = (
//                 <div className="error">
//                     {this.state.error}
//                 </div>
//             );
//         }
//         }
//         const metadataDisplay = this.state.metadata.hasOwnProperty('name') ? <RestConsole metadata={this.state.metadata} data={this.state.result}/> : null;
//         const metadataDisplay = this.state.metadata.hasOwnProperty('name') ? <RestConsole metadata={this.state.metadata} data={this.state.result}/> : null;
//         let viewResult = null;
//         if (this.state.status2xx && this.state.result && this.state.result.products && this.state.result.products.length > 0) {
//             viewResult =
//                 <div className="clear">
//                     <ProductSearchTable onPageChange={this.onPageChange}
//                                         onSizePerPageList={this.onSizePerPageList}
//                                         data={this.state.result.products}
//                                         totalDataSize={this.state.result.pagination.totalResults}
//                                         sizePerPage={this.state.sizePerPage}
//                                         page={this.state.currentPage}
//                                         productCodes={this.state.productCodes}
//                     />
//                 </div>;
//         }
//         }
//         let responseDisplay = null;
//         if (errorDisplay || viewResult) {
//             responseDisplay = (
//                 <div className="container-response">
//                     <h3 className="response-info">Response</h3>
//                     {errorDisplay}
//                     <div className="clear">
//                         {metadataDisplay}
//                         {viewResult}
//                     </div>
//                 </div>
//             );
//         }
//         }
//         return responseDisplay;
//     }
//     }
//     render() {
//         return (
//             <Fragment>
//                 <HeaderForApi apiName={'Product Search Api'} apiDescription={'Enter keyword for searching product'} />
//                 <div id="main">
//                     <div className="apicontainer inner">
//                         {this.buildRequest()}
//                         {this.buildResponse()}
//                     </div>
//                 </div>
//             </Fragment>
//         );
//     }
// }
export default productSearchApi;