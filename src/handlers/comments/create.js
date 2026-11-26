
import middy from "@middy/core";
import { z } from "zod";

import { createComment } from "../../database/comment.js";
import { getPostById } from "../../database/post.js";
import { authenticate } from "../../middleware/auth.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";

// Validate the comment content.
const commentSchema = z.object({
  content: z.string().trim().min(1, "Comment content is required"),
});

// Handle POST /posts/{postId}/comments
const createCommentHandler = async (event) => {
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

    const validation = commentSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        400,
        validation.error.issues[0].message
      );
    }

    // Check that the post exists.
    const post = await getPostById(postId);

    if (!post) {
      return errorResponse(404, "Post not found");
    }

    // Use the username from the verified JWT.
    const username = event.user.username;

    const comment = await createComment({
      postId,
      username,
      content: validation.data.content,
    });

    return successResponse(201, {
      message: "Comment created successfully",
      comment,
    });

  } catch (error) {
    console.error("Create comment error:", error);
    return errorResponse(500, "Internal server error");
  }
};

// Comments require authentication.
export const handler = middy(createCommentHandler)
  .use(authenticate());
