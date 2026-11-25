import middy from "@middy/core";
import { z } from "zod";

import { createNewPost } from "../../services/postService.js";
import { authenticate } from "../../middleware/auth.js";
import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";

// Validate the post title and content
const postSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
});

// Handle POST /posts
const createPostHandler = async (event) => {
  try {
    let body;

    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return errorResponse(400, "Invalid request body");
    }

    const validation = postSchema.safeParse(body);

    if (!validation.success) {
      return errorResponse(
        400,
        validation.error.issues[0].message
      );
    }

    // Get username from the verified JWT, not the request body
    const username = event.user.username;

    const post = await createNewPost({
      username,
      title: validation.data.title,
      content: validation.data.content,
    });

    return successResponse(201, {
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    console.error("Create post error:", error);
    return errorResponse(500, "Internal server error");
  }
};

// Apply authentication before executing the handler
export const handler = middy(createPostHandler)
  .use(authenticate());