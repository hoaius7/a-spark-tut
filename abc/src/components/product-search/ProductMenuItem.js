import React from 'react';

const productMenuItem = ({product}) => {
    if (product.isClickable) {
        let firstLine = <span>Code: <strong>{product.code}</strong> &nbsp;-&nbsp; Part Number: {product.partNumber}</span>;
        if (product.code.length > 20) {
            firstLine = <span>Code: <strong>{product.code}</strong></span>;
        }
        return (
            <div>
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
        <div>
            <strong>{product.code}</strong>
        </div>
    );
}

export default productMenuItem;
