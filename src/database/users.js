import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { dynamoDb } from "./dynamodb.js";

const USERS_TABLE = process.env.USERS_TABLE;

// Find a user by username
export const getUserByUsername = async (username) => {
  const result = await dynamoDb.send(
    new GetCommand({
      TableName: USERS_TABLE,
      Key: {
        username,
      },
    })
  );

  return result.Item;
};

//Save a new user to the database
export const createUser = async (user) => {
  await dynamoDb.send(
    new PutCommand({
      TableName: USERS_TABLE,
      Item: user,
    })
  );
};