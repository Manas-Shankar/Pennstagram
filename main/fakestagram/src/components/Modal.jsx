import { React, useContext } from 'react';
import { RiCloseLine } from 'react-icons/ri';
import { useNavigate } from 'react-router-dom';
import LoginContext from '../context/LoginContext';
import '../css/Modal.css';

// eslint-disable-next-line react/prop-types
function Modal({ setModalOpen }) {
  const { setUserLogin, setUserData } = useContext(LoginContext);
  const navigate = useNavigate();

  return (
    <div
      className="darkBg"
    >
      <div className="centered">
        <div className="modal">
          <div className="modalHeader">
            <h5 className="heading">
              Confirm
            </h5>
          </div>
          {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
          <button type="button" className="closeBtn">
            <RiCloseLine />
          </button>
          <div className="modalContent">
            Are you sure you want to logout ?
          </div>
          <div className="modalActions">
            <div className="actionsContainer">

              <button
                type="button"
                className="logOutBtn"
                onClick={() => {
                  setModalOpen(false);
                  setUserLogin(false);
                  setUserData([]);
                  // eslint-disable-next-line no-undef
                  localStorage.removeItem('token');
                  navigate('/signin');
                  global.location.reload();
                }}
              >
                Log Out
              </button>

              <button
                type="button"
                className="cancelBtn"
                onClick={() => {
                  setModalOpen(false);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Modal;
