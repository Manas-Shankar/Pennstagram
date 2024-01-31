import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import Modal from '../../components/Modal';
import LoginContext from '../../context/LoginContext';

const userLoginValue = true;

// Mocking the LoginContext
// jest.mock('../../context/LoginContext', () => ({
//     setUserLogin: jest.fn(),
//     setUserData: jest.fn(),
//   }));

describe('Modal component', () => {
    it('renders without crashing', () => {
        const { getByText } = render(
            <BrowserRouter>
                <LoginContext.Provider value={{ userLogin: userLoginValue }}>
                    <Modal />
                </LoginContext.Provider>
            </BrowserRouter>
        );
        const confirmText = getByText('Confirm');
        expect(confirmText).toBeInTheDocument();
    });

    it('closes the modal when "Cancel" button is clicked', () => {
        const setModalOpen = jest.fn();
    
        const { getByText } = render(
            <BrowserRouter>
                <LoginContext.Provider value={{ userLogin: userLoginValue }}>
                    <Modal setModalOpen={setModalOpen} />
                </LoginContext.Provider>
            </BrowserRouter>
        );
        const cancelButton = getByText('Cancel');
    
        fireEvent.click(cancelButton);
        expect(setModalOpen).toHaveBeenCalledWith(false);
      });

    // it('calls the log out function when "Log Out" button is clicked', () => {
    //     const setModalOpen = jest.fn();
    //     const setUserLogin = jest.fn();
    //     const setUserData = jest.fn();
    //     const mockContextValue = {
    //         setUserLogin: jest.fn(),
    //         setUserData: jest.fn(),
    //     };
    //     setUserLogin.mockImplementation(() => {userLoginValue = true});

    //     const { getByText } = render(
    //         <BrowserRouter>
    //             <LoginContext.Provider value={{ mockContextValue }}>
    //                 <Modal setModalOpen={setModalOpen}/>
    //             </LoginContext.Provider>
    //         </BrowserRouter>
    //     );
    //     const logOutButton = getByText('Log Out');
    
    //     // Mock functions passed as props

    //     // global.location.reload = jest.fn();
    
    //     fireEvent.click(logOutButton);
    
    //     // expect(setModalOpen).toHaveBeenCalledWith(false);
    //     // expect(setUserLogin).toHaveBeenCalledWith(false);
    //     // expect(setUserData).toHaveBeenCalledWith([]);
    //     // expect(localStorage.removeItem).toHaveBeenCalledWith('token');
    //     // expect(global.location.reload).toHaveBeenCalled();
    // });
});