
import { z } from "zod";
import { getAllPosts } from "../../database/post.js";
import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";

// Validate the optional username query parameter
const querySchema = z.object({
  username: z.string().min(1, "Username cannot be empty").optional(),
});

// Handle GET /posts
export const handler = async (event) => {
  try {
    const query = event.queryStringParameters ?? {};

    const validation = querySchema.safeParse(query);

    if (!validation.success) {
      return errorResponse(
        400,
        validation.error.issues[0].message
      );
    }

    const posts = await getAllPosts(validation.data.username);

    return successResponse(200, posts);
  } catch (error) {
    console.error("Get posts error:", error);
    return errorResponse(500, "Internal server error");
  }
};
