const AWS = require('aws-sdk');
const DDB = new AWS.DynamoDB.DocumentClient({version: '2019-11-21', region: 'us-west-1'});

exports.handler = async (event) => {
    try{
        const message = event.Records;
        const curBody = JSON.parse(message[0].body);
        
        const curPost = {
            TableName: 'Blog-App-DB',
            Item:{
                postId: curBody.postId,
                username: curBody.username,
                title: curBody.title,
                content: curBody.content
            }
        };
      
        await DDB.put(curPost).promise();
    }
    
    catch(error){
        return;
    }
};
