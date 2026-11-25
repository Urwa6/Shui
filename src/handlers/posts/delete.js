import middy from "@middy/core";

import { deleteUserPost } from "../../services/postService.js";
import { authenticate } from "../../middleware/auth.js";
import { errorResponse } from "../../utils/response.js";

// Handle DELETE /posts/{postId}
const deletePostHandler = async (event) => {
  try {
    const postId = event.pathParameters?.postId;

    if (!postId) {
      return errorResponse(400, "Post ID is required");
    }

    // Get username from the verified JWT
    const username = event.user.username;

    const result = await deleteUserPost({
      postId,
      username,
    });

    if (result.error) {
      return errorResponse(result.statusCode, result.error);
    }

    // 204 means the post was successfully deleted
    return {
      statusCode: 204,
    };

  } catch (error) {
    console.error("Delete post error:", error);
    return errorResponse(500, "Internal server error");
  }
};

// Require authentication before executing the handler
export const handler = middy(deletePostHandler)
  .use(authenticate());