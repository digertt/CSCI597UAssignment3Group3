const mysql = require('mysql')
require('dotenv').config();
const config = require('../config/config');
const passwordHandler = require('../middleware/passwords.middleware')

const connection = mysql.createConnection({
	host     : config.get('db.host'),
	user     : config.get('db.name'),
	password : config.get('db.password'),
	port     : config.get('db.port'),
	database : config.get('db.database')
  });

function userExists({email, username}) {
	return new Promise( (resolve, reject) => {
		let sqlText;
		if (email !== undefined) {
			sqlText = 'SELECT 1 from users where email  = ' + connection.escape(email)
		} else if (username !== undefined) {
			sqlText = 'SELECT 1 from users where username = ' + connection.escape(username)
		} else {
			reject('username or email required')
		}
		connection.query(sqlText, (error, results, fields) => {
			if (error) {
				reject(error);
			} else {
				if (results.length > 0) {
					// user exists
					resolve(true);
				} else {
					resolve(false)
				}
			}
		});
	});
}

function userRegister({email, username}, password) {
	return new Promise( (resolve, reject) => {
		hashsalt = passwordHandler.genPassword(password)
		const hash = hashsalt.hash
		const salt = hashsalt.salt
		connection.query('INSERT into users (username, email, password, salt) values (?, ?, ?, ?)', [username, email, hash, salt], (error, results, fields) => {
			if (error) {
				reject(error);
			} else {
				// insert succeeded.
				resolve()
			}
		})
	});
}

module.exports = {
	exists: userExists,
	register: userRegister,

}