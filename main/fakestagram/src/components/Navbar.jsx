import {
  React, useState, useContext, useEffect,
} from 'react';
import {
  Link,
  // useNavigate
} from 'react-router-dom';
import LoginContext from '../context/LoginContext';
import logo from '../img/insta.png';
import '../css/Navbar.css';

function Navbar() {
  // const navigate = useNavigate();
  const { userLogin, setModalOpen, userData } = useContext(LoginContext);
  const [user, setUser] = useState([]);

  useEffect(() => {
    if (userLogin) { setUser(userData); }
  }, [userLogin, userData]);

  const loginStatus = () => {
    if (!userLogin) {
      return [
        <div key={1}>
          <Link to="/signup" key={1}>
            <button
              type="button"
              className="Btn"
            >
              Sign Up
            </button>
          </Link>
          <Link
            to="/signin"
            key={2}
          >
            <button type="button" className="Btn">Log In</button>
          </Link>
        </div>,
      ];
    }
    return [
      <div key={1} className="navmenu-container">
        <Link to="/">
          <button
            type="button"
            className="Btn"
            onClick={() => {
            }}
          >
            Home
          </button>
        </Link>
        <Link to="/createpost">
          <button
            type="button"
            className="Btn"
            onClick={() => {
            }}
          >
            Create
          </button>
        </Link>

        <Link to="/profile" state={{ name: user.username }}>
          <button
            type="button"
            className="Btn"
            onClick={() => {
            }}
          >
            Profile
          </button>
        </Link>

        <button
          type="button"
          className="Btn"
          onClick={() => {
            setModalOpen(true);
          }}
        >
          Logout
        </button>

      </div>,
    ];
  };

  return (
    <div className="navbar" data-testid="navbar">
      <img
        id="ig-logo"
        src={logo}
        alt="insta-logo"
      />

      <div className="nav-menu">{loginStatus()}</div>

    </div>
  );
}

export default Navbar;
