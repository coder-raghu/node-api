module.exports = function sendResponse(status,message,data){
    return {
        status: status,
        message : message,
        data : data
     }
}