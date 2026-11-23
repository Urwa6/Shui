import { DynamoDBClient } from "@aws-sdk/client-dynamodb"; 
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

//Create the connection to DynamoDB
const client = new DynamoDBClient({});

//Create the document client for working with Javascript objects
export const dynamoDb = DynamoDBDocumentClient.from(client, {
    marshallOptions: {
        // Remove undefined values while marshalling.
        removeUndefinedValues: true, 
    },
});