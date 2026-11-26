
import middy from "@middy/core";
import { z } from "zod";
import { randomUUID } from "node:crypto";

import { createNewPost } from "../../services/postService.js";
import { authenticate } from "../../middleware/auth.js";
import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";

// Validate the post title and content.
const postSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  content: z.string().trim().min(1, "Content is required"),
});

// Handle POST /posts.
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

    // Use the verified username or generate a guest username.
    const isGuest = !event.user;
    const username = isGuest
      ? `Guest-${randomUUID().slice(0, 8)}`
      : event.user.username;

    const post = await createNewPost({
      username,
      title: validation.data.title,
      content: validation.data.content,
      isGuest,
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

// Allow guests, but verify any token that is supplied.
export const handler = middy(createPostHandler)
  .use(authenticate({ optional: true }));
