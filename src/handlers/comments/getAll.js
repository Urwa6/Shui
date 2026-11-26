import {
  getCommentsByPostId,
} from "../../database/comment.js";

import { getPostById } from "../../database/post.js";

import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";

//Handle GET /posts/{postId}/comments
export const handler = async (event) => {
  try {
    const postId = event.pathParameters?.postId;

    if (!postId) {
      return errorResponse(400, "Post ID is required");
    }

    //Check that the post exists.
    const post = await getPostById(postId);

    if (!post) {
      return errorResponse(404, "Post not found");
    }

    //Retrieve comments belonging to this post.
    const comments = await getCommentsByPostId(postId);

    return successResponse(200, comments);

  } catch (error) {
    console.error("Get comments error:", error);
    return errorResponse(500, "Internal server error");
  }
};
