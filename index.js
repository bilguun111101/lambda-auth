const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');
const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const { marshall, unmarshall } = require("@aws-sdk/util-dynamodb");

const db = new DynamoDB();


exports.signup = async(event) => {
  const {
    email,
    password,
    username,
    firstName,
    lastName
  } = JSON.parse(event.body);
  const userId = uuidv4();
  const hash_password = bcrypt.hashSync(password, 10);
  const user = marshall({
    userId,
    email,
    password: hash_password,
    username,
    FirstName: firstName,
    lastName
  })
  const params = {
    TableName: 'register',
    Item: user,
  }
  const response = await db.putItem(params);
  return response;
}

exports.signin = async(event) => {
  const {
    email,
    password,
  } = JSON.parse(event.body);
  // const hash_password = bcrypt.hashSync(password);
  const { Items } = await db.query({
    TableName: 'register',
    IndexName: "email-index",
    KeyConditionExpression: "email = :email",
    ExpressionAttributeValues: {
      ":email": { S: email },
    }
  })
  console.log(Items);
  return {
    body: JSON.stringify(unmarshall(Items))
  }
}