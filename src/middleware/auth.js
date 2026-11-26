
import jwt from "jsonwebtoken";
import { errorResponse } from "../utils/response.js";

// Authentication middleware.
// Set optional to true when a route also allows guest access.
export const authenticate = ({ optional = false } = {}) => ({
  before: async (request) => {
    const headers = request.event.headers ?? {};

    const authHeader =
      headers.authorization ?? headers.Authorization;

    // Allow requests without a token only on optional routes.
    if (!authHeader) {
      if (optional) {
        return;
      }

      return errorResponse(401, "Authentication required");
    }

    // A supplied token must always be valid.
    if (!authHeader.startsWith("Bearer ")) {
      return errorResponse(401, "Invalid or expired token");
    }

    const token = authHeader.slice(7);

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET
      );

      // Make sure the token contains a valid username.
      if (
        typeof decoded.username !== "string" ||
        !decoded.username.trim()
      ) {
        return errorResponse(401, "Invalid or expired token");
      }

      request.event.user = decoded;

    } catch {
      return errorResponse(401, "Invalid or expired token");
    }
  },
});
