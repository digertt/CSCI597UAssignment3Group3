require('dotenv').config();
const config = require('../config/config');
var AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Set the aws remote params
AWS.config.update(config.get('aws'));
// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
var sqsQueueUrl = config.get('sqs.url');



var dynamoDb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
dynamoTableName = config.get('ddb.name');

function postAdd(username, title, content){
	return new Promise( (resolve, reject) => {
		// package up the data that needs to be placed into the database.
		   body =  {
			 "username": username,
			 "title": title,
			 "content": content,
			 "postId": uuidv4()
			 }

		var params = {
			MessageBody: JSON.stringify(body),
		   QueueUrl: sqsQueueUrl
		 };
		 sqs.sendMessage(params, function(err, data) {
		   if (err) {
			 reject(err);
		   } else {
			 resolve(data.MessageId);
		   }
		 });
	});
}

function postGetOne(id){
	return new Promise( (resolve, reject) => {
		var params = {
			Key: {
				"postId": {
					S: id
				}
			},
			TableName: dynamoTableName
		}
		dynamoDb.getItem(params, function(err, data) {
			if (err) {
				reject(err);
			} else {
				if (data.Item != undefined) {
					// post exists, have to unmarshall into regular json
					resolve(AWS.DynamoDB.Converter.unmarshall(data.Item));
				} else {
					reject("Could not find post");
				}
			}
		});
	}); 
}

function postGetAll(){
	return  new Promise( (resolve, reject) => {
		const params = {
		TableName: dynamoTableName,
		};
		dynamoDb.scan(params, function (err, data) {
		if (err) {
			reject(err);
		} else {
			resolve(data.Items.map((record) => AWS.DynamoDB.Converter.unmarshall(record)))
		}
		});
	}); 
}
module.exports = {
	save: postAdd,
	findOne: postGetOne,
	findAll: postGetAll,

}