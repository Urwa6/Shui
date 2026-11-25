import { createPost, getPostById, updatePost, deletePost } from "../database/post.js";

// Create a post for a registered user
export const createNewPost = async ({ username, title, content }) => {
  return await createPost({
    username,
    title,
    content,
  });
};

// Retrieve one post by its ID
export const getPost = async (postId) => {
  return await getPostById(postId);
};

// Update a post only if the user owns it
export const updateUserPost = async ({
  postId,
  username,
  title,
  content,
}) => {
  const existingPost = await getPostById(postId);

  // Check if the post exists
  if (!existingPost) {
    return { error: "Post not found", statusCode: 404 };
  }

  // Check if the logged-in user owns the post
  if (existingPost.username !== username || existingPost.isGuest === true) {
    return { 
      error: "You are not allowed to update this post", 
      statusCode: 403,
    };
  }

  const updatedPost = await updatePost({
    postId,
    title,
    content,
  });

  return { post: updatedPost };
};
// Delete a post only if the user owns it
export const deleteUserPost = async ({ postId, username }) => {
  const existingPost = await getPostById(postId);

  // Check if the post exists
  if (!existingPost) {
    return { error: "Post not found", statusCode: 404 };
  }

  // Check if the logged-in user owns the post
  if (existingPost.username !== username || existingPost.isGuest === true) {
    return {
      error: "You are not allowed to delete this post",
      statusCode: 403,
    };
  }

  await deletePost(postId);

  return { success: true };
};