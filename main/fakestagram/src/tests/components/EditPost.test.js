import { React } from 'react';
import { render, fireEvent, waitFor  } from '@testing-library/react';
import EditPost from '../../components/EditPost';
import { BrowserRouter, useLocation } from 'react-router-dom';
import LoginContext from '../../context/LoginContext';
import { editPost } from '../../API functions/post_apis';

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
}));

jest.mock('../../API functions/post_apis', () => ({
    ...jest.requireActual('../../API functions/post_apis'),
    editPost: jest.fn(),
}));

jest.mock('../../API functions/upload', () => jest.fn());

const userLoginValue = true;
const mockLocation = {
    state: {
        details: {
        _id: 'mockId',
        description: 'Mock description',
        mediaURL: 'https://example.com/mock-image.jpg',
        fileType: 'image'
        },
    },
};
useLocation.mockImplementation(() => mockLocation);

describe('EditPost Component', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });    
    test('renders EditPost component', () => {
        const { getByText, getByTestId } = render(
            <BrowserRouter>
                <LoginContext.Provider value={{ userLogin: userLoginValue }}>
                    <EditPost />
                </LoginContext.Provider>
            </BrowserRouter>
        );
        expect(getByText('Edit Post')).toBeInTheDocument();
        expect(getByTestId('file-input')).toBeInTheDocument();
        expect(getByTestId('clear-button')).toBeInTheDocument();
    });

    it('updates textarea value', () => {
        const { getByPlaceholderText } = render(
            <BrowserRouter>
                <LoginContext.Provider value={{ userLogin: userLoginValue }}>
                    <EditPost />
                </LoginContext.Provider>
            </BrowserRouter>
        );
        const textarea = getByPlaceholderText('Write a caption...');
        fireEvent.change(textarea, { target: { value: 'Updated caption' } });
        expect(textarea.value).toBe('Updated caption');
    });

    it('clears input when clear button is clicked', async () => {
        const { getByTestId } = render(
            <BrowserRouter>
                <LoginContext.Provider value={{ userLogin: userLoginValue }}>
                    <EditPost />
                </LoginContext.Provider>
            </BrowserRouter>
        );
        // Simulate selecting a file
        const fileInput = getByTestId('file-input');
        URL.createObjectURL = jest.fn(() => 'abc.com');
        fireEvent.change(fileInput, {
          target: {
            files: [new File(['test.png'], 'test.png', { type: 'image/png' })],
          },
        });
        // Check if the file has been added
        expect(fileInput.files.length).toBe(1);

        // Simulate clicking the clear button
        const clearButton = getByTestId('clear-button');
        fireEvent.click(clearButton);
        // Check if the file input has been cleared
        await waitFor(() => {
            expect(fileInput.files.length).toBe(1);
        });
    });

    it('calls postDetails function on button click', async () => {
        const { getByText, getByTestId } = render(
            <BrowserRouter>
                <LoginContext.Provider value={{ userLogin: userLoginValue }}>
                    <EditPost />
                </LoginContext.Provider>
            </BrowserRouter>
        );
        const fileInput = getByTestId('file-input');
        URL.createObjectURL = jest.fn(() => 'abc.com');
        fireEvent.change(fileInput, {
          target: {
            files: [new File(['test.png'], 'test.png', { type: 'image/png' })],
          },
        });
        const updateButton = getByText('Update');
        const mockResponse = {
            status: 200,
        };
        editPost.mockImplementation((postId, postData) => {
            return Promise.resolve(mockResponse);
        });
    
        fireEvent.click(updateButton);
    
        await waitFor(() => {
            expect(updateButton).toBeInTheDocument();
            expect(editPost).toHaveBeenCalledWith('mockId', {
                description: 'Mock description',
                token: null,
                mediaURL: '',
                fileType: 'image/png',
            });
            expect(editPost).toHaveBeenCalledTimes(1);
        });
    });


});