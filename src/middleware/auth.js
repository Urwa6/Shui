import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.js";

// Middy authentication middleware
export const authenticate = () => ({
  before: async (request) => {
    const headers = request.event.headers ?? {};

    const authHeader =
      headers.authorization ?? headers.Authorization;

    // Check that the Authorization header exists
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return errorResponse(401, "Authentication required");
    }

    const token = authHeader.split(" ")[1];

    try {
      // Verify the JWT token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // Attach the verified user to the event
      request.event.user = decoded;

    } catch {
      return errorResponse(401, "Invalid or expired token");
    }
  },
});