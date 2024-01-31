import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import Login from '../../components/Login';
import LoginContext from '../../context/LoginContext';
import { toast } from 'react-toastify';
import { loginUser, loginUserJWT } from '../../API functions/user_apis';

const userLoginValue = true;

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  },
}))

jest.mock('../../API functions/user_apis', () => ({
  ...jest.requireActual('../../API functions/user_apis'),
  loginUser: jest.fn(),
  loginUserJWT: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
}));

const mockNavigate = {
  pathname: "abc"
};
useNavigate.mockImplementation(() => mockNavigate);

describe('Login component', () => {
  afterEach(() => {
      jest.clearAllMocks();
  }); 
  it('should render the login form', () => {
      const { getByPlaceholderText, getByText } = render(
        <BrowserRouter>
          <LoginContext.Provider value={{ userLogin: userLoginValue }}>
            <Login />
          </LoginContext.Provider>
        </BrowserRouter>
      );
    const usernameInput = getByPlaceholderText('Enter Username');
    const passwordInput = getByPlaceholderText('Enter Password');
    const loginButton = getByText('Login');
    const signupButton = getByText('Sign Up');
    expect(usernameInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
    expect(signupButton).toBeInTheDocument();
  });

  it('should update state on input change', () => {
    const { getByPlaceholderText } = render(
      <BrowserRouter>
        <LoginContext.Provider value={{ userLogin: userLoginValue }}>
          <Login />
        </LoginContext.Provider>
      </BrowserRouter>
    );
    const usernameInput = getByPlaceholderText('Enter Username');
    const passwordInput = getByPlaceholderText('Enter Password');
    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'testPassword' } });
    expect(usernameInput.value).toBe('testUser');
    expect(passwordInput.value).toBe('testPassword');
  });

  it('should trigger login function on button click (201)', async () => {
    const setUserLogin = jest.fn();
    const setUserData = jest.fn();
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      setUserLogin,
      setUserData,
    }));
    const mockFormData = {};
    mockFormData.username = "user0";
    mockFormData.password = "abc";

    const mockResponse = {
      status: 201,
      data: {data: mockFormData}
    };

    loginUser.mockImplementation((formData) => {
        return Promise.resolve(mockResponse);
    });

    const { getByPlaceholderText, getByText } = render(
        <LoginContext.Provider value={{ userLogin: userLoginValue }}>
          <Login />
        </LoginContext.Provider>
    );
    const usernameInput = getByPlaceholderText('Enter Username');
    const passwordInput = getByPlaceholderText('Enter Password');
    const loginButton = getByText('Login');

    fireEvent.change(usernameInput, { target: { value: 'user0' } });
    fireEvent.change(passwordInput, { target: { value: 'abc' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledTimes(1);
      expect(loginUser).toHaveBeenCalledWith(mockFormData);
    });
  });

  it('should trigger login function on button click (429)', async () => {
    const setUserLogin = jest.fn();
    const setUserData = jest.fn();
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      setUserLogin,
      setUserData,
    }));
    const mockFormData = {};
    mockFormData.username = "user0";
    mockFormData.password = "abc";

    const mockResponse = {
      response: {status: 429,
        data: { message: mockFormData}
      }
    };
    loginUser.mockImplementation((formData) => {
        return Promise.resolve(mockResponse);
    });
    jest.spyOn(Storage.prototype, 'setItem');
    loginUserJWT.mockImplementation((formData) => {
      return Promise.resolve(mockResponse);
    });
    const { getByPlaceholderText, getByText } = render(
        <LoginContext.Provider value={{ userLogin: userLoginValue }}>
          <Login />
        </LoginContext.Provider>
    );
    const usernameInput = getByPlaceholderText('Enter Username');
    const passwordInput = getByPlaceholderText('Enter Password');
    const loginButton = getByText('Login');

    fireEvent.change(usernameInput, { target: { value: 'user0' } });
    fireEvent.change(passwordInput, { target: { value: 'abc' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledTimes(1);
      expect(loginUser).toHaveBeenCalledWith(mockFormData);
      expect(toast.error).toHaveBeenCalled();
    });
  });

  it('should trigger login function on button click (other)', async () => {
    const setUserLogin = jest.fn();
    const setUserData = jest.fn();
    jest.spyOn(React, 'useContext').mockImplementation(() => ({
      setUserLogin,
      setUserData,
    }));
    const mockFormData = {};
    mockFormData.username = "user0";
    mockFormData.password = "abc";

    const mockResponse = {
      response: {status: 400,
        data: { message: mockFormData}
      }
    };
    loginUser.mockImplementation((formData) => {
        return Promise.resolve(mockResponse);
    });
    jest.spyOn(Storage.prototype, 'setItem');
    loginUserJWT.mockImplementation((formData) => {
      return Promise.resolve(mockResponse);
    });

    const { getByPlaceholderText, getByText } = render(
        <LoginContext.Provider value={{ userLogin: userLoginValue }}>
          <Login />
        </LoginContext.Provider>
    );
    const usernameInput = getByPlaceholderText('Enter Username');
    const passwordInput = getByPlaceholderText('Enter Password');
    const loginButton = getByText('Login');

    fireEvent.change(usernameInput, { target: { value: 'user0' } });
    fireEvent.change(passwordInput, { target: { value: 'abc' } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(loginUser).toHaveBeenCalledTimes(1);
      expect(toast.error).toHaveBeenCalled();
    });
  });
})

it('should trigger JWT login function with valid token', async () => {
  const mockFormData = {};
  mockFormData.username = "user0";
  mockFormData.password = "abc";

  const mockResponse = {
    response: {status: 400,
      data: { message: mockFormData}
    }
  };
  loginUserJWT.mockImplementation((formData) => {
    return Promise.resolve(mockResponse);
  });
  render(
    <LoginContext.Provider value={{ userLogin: userLoginValue }}>
      <Login />
    </LoginContext.Provider>
  );
  expect(loginUserJWT).toHaveBeenCalledTimes(1);
});