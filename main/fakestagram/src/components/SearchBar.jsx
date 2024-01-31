import {
  React, useState, useContext, useEffect,
} from 'react';
// import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import LoginContext from '../context/LoginContext';
import '../css/SearchBar.css';
import { getAllUsers } from '../API functions/user_apis';

// eslint-disable-next-line react/prop-types
function SearchBar() {
  const [selectedOption, setSelectedOption] = useState();
  const {
    userLogin, userData,
    profiles,
    setProfiles,
  } = useContext(LoginContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (userLogin) {
      getAllUsers()
        .then((response) => {
          if (response.status === 200) {
            // console.log(response.data.data);
            setProfiles(response.data.data);
          } else {
            // console.log(response.response.data.error);
          }
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
    }
  }, [userLogin, userData]);

  function handleSelect(name) {
    setSelectedOption(name);
    if (name) {
      const selected = profiles.filter((profile) => profile.username === name);
      // console.log(selected);
      if (selected?.length > 0) {
        navigate('/profile', { state: { name: selected[0].username } });
      }
    }
  }

  return (
    <div className="searchbar" data-testid="searchbar">
      {userLogin && profiles && (
        <div key={1} className="searchbar-container">
          <input
            type="search"
            list="options"
            className="header-search"
            value={selectedOption}
            placeholder="search users"
            onChange={(e) => { handleSelect(e.target.value); }}
          />
          <datalist id="options">
            {profiles.map((profile) => (
              <option key={profile.fullname} value={profile.username}>
                {profile.fullname}
              </option>
            ))}
          </datalist>
        </div>
      )}
    </div>
  );
}

export default SearchBar;
