import { 
  QueryCommand, 
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
 } from "@aws-sdk/lib-dynamodb";
import { randomUUID } from "node:crypto";
import { dynamoDb } from "./dynamodb.js";

const POSTS_TABLE = process.env.POSTS_TABLE;

// Retrieve all posts, optionally filtered by username
export const getAllPosts = async (username) => {
  let params;

  if (username) {
    // Retrieve posts belonging to a specific user
    params = {
      TableName: POSTS_TABLE,
      IndexName: "PostsByUsernameIndex",
      KeyConditionExpression: "GSI2PK = :username",
      ExpressionAttributeValues: {
        ":username": username,
      },
      ScanIndexForward: false,
    };
  } else {
    // Retrieve all posts, newest first
    params = {
      TableName: POSTS_TABLE,
      IndexName: "PostsByDateIndex",
      KeyConditionExpression: "GSI1PK = :partition",
      ExpressionAttributeValues: {
        ":partition": "POSTS",
      },
      ScanIndexForward: false,
    };
  }

  const result = await dynamoDb.send(
    new QueryCommand(params)
  );

  return result.Items ?? [];
};

//Create and save a new post in the database
export const createPost = async ({
  username, 
  title, 
  content,
  isGuest = false,
}) => {
    const  id = randomUUID();
    const createdAt = new Date().toISOString();

    const post = {
        id,
        username,
        title,
        content,
        createdAt,
        updatedAt: createdAt,
        isGuest,

        //Attributes used by the DynamoDB indexes 
        GSI1PK: "POSTS",
        GSI1SK: `${createdAt}#${id}`,
        GSI2PK: username,
        GSI2SK: `${createdAt}#${id}`,
      };

      await dynamoDb.send(
        new PutCommand({
          TableName: POSTS_TABLE,
          Item: post,
          ConditionExpression: "attribute_not_exists(id)", // Ensure no duplicate post IDs
        })
     );

     return post;
};

// Retrieve one post by its ID
export const getPostById = async (postId) => {
  const result = await dynamoDb.send(
    new GetCommand({
      TableName: POSTS_TABLE,
      Key: { id: postId },
    })
  );

  return result.Item;
};
// Update the title and content of an existing post
export const updatePost = async ({ postId, title, content }) => {
  const updatedAt = new Date().toISOString();

  const result = await dynamoDb.send(
    new UpdateCommand({
      TableName: POSTS_TABLE,
      Key: { id: postId },
      UpdateExpression:
        "SET title = :title, content = :content, updatedAt = :updatedAt",
      ExpressionAttributeValues: {
        ":title": title,
        ":content": content,
        ":updatedAt": updatedAt,
      },
      ConditionExpression: "attribute_exists(id)",
      ReturnValues: "ALL_NEW",
    })
  );

  return result.Attributes;
};

// Delete a post by its ID
export const deletePost = async (postId) => {
  await dynamoDb.send(
    new DeleteCommand({
      TableName: POSTS_TABLE,
      Key: { id: postId },
      ConditionExpression: "attribute_exists(id)",
    })
  );
};