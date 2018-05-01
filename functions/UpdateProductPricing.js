let UpdateProductPricing = function (ncUtil,
                               channelProfile,
                               flowContext,
                               payload,
                               callback) {
  
  log("Building response object...", ncUtil);
  let out = {
    ncStatusCode: null,
    response: {},
    payload: {}
  };
  
  let invalid = false;
  let invalidMsg = "";
  
  //If ncUtil does not contain a request object, the request can't be sent
  if (!ncUtil) {
    invalid = true;
    invalidMsg = "ncUtil was not provided"
  } else if (!ncUtil.request) {
    invalid = true;
    invalidMsg = "ncUtil.request was not provided"
  }
  
  //If channelProfile does not contain channelSettingsValues, channelAuthValues or productPricingBusinessReferences, the request can't be sent
  if (!channelProfile) {
    invalid = true;
    invalidMsg = "channelProfile was not provided"
  } else if (!channelProfile.channelSettingsValues) {
    invalid = true;
    invalidMsg = "channelProfile.channelSettingsValues was not provided"
  } else if (!channelProfile.channelSettingsValues.protocol) {
    invalid = true;
    invalidMsg = "channelProfile.channelSettingsValues.protocol was not provided"
  } else if (!channelProfile.channelAuthValues) {
    invalid = true;
    invalidMsg = "channelProfile.channelAuthValues was not provided"
  } else if (!channelProfile.channelAuthValues.access_token) {
    invalid = true;
    invalidMsg = "channelProfile.channelAuthValues.access_token was not provided"
  } else if (!channelProfile.channelAuthValues.shop) {
    invalid = true;
    invalidMsg = "channelProfile.channelAuthValues.shop was not provided"
  } else if (!channelProfile.productPricingBusinessReferences) {
    invalid = true;
    invalidMsg = "channelProfile.productPricingBusinessReferences was not provided"
  } else if (!Array.isArray(channelProfile.productPricingBusinessReferences)) {
    invalid = true;
    invalidMsg = "channelProfile.productPricingBusinessReferences is not an array"
  } else if (channelProfile.productPricingBusinessReferences.length === 0) {
    invalid = true;
    invalidMsg = "channelProfile.productPricingBusinessReferences is empty"
  }
  
  //If a product document was not passed in, the request is invalid
  if (!payload) {
    invalid = true;
    invalidMsg = "payload was not provided"
  } else if (!payload.doc) {
    invalid = true;
    invalidMsg = "payload.doc was not provided";
  } else if (!payload.productPricingRemoteID) {
    invalid = true;
    invalidMsg = "payload.productPricingRemoteID was not provided";
  }
  
  //If callback is not a function
  if (!callback) {
    throw new Error("A callback function was not provided");
  } else if (typeof callback !== 'function') {
    throw new TypeError("callback is not a function")
  }
  
  if (!invalid) {
    const extractBusinessReference = require('../util/extractBusinessReference');
    
    let endPoint = "/admin/variants/" + payload.productPricingRemoteID + ".json";
    
    //Request - Simplified HTTP client
    let request = require('request');
    
    let url = channelProfile.channelSettingsValues.protocol + "://" + channelProfile.channelAuthValues.shop + endPoint;
    
    /*
     Format url
     */
    let headers = {
      "X-Shopify-Access-Token": channelProfile.channelAuthValues.access_token
    };
    
    log("Using URL [" + url + "]", ncUtil);
    
    payload.doc.variant.id = payload.productPricingRemoteID;
    
    /*
     Set URL and headers
     */
    let options = {
      url: url,
      method: "PUT",
      headers: headers,
      body: payload.doc,
      json: true
    };
    
    try {
      // Pass in our URL and headers
      request(options, function (error, response, body) {
        if (!error) {
          log("Do UpdateProductPricing Callback", ncUtil);
          out.response.endpointStatusCode = response.statusCode;
          out.response.endpointStatusMessage = response.statusMessage;
          
          // If we have a product object, set out.payload.doc to be the product document
          if (response.statusCode === 200 && body.variant) {
            out.payload = {
              doc: body,
              productPricingBusinessReference: extractBusinessReference(channelProfile.productPricingBusinessReferences, body)
            };
            
            out.ncStatusCode = 200;
          } else if (response.statusCode == 429) {
            out.ncStatusCode = 429;
            out.payload.error = body;
          } else if (response.statusCode == 500) {
            out.ncStatusCode = 500;
            out.payload.error = body;
          } else {
            out.ncStatusCode = 400;
            out.payload.error = body;
          }
          
          callback(out);
        } else {
          logError("Do UpdateProductPricing Callback error - " + error, ncUtil);
          out.ncStatusCode = 500;
          out.payload.error = error;
          callback(out);
        }
      });
    } catch (err) {
      logError("Exception occurred in UpdateProductPricing - " + err, ncUtil);
      out.ncStatusCode = 500;
      out.payload.error = {err: err, stack: err.stackTrace};
      callback(out);
    }
    
  } else {
    log("Callback with an invalid request - " + invalidMsg, ncUtil);
    out.ncStatusCode = 400;
    out.payload.error = invalidMsg;
    callback(out);
  }
};

function logError(msg, ncUtil) {
  console.log("[error] " + msg);
}

function log(msg, ncUtil) {
  console.log("[info] " + msg);
}

module.exports.UpdateProductPricing = UpdateProductPricing;
