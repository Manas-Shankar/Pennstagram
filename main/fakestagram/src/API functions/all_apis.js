import axios, * as others from 'axios';

async function loginUser(formData) {
  console.log(others);
  try {
    const resp = await axios.post('http://localhost:8080/login', { user: formData });
    return resp;
  } catch (err) {
    return err;
  }
}

async function createUser(data) {
  try {
    const resp = await axios.post('http://localhost:8080/user/', data);
    return resp;
  } catch (err) {
    return err;
  }
}

async function getAllUsers() {
  try {
    const response = await axios.get('http://localhost:8080/users');
    return response;
  } catch (err) {
    return err;
  }
}

async function getUser(username) {
  try {
    const response = await axios.get(`http://localhost:8080/user/${username}`);
    return response;
  } catch (err) {
    return err;
  }
}

async function createPost(data) {
  try {
    const response = await axios.post('http://localhost:8080/post', data);
    return response;
  } catch (err) {
    return err;
  }
}

async function editPost(id, post) {
  try {
    const response = await axios.put(`http://localhost:8080/post/${id}`, { post });
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
    const response = axios.put(`http://localhost:8080/post/${id}/like`, data);
    return response;
  } catch (err) {
    return err;
  }
}

async function unlikePost(id, data) {
  try {
    const response = axios.put(`http://localhost:8080/post/${id}/unlike`, data);
    return response;
  } catch (err) {
    return err;
  }
}

async function commentOnPost(id, comment) {
  try {
    const response = axios.put(`http://localhost:8080/post/${id}/comment`, { comment });
    return response;
  } catch (err) {
    return err;
  }
}

async function getAllFollowing(username) {
  try {
    const response = await axios.get(`http://localhost:8080/follows/${username}`);
    return response;
  } catch (err) {
    return err;
  }
}

async function getAllFollowers(username) {
  try {
    const response = await axios.get(`http://localhost:8080/follows/following/${username}`);
    return response;
  } catch (err) {
    return err;
  }
}

async function followUser(username, data) {
  try {
    const response = await axios.put(`http://localhost:8080/follows/follow/${username}`, data);
    return response;
  } catch (err) {
    return err;
  }
}

async function unfollowUser(username, data) {
  try {
    const response = await axios.put(`http://localhost:8080/follows/unfollow/${username}`, data);
    return response;
  } catch (err) {
    return err;
  }
}

export {
  loginUser,
  createUser,
  getAllUsers,
  getUser,
  createPost,
  editPost,
  getAllPosts,
  getPostbyId,
  getPostsByUser,
  likePost,
  unlikePost,
  commentOnPost,
  getAllFollowing,
  getAllFollowers,
  followUser,
  unfollowUser,
};
