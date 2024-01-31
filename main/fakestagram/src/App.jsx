import { BrowserRouter, Route, Routes } from 'react-router-dom';
import {
  React, useState, useMemo,
} from 'react';
// eslint-disable-next-line import/no-extraneous-dependencies
import { ToastContainer } from 'react-toastify';
import { withOneTabEnforcer } from 'react-one-tab-enforcer';
import LoginContext from './context/LoginContext';
import Profile from './components/Profile';
import './App.css';
import Home from './components/Home';
import Register from './components/Register';
import Login from './components/Login';
import Navbar from './components/Navbar';
import 'react-toastify/dist/ReactToastify.css';
import Modal from './components/Modal';
import CreatePost from './components/CreatePost';
import SearchBar from './components/SearchBar';
import EditPost from './components/EditPost';

function App() {
  const [userLogin, setUserLogin] = useState(false);
  const [userData, setUserData] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [profiles, setProfiles] = useState([]);

  const deps = useMemo(
    () => (
      {
        userLogin,
        userData,
        setUserData,
        setUserLogin,
        setModalOpen,
        profiles,
        setProfiles,
      }),
    [userLogin,
      userData, setUserData, setUserLogin, setModalOpen, profiles, setProfiles],
  );

  return (
    <div className="App">
      <BrowserRouter>
        <LoginContext.Provider value={deps}>
          <Navbar />
          <SearchBar />
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/signup" element={<Register />} />
            <Route exact path="/signin" element={<Login />} />
            <Route exact path="/createpost" element={<CreatePost />} />
            <Route exact path="/editpost" element={<EditPost />} />
            <Route exact path="/profile" element={<Profile />} />
          </Routes>
          <ToastContainer />
          {modalOpen && <Modal setModalOpen={setModalOpen} />}
        </LoginContext.Provider>
      </BrowserRouter>
    </div>
  );
}

export default withOneTabEnforcer({ appName: 'fakestagram' })(App);
