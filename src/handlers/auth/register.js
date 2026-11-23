import { successResponse, errorResponse } from "../../utils/response.js";
import { z } from "zod";
import { registerUser } from "../../services/authService.js";

//Username and password validation schema 
//Must be a string & must not be empty
const registerSchema = z.object({
  username: z.string({
    error: "Username is required",
  }).min(1, "Username is required"),

  password: z.string({
    error: "Password is required",
  }).min(1, "Password is required"),
});

export const handler = async (event) => {
  try {
    // Read the incoming request body
    let body;

    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return errorResponse(400, "Invalid request body");
    }

    // Extract username and password
    const { username, password } = body;

    const validation = registerSchema.safeParse({ username, password });
    
    if (!validation.success) {
      return errorResponse(
        400,
        validation.error.issues[0].message
        );
    }

    // Register the user
    const user = await registerUser(username, password);

    // Return a success response
    return successResponse(201, { 
        message: "User registered successfully",
        username: user.username,
    });
  }
    catch (error) {
    if (error.statusCode === 409) {
     return errorResponse(409, error.message);
   }

   console.error("Registration error:", error);

   return errorResponse(500, "Internal server error");
  }

};