import React from 'react';
import { render, screen } from '@testing-library/react';
import Home from '../../components/Home';
import LoginContext from '../../context/LoginContext';
import { BrowserRouter, useLocation, useNavigate } from 'react-router-dom';
import { getAllPosts } from '../../API functions/post_apis';
import { getAllFollowing } from '../../API functions/follow_apis';
import { getUser, updates } from '../../API functions/user_apis';


const userLoginValue = true;
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));


describe('Home Component', () => {
  beforeEach(() => {
    // Mock localStorage getItem method
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'your-mock-token'),
      },
      writable: true,
    });
  });

  it('renders home component with initial data', async () => {
    // Mock necessary context values
    const mockUser = { username: 'testuser', /* other necessary values */ };
    const mockFollows = ['user1', 'user2']; // Mocked follows data

    useNavigate.mockImplementation(() => jest.fn());

    const mockLoginContextValue = {
        userLogin: true, // Set the userLogin value to match your scenario
        userData: {
          username: 'testUser', // Set other necessary user data
          // Add other properties as needed
        },
        setUserData: jest.fn(), // Mock setUserData function if used in the component
    };

    // Mock API functions used in the component
    jest.mock('../../API functions/post_apis', () => ({
        getAllPosts: jest.fn(() => Promise.resolve({ status: 200, data: { data: [] } })),
    }));

    jest.mock('../../API functions/follow_apis', () => ({
        getAllFollowing: jest.fn(() => Promise.resolve({ status: 200, data: { data: mockFollows } })),
    }));

    jest.mock('../../API functions/user_apis', () => ({
        getUser: jest.fn(() => Promise.resolve({ status: 200, data: { data: mockUser } })),
        updates: jest.fn(() => Promise.resolve({ data: { message: 'new post' } })),
    }));

    render(
    <BrowserRouter>
        <LoginContext.Provider value={{ mockLoginContextValue }}>
            <Home />
        </LoginContext.Provider>
    </BrowserRouter>
    );

  });

})