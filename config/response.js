module.exports = function sendResponse(status,message,data, other = null){
    return {
        status: status,
        message : message,
        data : data,
        other : other
     }
}