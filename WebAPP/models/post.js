const mysql = require('mysql')
require('dotenv').config();
const config = require('../config/config');
var AWS = require('aws-sdk');
import { v4 as uuidv4 } from 'uuid';

// Set the region 
AWS.config.update({region: config.get('sqs.region')});
// Create an SQS service object
var sqs = new AWS.SQS({apiVersion: '2012-11-05'});
var sqsQueueUrl;

var params = {
  QueueName: config.get('sqs.name')
};
// pull the url of the queue, so we can send messages to it.
sqs.getQueueUrl(params, function(err, data) {
  if (err) {
    console.log("Error", err);
  } else {
    sqsQueueUrl = data.QueueUrl
  }
});


var dynamoDb = new AWS.DynamoDB({apiVersion: '2012-08-10'});
dynamoTableName = config.get('ddb.name');

function postAdd(username, title, content){
	return new Promise( (resolve, reject) => {
		// package up the data that needs to be placed into the database.
		var params = {
		   MessageAttributes: {
			 "username": {
			   DataType: "String",
			   StringValue: username
			 },
			 "title": {
			   DataType: "String",
			   StringValue: title
			 },
			 "content": {
			   DataType: "String",
			   StringValue: content
			 },
			 "postId": {
				DataType: "String",
				StringValue: uuidv4()
			 }
		   },
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
					// post exists
					resolve(data.Item);
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
		FilterExpression: "",
		TableName: dynamoTableName,
		};
		
		ddb.scan(params, function (err, data) {
		if (err) {
			reject(err);
		} else {
			resolve(data.Items)
		}
		});
	}); 
}
module.exports = {
	save: postAdd,
	findOne: postGetOne,
	findAll: postGetAll,

}