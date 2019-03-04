import React, {useState} from 'react';
import axios from 'axios';
import Autosuggest from 'react-autosuggest';

const productSearchAutoSuggest = (props) => {
    const [suggestions, setSuggestions] = useState([]);

    const getSuggestionValue = product => {
        return product.code;
    }

    const renderSuggestion = product => {
        if (product.isClickable) {
            let firstLine = <span>Code: <strong>{product.code}</strong> &nbsp;-&nbsp; Part Number: {product.partNumber}</span>;
            if (product.code.length > 20) {
                firstLine = <span>Code: <strong>{product.code}</strong></span>;
            }
            return (
                <div className="autosuggest">
                    <div style={{height: '40px'}} className="floatRight">
                        <img alt={product.code} style={{maxWidth: '38px', maxHeight: '38px'}} src={product.imgSrc}/>
                    </div>
                    <div>
                        {firstLine}
                        <br/>
                        Name: {product.name.substring(0, 30)}
                    </div>
                </div>
            );
        }

        return (
            <div className="autosuggest">
                <strong>{product.code}</strong>
            </div>
        );
    }

    const onSuggestionsFetchRequested = ({value}) => {
        axios.get('https://www.aviall.com/aviallstorefront/search/autocomplete/SearchBox?term=327')
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
                setSuggestions(products);
            });
    };

    const onSuggestionsClearRequested = () => {
        setSuggestions([]);
    };

    const inputProps = {
        value: props.value,
        onChange: props.onChange
    };

    console.log('33:' + props.value);

    return (
        <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            onSuggestionsClearRequested={onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps}
            shouldRenderSuggestions={value => value.trim().length > 2}
        />
    )
}

export default productSearchAutoSuggest;