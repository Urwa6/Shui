import { createPost, getPostById } from "../database/post.js";

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