import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import Register from '../../components/Register';
import { BrowserRouter } from 'react-router-dom';
import { toast } from 'react-toastify';
import { createUser} from '../../API functions/user_apis';

jest.mock('react-toastify', () => ({
  toast: {
    success: jest.fn(),
    error: jest.fn()
  },
}))

// Mocking the API function
jest.mock('../../API functions/user_apis', () => ({
    createUser: jest.fn()
}));

describe('Testing Register component', () => {
    beforeEach(() => {
        jest.clearAllMocks(); // Clear mock function calls before each test
    });
    it('renders the component without crashing', () => {
        const { getByText, getByPlaceholderText } = render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );
        expect(getByText('Sign Up Here !')).toBeInTheDocument();
        expect(getByPlaceholderText('Pick a Username')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter a Password')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter Your Full Name')).toBeInTheDocument();
        expect(getByPlaceholderText('Enter Your Email')).toBeInTheDocument();
        expect(getByText('Sign Up')).toBeInTheDocument();
    });

    it('validates input fields on form submission', async () => {
        const { getByText, getByPlaceholderText } = render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );
        // No Email
        fireEvent.click(getByText('Sign Up'));
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
        });
        // No full name
        fireEvent.change(getByPlaceholderText('Enter Your Email'), {
            target: { value: 'abc@gmail.com' },
        });
        fireEvent.click(getByText('Sign Up'));
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
        });
        // No password
        fireEvent.change(getByPlaceholderText('Pick a Username'), {
            target: { value: 'abc' },
        });
        fireEvent.click(getByText('Sign Up'));
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
        });
        // No username
        fireEvent.change(getByPlaceholderText('Enter a Password'), {
            target: { value: 'abc123' },
        });
        fireEvent.click(getByText('Sign Up'));
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalled();
        });
    });
    it('should call createUser function and redirect on successful registration', async () => {
        const { getByText, getByPlaceholderText } = render(
            <BrowserRouter>
                <Register />
            </BrowserRouter>
        );

        const signUpButton = getByText('Sign Up');
        const mockResponse = {
            status: 201,
        };
        const mockData = {};
        mockData.name = 'John Doe';
        mockData.email = 'john@example.com';
        mockData.username = 'username';
        mockData.password = 'Passw123';

        createUser.mockImplementation((data) => {
            return Promise.resolve(mockResponse);
        });
    
        fireEvent.change(getByPlaceholderText('Pick a Username'), { target: { value: 'username' } });
        fireEvent.change(getByPlaceholderText('Enter a Password'), { target: { value: 'Passw123' } });
        fireEvent.change(getByPlaceholderText('Enter Your Full Name'), { target: { value: 'John Doe' } });
        fireEvent.change(getByPlaceholderText('Enter Your Email'), { target: { value: 'john@example.com' } });
    
        fireEvent.click(signUpButton);
    
        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledTimes(0);
            expect(createUser).toHaveBeenCalledTimes(1);
            expect(createUser).toHaveBeenCalledWith(mockData);
            expect(toast.success).toHaveBeenCalledTimes(1);
        });
      });
})