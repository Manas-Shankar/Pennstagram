import { React, useState } from 'react';
import '../css/Register.css';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
// import axios from 'axios';
// eslint-disable-next-line import/no-extraneous-dependencies
import validator from 'validator';
import { createUser } from '../API functions/user_apis';

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
  });

  const notifyErr = (msg) => toast.error(msg);
  const notifySuccess = (msg) => toast.success(msg);

  const postData = () => {
    const data = {};
    data.name = formData.name;
    data.email = formData.email;
    data.username = formData.username;
    data.password = formData.password;

    // console.log(data);
    if (!validator.isEmail(data.email)) {
      notifyErr('please enter an email of format xxx@yyy.com !');
    } else if (data.username.length < 3 || data.username.length > 10) {
      notifyErr('username must be between 3 and 10 characters !');
    } else if (validator.isAlpha(data.password)
    || data.password.length < 2 || data.password.length > 12) {
      notifyErr('password must contain numeric or special characters, and must be between 3 and 12 characters long !');
    } else if (data.name.length < 2) {
      notifyErr('full name is required !');
    } else {
      createUser(data)
        .then((response) => {
          if (response.status === 201) {
            notifySuccess('Registration sucess !');
            navigate('/signin');
          } else {
            // console.log(response.response);
            notifyErr(response.response.data.error);
          }
        })
        .catch((err) => {
          // console.log(err);
          notifyErr(`something went wrong, ${err}!`);
        });
    }
  };

  return (
    <div className="container">
      <div className="float-child-right">
        <h1>Sign Up Here !</h1>
        <div className="form">
          <div className="form-body">
            <div className="username">
              <label className="form__label" htmlFor={formData.username}>Username</label>
              <input
                className="form__input"
                type="text"
                placeholder="Pick a Username"
                value={formData.username}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    username: e.target.value,
                  });
                }}
                id={formData.username}
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
                placeholder="Enter a Password"
                value={formData.password}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    password: e.target.value,
                  });
                }}
              />
            </div>

            <div className="fullname">
              <label className="form__label" htmlFor="fullName">Full Name </label>
              <input
                type="text"
                name=""
                id="fullName"
                className="form__input"
                placeholder="Enter Your Full Name"
                value={formData.name}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    name: e.target.value,
                  });
                }}
              />
            </div>

            <div className="email">
              <label className="form__label" htmlFor="email">Email </label>
              <input
                type="email"
                id="email"
                className="form__input"
                placeholder="Enter Your Email"
                value={formData.email}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    email: e.target.value,
                  });
                }}
              />
            </div>

          </div>
          <div className="footer">
            <button type="submit" onClick={postData} className="submit-button">Sign Up</button>
          </div>
        </div>
      </div>
    </div>

  );
}
export default Register;
