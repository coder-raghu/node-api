module.exports = function sendResponse(status,message,data, token=null, other = null){
    return {
        status: status,
        message : message,
        data : data,
        token : token,
        other : other
     }
}