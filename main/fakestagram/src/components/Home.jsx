import {
  React, useState, useEffect, useContext, useRef,
} from 'react';
import {
  // BrowserRouter,
  useNavigate,
} from 'react-router-dom';
// import axios from 'axios';
import { toast } from 'react-toastify';
import InfiniteScroll from 'react-infinite-scroll-component/dist/index';
import _ from 'lodash';
import LoginContext from '../context/LoginContext';
import '../css/Home.css';
import Post from './Post';
import { getAllPosts } from '../API functions/post_apis';
import { getAllFollowing } from '../API functions/follow_apis';
import { getUser, updates } from '../API functions/user_apis';

function Home() {
  const navigate = useNavigate();
  const { userLogin, userData, setUserData } = useContext(LoginContext);
  const [follows, setFollows] = useState([]);
  const [posts, setPosts] = useState([]);
  const notifyErr = (msg) => toast.error(msg);
  const randomNumberInRange = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
  const [stateUpdate, setUpdate] = useState('');
  const [callOnce, setCallOnce] = useState(true);
  const [orig, setOrig] = useState([]);

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
      .then(async (res) => {
        // console.log(res.data?.message);
        if (res.data?.message === 'new post') {
          setUpdate(res.data?.message);
        } else {
          setUpdate('');
          setCallOnce(true);
        }
        if (stateUpdate === 'new post' && callOnce) {
          await getAllPosts()
            .then(async (response) => {
              if (response.status === 200) {
                // setCallOnce(false);
                // console.log(_.isEqual(posts, response.data.data));
                if (!_.isEqual(orig, response.data.data)) {
                  // eslint-disable-next-line no-console
                  console.log('reset posts');
                  setPosts(response.data.data);
                  await getUser(userData.username)
                    .then((resp) => {
                      if (resp.status === 200) {
                        // console.log(resp.data.data);
                        setUserData(resp.data.data);
                      } else {
                        // console.log(response.response.data.error);
                        notifyErr(resp.response.data.error);
                      }
                    })
                    .catch((err) => {
                      // eslint-disable-next-line no-console
                      console.log(err);
                    });
                }
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
      })
      .catch((e) => {
        // eslint-disable-next-line no-console
        console.log(e);
        notifyErr(e.response?.data?.message);
      });
  }, 7000);

  const fetchMoreData = async () => {
    await getUser(userData.username)
      .then((resp) => {
        if (resp.status === 200) {
          // console.log(resp.data.data);
          setUserData(resp.data.data);
        } else {
          // console.log(response.response.data.error);
          notifyErr(resp.response.data.error);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });

    await getAllPosts()
      .then((response) => {
        if (response.status === 200) {
          const oldPosts = posts;
          setPosts([...response.data.data, ...oldPosts]);
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

  const fetchData = async () => {
    getAllPosts()
      .then((response) => {
        // console.log(response);
        if (response.status === 200) {
          // console.log(response.data.data);
          setPosts(response.data.data);
          setOrig(response.data.data);
        } else {
          // notifyErr(response.response.data.error);
          // eslint-disable-next-line no-console
          console.log(response.response.data.error);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
        // notifyErr(err);
      });

    getAllFollowing(userData.username)
      .then((response) => {
        // console.log(response);
        if (response.status === 200) {
          // console.log(response.data.data);
          setFollows(response.data.data);
        } else {
          // console.log(response.response);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
  };

  useEffect(() => {
    if (!userLogin) {
      navigate('/signin');
    } else {
      fetchData();
      getUser(userData.username)
        .then((resp) => {
          if (resp.status === 200) {
            // console.log(resp.data.data);
            setUserData(resp.data.data);
          } else {
            // console.log(response.response.data.error);
            notifyErr(resp.response.data.error);
          }
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
        });
    }
  }, [userLogin, navigate]);

  return userData && follows && (
    <div className="home">
      <div className="home-page-posts">
        <div className="followed-posts" id="scrollableDiv">
          <p className="post-text-head"> Posts by those you follow </p>
          <InfiniteScroll
            dataLength={posts.length}
            scrollThreshold={0.99}
            next={fetchMoreData}
            loader=""
            endMessage={<p>You have reached the end</p>}
            // eslint-disable-next-line react/jsx-boolean-value
            hasMore={true}
            // eslint-disable-next-line react/jsx-boolean-value
            height={1024}
          >
            {
              follows?.length > 0
              && posts.filter((post) => follows?.includes(post.user_id)
            && post.user_id !== userData.username).map((FilteredPost) => (
              <Post
                key={randomNumberInRange(1, 10000)}
                postData={FilteredPost}
                user={userData.username}
              />
              ))
              }
          </InfiniteScroll>
        </div>

        <div className="not-followed-posts">
          <p className="post-text-head">  Posts by other people </p>
          <InfiniteScroll
            dataLength={posts.length}
            next={fetchMoreData}
            scrollThreshold={0.99}
            loader=""
            endMessage={<p>You have reached the end</p>}
            // eslint-disable-next-line react/jsx-boolean-value
            hasMore={true}
            // eslint-disable-next-line react/jsx-boolean-value
            height={1024}
          >
            {
              posts
              && follows?.length > 0 ? (posts.filter((post) => !follows?.includes(post.user_id)
            && post.user_id !== userData.username).map((FilteredPost) => (
              <Post
                key={randomNumberInRange(500, 10000000)}
                postData={FilteredPost}
                user={userData.username}
              />
                ))) : (
                  posts
            && posts.filter((post) => post.user_id !== userData.username).map((FilteredPost) => (
              <Post
                key={FilteredPost._id}
                postData={FilteredPost}
                user={userData.username}
              />
            )))
          }
          </InfiniteScroll>
        </div>
      </div>
    </div>
  );
}

export default Home;
