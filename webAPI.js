require('dotenv').config()
const fetch = require('node-fetch');

function getPercent(d){
	if(d.roi)
		return d.roi.percentage

	if(d.price_change_percentage_24h)
		return d.price_change_percentage_24h

	return null
}

module.exports = async (type = process.env.TARGET || "btc", target = process.env.CURRENCY || 'usd')=>{
	let status;
	return fetch(process.env.API + target.toLowerCase())
	  .then((res) => { 
	    status = res.status; 
	    return res.json() 
	  })
	  .then((jsonResponse) => {
	  	if(!jsonResponse)
	    	return {status: status, data: {}};
	    for(var i=0; i< jsonResponse.length; i++){
	    	const _response = jsonResponse[i];
	    	if(_response.symbol === type.toLowerCase())
	    		return {status: status, data: {
	    			name: _response.name,
	    			price: _response.current_price,
	    			image: _response.image,
	    			status: getPercent(_response),
	    			lastupdate: _response.last_updated
	    		}
	    	}
	    }
	  })
	  .catch((err) => {
	    return {status: err.message, data: {}};
	  });
}
