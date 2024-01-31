/* eslint-disable no-undef */
import {
  React, useContext, useEffect, useState,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// eslint-disable-next-line import/no-extraneous-dependencies
import LoginContext from '../context/LoginContext';
import '../css/Login.css';
import {
  loginUser,
  loginUserJWT,
  // getUser,
} from '../API functions/user_apis';

function Login() {
  const {
    setUserData,
    // userLogin,
    setUserLogin,
  } = useContext(LoginContext);
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const notifyErr = (msg) => toast.error(msg);
  const notifySuccess = (msg) => toast.success(msg);

  const redirectToSignup = () => {
    navigate('/signup');
  };

  useEffect(() => {
    const tok = localStorage.getItem('token');
    if (tok) {
      // setAuthToken(tok);

      const formData = {};
      formData.username = '';
      formData.password = '';
      formData.token = tok;

      loginUserJWT(formData)
        .then((response) => {
          if (response.status === 201) {
            // console.log(response.data.data);
            const data = response.data?.data;
            notifySuccess('login success!');
            setUserLogin(true);

            navigate('/');
            setUserData(data);
          } else {
            // console.log(response);
            notifyErr(`${response.response.data.message.message} !`);
            if (response.response.data?.message?.message?.includes('expired') || response.response.data?.message?.message?.includes('invalid')) {
              localStorage.removeItem('token');
            }
          }
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
          notifyErr(err.response);
        });
    }
  });

  const postData = () => {
    const formData = {};
    formData.username = username;
    formData.password = password;
    // console.log(formData);
    let data = [];
    loginUser(formData)
      .then((response) => {
        if (response.status === 201) {
          data = response.data.data;
          // console.log(response.data);
          notifySuccess('login success!');
          setUserLogin(true);

          // eslint-disable-next-line prefer-destructuring
          const token = response.data.token;
          localStorage.setItem('token', token);
          // setAuthToken(token);
          navigate('/');
          setUserData(data);
        } else if (response.response?.status === 429) {
          // console.log(response.response);
          notifyErr(response.response.data.message);
        } else {
          // eslint-disable-next-line no-console
          console.log(response);
          if (response.response.data.attempts) {
            notifyErr(`${response.response.data.message}. You have ${response.response.data.attempts} attempts left.`);
          } else {
            notifyErr(`${response.response.data.message}.`);
          }
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
        notifyErr(err.response?.data.error);
      });
  };

  return (
    <div className="container-login">
      <div className="float-child-right">
        <h1>Login Here !</h1>
        <div className="form">
          <div className="form-body">
            <div className="username">
              <label className="form__label" htmlFor="userName">
                Username
              </label>
              <input
                className="form__input"
                type="text"
                id="firstName"
                placeholder="Enter Username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                }}
              />
            </div>
            <div className="password">
              <label className="form__label" htmlFor="password">
                Password
              </label>
              <input
                className="form__input"
                type="password"
                id="password"
                placeholder="Enter Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                }}
              />
            </div>
          </div>
          <div className="footer">
            <button type="submit" onClick={() => { postData(); }} className="submit-button">Login</button>
          </div>
        </div>
        <hr className="horizontal-line" />
        <div>
          <button type="button" onClick={redirectToSignup} className="submit-button">Sign Up</button>
        </div>
      </div>
    </div>

  );
}
export default Login;
