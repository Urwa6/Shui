
import {
  PutCommand,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

import { randomUUID } from "node:crypto";
import { dynamoDb } from "./dynamodb.js";

const COMMENTS_TABLE = process.env.COMMENTS_TABLE;

// Retrieve all comments belonging to a post.
export const getCommentsByPostId = async (postId) => {
  const result = await dynamoDb.send(
    new QueryCommand({
      TableName: COMMENTS_TABLE,
      KeyConditionExpression: "postId = :postId",
      ExpressionAttributeValues: {
        ":postId": postId,
      },
    })
  );

  return result.Items ?? [];
};

// Create and save a comment.
export const createComment = async ({
  postId,
  username,
  content,
}) => {
  const comment = {
    postId,
    commentId: randomUUID(),
    username,
    content,
    createdAt: new Date().toISOString(),
  };

  await dynamoDb.send(
    new PutCommand({
      TableName: COMMENTS_TABLE,
      Item: comment,
      ConditionExpression:
        "attribute_not_exists(postId) AND attribute_not_exists(commentId)",
    })
  );

  return comment;
};

// Delete all comments belonging to a post.
export const deleteCommentsByPostId = async (postId) => {
  let lastEvaluatedKey;

  do {
    const result = await dynamoDb.send(
      new QueryCommand({
        TableName: COMMENTS_TABLE,
        KeyConditionExpression: "postId = :postId",
        ExpressionAttributeValues: {
          ":postId": postId,
        },
        ExclusiveStartKey: lastEvaluatedKey,
      })
    );

    for (const comment of result.Items ?? []) {
      await dynamoDb.send(
        new DeleteCommand({
          TableName: COMMENTS_TABLE,
          Key: {
            postId: comment.postId,
            commentId: comment.commentId,
          },
        })
      );
    }

    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);
};
