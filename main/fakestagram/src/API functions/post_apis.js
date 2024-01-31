import axios, * as others from 'axios';

async function createPost(data) {
  try {
    const response = await axios.post('http://localhost:8080/post', data, { headers: { authorization: `Bearer ${data.token}` } });
    return response;
  } catch (err) {
    return err;
  }
}

async function editPost(id, post) {
  // eslint-disable-next-line no-console
  console.log(others);
  try {
    const response = await axios.put(`http://localhost:8080/post/${id}`, { post }, { headers: { authorization: `Bearer ${post.token}` } });
    return response;
  } catch (err) {
    return err;
  }
}

async function getAllPosts() {
  try {
    const response = await axios.get('http://localhost:8080/posts');
    return response;
  } catch (err) {
    return err;
  }
}

async function getPostbyId(id) {
  try {
    const response = await axios.get(`http://localhost:8080/post/${id}`);
    return response;
  } catch (err) {
    return err;
  }
}

async function getPostsByUser(username) {
  try {
    const response = await axios.get(`http://localhost:8080/posts/${username}`);
    return response;
  } catch (err) {
    return err;
  }
}

async function likePost(id, data) {
  try {
    const response = axios.put(`http://localhost:8080/post/${id}/like`, data, { headers: { authorization: `Bearer ${data.token}` } });
    return response;
  } catch (err) {
    return err;
  }
}

async function unlikePost(id, data) {
  try {
    const response = axios.put(`http://localhost:8080/post/${id}/unlike`, data, { headers: { authorization: `Bearer ${data.token}` } });
    return response;
  } catch (err) {
    return err;
  }
}

async function hidePost(id, username) {
  try {
    const response = axios.put(`http://localhost:8080/user/${username}/hide/${id}`);
    return response;
  } catch (err) {
    return err;
  }
}

async function unhidePost(id, username) {
  try {
    const response = axios.put(`http://localhost:8080/user/${username}/unhide/${id}`);
    return response;
  } catch (err) {
    return err;
  }
}

async function commentOnPost(id, comment) {
  try {
    const response = axios.put(`http://localhost:8080/post/${id}/comment`, { comment }, { headers: { authorization: `Bearer ${comment.token}` } });
    return response;
  } catch (err) {
    return err;
  }
}

export {
  createPost,
  editPost,
  getAllPosts,
  getPostbyId,
  getPostsByUser,
  likePost,
  unlikePost,
  commentOnPost,
  hidePost,
  unhidePost,
};
