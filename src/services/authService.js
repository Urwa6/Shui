import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { ConditionalCheckFailedException } from "@aws-sdk/client-dynamodb";
import {
  getUserByUsername,
  createUser,
} from "../database/users.js";

// Register a new user
export const registerUser = async (username, password) => {
  // Check if the username already exists
  const existingUser = await getUserByUsername(username);

  if (existingUser) {
    const error = new Error("Username already exists");
    error.statusCode = 409;
    throw error;
  }

  // Hash the password before storing it
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a new user object
  const newUser = {
    username,
    password: hashedPassword,
    createdAt: new Date().toISOString(),
  };

  try {
    await createUser(newUser);
  } catch (error) {
    if (error instanceof ConditionalCheckFailedException) {
      const conflictError = new Error("Username already exists");
      conflictError.statusCode = 409;
      throw conflictError;
    }

    throw error;
  }

  return newUser;
};

//Login an existing user
export const loginUser = async (username, password) => {
  //Find the user in DynamoDB
  const user = await getUserByUsername(username);

  //Check if the user exists
  if (!user) {
    const error = new Error("Invalid username or password");
    error.statusCode = 401;
    throw error;
  }

  //Compare the provided password with the stored hash
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    const error = new Error("Invalid username or password");
    error.statusCode = 401;
    throw error;
  }

  //Generate a JWT token
  const token = jwt.sign(
    { username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );

  return {
    token,
    username: user.username,
  };
};
