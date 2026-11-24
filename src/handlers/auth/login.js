import { successResponse, errorResponse } from '../../utils/response.js';
import {z} from 'zod';
import { loginUser } from '../../services/authService.js';

//Validate username and password using zod schema
const loginSchema = z.object({
 username: z.string({
    error: "Username is required",
  }).min(1, "Username is required"),

  password: z.string({
    error: "Password is required",
  }).min(1, "Password is required"),
});

//Handle login request
export const handler = async (event) => {
  try {
  // Read the incoming request body
  let body;

  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return errorResponse(400, "Invalid JSON in request body");
  }

  //Extract username and password from the request body
    const { username, password } = body;

    //Validate the input 
    const validation = loginSchema.safeParse({ username, password });
    if (!validation.success) {
      return errorResponse(
        400,
        validation.error.issues[0].message
         );
    }
    //Authenticate the user 
    const result = await loginUser(username, password);
    
    //Return the JWT token 
    return successResponse(200, {
         message: "Login successful", 
         token: result.token,
        username: result.username,
     });    
    } catch (error) {
        if (error.statusCode === 401) {
            return errorResponse(401, error.message);
        }
        console.error("Login error:", error);

        return errorResponse(500, "Internal Server Error");
    }
};
