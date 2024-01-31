/* eslint-disable no-undef */
import {
  React, useState, useContext, useEffect, useRef,
} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';
import { toast } from 'react-toastify';
import _ from 'lodash';
import LoginContext from '../context/LoginContext';
import '../css/Profile.css';
import Post from './Post';
import {
  getAllFollowing, getAllFollowers, followUser, unfollowUser,
} from '../API functions/follow_apis';
import { getPostsByUser } from '../API functions/post_apis';
import { getUser, updates } from '../API functions/user_apis';

function Profile() {
  const location = useLocation();
  const description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec vel tristique nunc, at tincidunt risus. ';

  const { userLogin, userData, setUserData } = useContext(LoginContext);
  const [follows, setFollows] = useState(null);
  const [posts, setPosts] = useState([]);
  const [user, setUser] = useState({});
  const [following, setFollowing] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [stateUpdate, setUpdate] = useState('');
  const [callOnce, setCallOnce] = useState(true);

  const notifyErr = (msg) => toast.error(msg);
  const navigate = useNavigate();

  function useInterval(callback, delay) {
    const savedCallback = useRef();
    // Remember the latest callback.

    useEffect(() => {
      savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
      function tick() {
        savedCallback.current();
      }
      if (delay !== null) {
        const id = setInterval(tick, delay);
        return () => clearInterval(id);
      }
      return undefined;
    }, [delay]);
  }

  useInterval(async () => {
    // Your custom logic here
    // eslint-disable-next-line no-undef
    const tok = localStorage.getItem('token');
    await updates(tok)
      .then((res) => {
        if (res.data?.message === 'follower update') {
          setUpdate(res.data?.message);
        } else {
          setUpdate('');
          setCallOnce(true);
        }
        if (stateUpdate === 'follower update' && callOnce) {
          getAllFollowers(location.state.name)
            .then((resp) => {
              if (resp.status === 200) {
                // console.log('who follows the user in the profile: (followers)', resp.data.data);
                if (!_.isEqual(followers, resp.data.data)) {
                  // eslint-disable-next-line no-console
                  console.log('update follower');
                  setFollowers(resp.data.data);
                }
              } else {
                // eslint-disable-next-line no-console
                console.log(resp.response.data.error);
              }
            })
            .catch((err) => {
              // eslint-disable-next-line no-console
              console.log(err);
            });
        }
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.log(e);
        notifyErr(e.response?.data?.message);
      });
  }, 4000);

  const fetchFollowData = async () => {
    getAllFollowing(location.state.name)
      .then((resp) => {
        if (resp.status === 200) {
          // console.log('who the user in the profile is following: (following)', resp.data.data);
          setFollowing(resp.data.data);
        } else {
          // console.log(resp.response.data.error);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });

    getAllFollowers(location.state.name)
      .then((resp) => {
        if (resp.status === 200) {
          // console.log('who follows the user in the profile: (followers)', resp.data.data);
          setFollowers(resp.data.data);
          if (resp.data.data?.includes(userData.username)) { setFollows(true); }
        } else {
          // eslint-disable-next-line no-console
          console.log(resp.response.data.error);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
  };

  const fetchPosts = async () => {
    getPostsByUser(location.state.name)
      .then((response) => {
        // console.log(response);
        if (response.status === 200) {
          setPosts(response.data.data);
          // console.log('user posts:', response.data.data);
        } else {
          // eslint-disable-next-line no-console
          console.log(response.response.data.error);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
  };

  useEffect(() => {
    if (!userLogin) { navigate('/signin'); } else {
      getUser(userData.username)
        .then((resp) => {
          if (resp.status === 200) {
            // console.log(resp.data.data);
            setUserData(resp.data.data);
          } else {
            // eslint-disable-next-line no-console
            console.log(resp.response.data.error);
          }
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        });

      if (location.state.name === userData.username) {
        setUser(userData);
      } else {
        getUser(location.state.name)
          .then((response) => {
            // console.log(response);
            if (response.status === 200) {
              // console.log(response.data.data);
              setUser(response.data.data);
            } else {
              // eslint-disable-next-line no-console
              console.log(response.response.data.error);
            }
          })
          .catch((err) => {
            // eslint-disable-next-line no-console
            console.log(err);
          });
      }

      fetchFollowData();
      fetchPosts();
    }
  }, [location.state, navigate, userLogin]);

  const handleFollows = async () => {
    const followingData = {};

    if (follows) {
      followingData.toRemove = user.username;
      followingData.token = localStorage.getItem('token');
      // console.log(followingData);

      await unfollowUser(userData.username, followingData)
        .then((response) => {
          if (response.status === 200) {
            // console.log(response.status);
            setFollows(false);
          } else {
            // console.log(response);
            notifyErr(response.response.data.message);
          }
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
    } else {
      followingData.toAdd = user.username;
      followingData.token = localStorage.getItem('token');
      // console.log(followingData);
      await followUser(userData.username, followingData)
        .then((response) => {
          if (response.status === 200) {
            // console.log(response.status);
            setFollows(true);
          } else {
            // console.log(response);
            notifyErr(response.response.data.message);
          }
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
    }

    fetchFollowData();
  };

  return (
    user ? (
      <div className="Profile">
        <div className="Profile-header">
          <div className="Profile-image">
            <img alt="profile_image" src={user.avatar} className="prof-img" />
          </div>
          <div className="Profile-body">
            <div className="Profile-body-item">
              <h1>{user.username}</h1>
              {userLogin && location.state.name !== userData.username && (
              <button type="button" onClick={() => { handleFollows(); }}>
                { follows ? 'Unfollow' : 'Follow'}
              </button>
              )}
            </div>
            <div>
              <p className="name">{user.fullname}</p>
            </div>
            <div className="Profile-body-item">
              <p>
                Posts
                {' '}
                {posts?.length}
              </p>
              <p>
                Followers
                {' '}
                {followers?.length}
              </p>
              <p>
                Following
                {' '}
                {following?.length}
              </p>
            </div>
            <div className="description">
              <p className="text">{description}</p>
            </div>
          </div>
        </div>
        <div className="Profile-posts">
          <div className="post-resize">
            {
               posts?.map((post) => (
                 <Post key={post._id} postData={post} user={location.state.name} />
               ))
            }
          </div>
        </div>
      </div>
    ) : (
      <>

      </>
    )
  );
}

export default Profile;
