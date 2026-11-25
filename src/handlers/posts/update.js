import middy from "@middy/core";
import { z } from "zod";

import { updateUserPost } from "../../services/postService.js";
import { authenticate } from "../../middleware/auth.js";
import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";

// Validate the updated post data
const updatePostSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
});

// Handle PUT /posts/{postId}
const updatePostHandler = async (event) => {
  try {
    const postId = event.pathParameters?.postId;

    if (!postId) {
      return errorResponse(400, "Post ID is required");
    }

    let body;

    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return errorResponse(400, "Invalid request body");
    }

    const validation = updatePostSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        400,
        validation.error.issues[0].message
      );
    }

    // Get username from the verified JWT
    const username = event.user.username;

    const result = await updateUserPost({
      postId,
      username,
      title: validation.data.title,
      content: validation.data.content,
    });

    if (result.error) {
      return errorResponse(result.statusCode, result.error);
    }

    return successResponse(200, {
      message: "Post updated successfully",
      post: result.post,
    });

  } catch (error) {
    console.error("Update post error:", error);
    return errorResponse(500, "Internal server error");
  }
};

// Apply authentication before executing the handler
export const handler = middy(updatePostHandler)
  .use(authenticate());