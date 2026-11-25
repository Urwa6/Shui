import { getPost } from "../../services/postService.js";
import {
  successResponse,
  errorResponse,
} from "../../utils/response.js";

//Handle GET /posts/{postId}
export const handler = async (event) => {
  try {
    const postId = event.pathParameters?.postId;

    // Check that the post ID exists
    if (!postId) {
      return errorResponse(400, "Post ID is required");
    }

    //Retrieve the post
    const post = await getPost(postId);

    //Return 404 if the post does not exist
    if (!post) {
      return errorResponse(404, "Post not found");
    }

    return successResponse(200, post);

  } catch (error) {
    console.error("Get post error:", error);
    return errorResponse(500, "Internal server error");
  }
};