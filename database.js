module.exports = function(mysql){

    // DB conncetion
    var connection = mysql.createConnection({
        host : 'localhost',
        user : 'root',
        password : 'Local@22',
        database : 'lvdemo'
    });
     
    connection.connect(function(err) {
      if (err) {
        console.error('error connecting: ' + err.stack);
        return;
      }
      console.log('connected as id ' + connection.threadId);
    });

    return connection;
}