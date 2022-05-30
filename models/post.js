const mysql = require('mysql')
require('dotenv').config();
const config = require('../config/config');

const connection = mysql.createConnection({
	host     : config.get('db.host'),
	user     : config.get('db.name'),
	password : config.get('db.password'),
	port     : config.get('db.port'),
	database : config.get('db.database')
  });

function postAdd(username, title, content){
	return new Promise( (resolve, reject) => {
		connection.query('INSERT into posts (username, title, content) values (?, ?, ?)', [username, title, content], (error, results, fields) => {
			if (error) {
				reject(error);
			} else {
				// insert succeeded.
				resolve({postId: results.insertId, title: title, content: content});
			}
		})
	});
}

function postGetOne(id){
	return new Promise( (resolve, reject) => {
		connection.query('SELECT * from posts where postId = ' + connection.escape(id), (error, results, fields) => {
			if (error) {
				reject(error);
			} else {
				if (results.length > 0) {
					// post exists
					resolve(results[0]);
				} else {
					reject("Could not find post");
				}
			}
		})
		
	}); 
}

function postGetAll(){
	return  new Promise( (resolve, reject) => {
		connection.query('SELECT * from posts', (error, results, fields) => {
			if (error) {
				reject(error);
			} else {
				resolve(results);
			}
		})
		
	}); 
}
module.exports = {
	save: postAdd,
	findOne: postGetOne,
	findAll: postGetAll,

}