import axios, * as others from 'axios';

async function loginUserJWT(formData) {
  // eslint-disable-next-line no-console
  console.log(others);
  try {
    const resp = await axios.post('http://localhost:8080/login', { user: formData }, { headers: { authorization: `Bearer ${formData.token}` } });
    return resp;
  } catch (err) {
    return err;
  }
}

async function updates(token) {
  try {
    const resp = await axios.get('http://localhost:8080/update', { headers: { authorization: `Bearer ${token}` } });
    return resp;
  } catch (err) {
    return err;
  }
}

async function loginUser(formData) {
  // eslint-disable-next-line no-console
  console.log(others);
  try {
    const resp = await axios.post('http://localhost:8080/login', { user: formData });
    return resp;
  } catch (err) {
    return err;
  }
}

const setAuthToken = async (token) => {
  if (token) {
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete axios.defaults.headers.common.Authorization;
  }
};

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

export {
  loginUser,
  loginUserJWT,
  createUser,
  getAllUsers,
  getUser,
  setAuthToken,
  updates,
};
