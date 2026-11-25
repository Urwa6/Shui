import { createPost } from "../database/post.js";

// Create a post for a registered user
export const createNewPost = async ({ username, title, content }) => {
  return await createPost({
    username,
    title,
    content,
  });
};