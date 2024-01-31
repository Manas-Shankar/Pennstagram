import axios, * as others from 'axios';

async function getAllFollowing(username) {
  try {
    // eslint-disable-next-line no-console
    console.log(others);
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
    const response = await axios.put(`http://localhost:8080/follows/follow/${username}`, data, { headers: { authorization: `Bearer ${data.token}` } });
    return response;
  } catch (err) {
    return err;
  }
}

async function unfollowUser(username, data) {
  try {
    const response = await axios.put(`http://localhost:8080/follows/unfollow/${username}`, data, { headers: { authorization: `Bearer ${data.token}` } });
    return response;
  } catch (err) {
    return err;
  }
}

export {
  getAllFollowing,
  getAllFollowers,
  followUser,
  unfollowUser,
};
