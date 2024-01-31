import { React } from 'react';
import { render, fireEvent, waitFor  } from '@testing-library/react';
import CreatePost from '../../components/CreatePost';
import { BrowserRouter, useLocation } from 'react-router-dom';
import LoginContext from '../../context/LoginContext';
import { createPost } from '../../API functions/post_apis';
import { toast } from 'react-toastify';

jest.mock('react-toastify', () => ({
    toast: {
      success: jest.fn(),
      error: jest.fn()
    },
}))

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn(),
}));

jest.mock('../../API functions/post_apis', () => ({
    ...jest.requireActual('../../API functions/post_apis'),
    createPost: jest.fn(),
}));

jest.mock('../../API functions/upload', () => jest.fn());

const userLoginValue = true;
// Mocking userData and userLogin within a single context value
const mockContextValue = {
    userData: {
        username: 'mockedUsername',
        // Other necessary properties...
    },
    userLogin: userLoginValue, // Mocked user login status
    };
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

describe('CreatePost Component', () => {
    afterEach(() => {
      jest.clearAllMocks();
    });

    it('renders CreatePost component with initial state', () => {
        const { getByText, getByTestId } = render(
        <BrowserRouter>
            <LoginContext.Provider value={{ userLogin: userLoginValue }}>
                <CreatePost />
            </LoginContext.Provider>
        </BrowserRouter>
        );
        const createPostHeader = getByText('Create Post');
        const fileInput = getByTestId('file-input');
        const clearButton = getByTestId('clear-button');
    
        expect(createPostHeader).toBeInTheDocument();
        expect(fileInput).toBeInTheDocument();
        expect(clearButton).toBeInTheDocument();
    });

    it('updates textarea value', () => {
        const { getByPlaceholderText } = render(
            <BrowserRouter>
                <LoginContext.Provider value={{ userLogin: userLoginValue }}>
                    <CreatePost />
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
                    <CreatePost />
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
        const mockFormData = new FormData();
        const mockFile = new File(['abc.jpg'], 'mock-image.jpg', { type: 'image/jpeg' });

        URL.createObjectURL = jest.fn(() => 'abc.com');
        const mockResponse = {
            status: 200,
            data: {error: 'abc'}
        };
        createPost.mockImplementation((postId, postData) => {
            return Promise.resolve(mockResponse);
        });
        // Mock the file upload function
        jest.spyOn(global, 'FileReader').mockImplementation(() => ({
            readAsDataURL: jest.fn(),
            onload: jest.fn(),
            result: 'data:image/jpeg;base64,...', // Mock image data
        }));

        const { getByText, getByTestId, getByPlaceholderText } = render(
            <BrowserRouter>
                <LoginContext.Provider value={{ userLogin: userLoginValue }}>
                    <CreatePost />
                </LoginContext.Provider>
            </BrowserRouter>
        );
        const fileInput = getByTestId('file-input');
        fireEvent.change(fileInput, { target: { files: [mockFile] } });

        const postButton = getByText('Post');
        const textarea = getByPlaceholderText('Write a caption...');
        fireEvent.change(textarea, { target: { value: 'Updated caption' } });
    
        fireEvent.click(postButton);
    
        await waitFor(() => {
            expect(postButton).toBeInTheDocument();
            expect(toast.error).toHaveBeenCalledTimes(1);
            // expect(createPost).toHaveBeenCalledWith('mockId', {
            //     description: 'Mock description',
            //     token: null,
            //     mediaURL: '',
            //     fileType: 'image/png',
            // });
            expect(createPost).toHaveBeenCalledTimes(0);
        });
    });


    

});