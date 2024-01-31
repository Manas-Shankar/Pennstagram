/* eslint-disable react/prop-types */
import {
  React, useState, useEffect, useContext, useRef,
} from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import _ from 'lodash';
import LoginContext from '../context/LoginContext';
import logo from '../assets/logo.svg';
import liked from '../assets/liked.png';
import notLiked from '../assets/not_liked.png';
import commentPNG from '../assets/comment.png';
import '../css/Post.css';
import Comment from './Comment';
import {
  getPostbyId, likePost, unlikePost, commentOnPost, hidePost,
  unhidePost,
} from '../API functions/post_apis';
import { updates } from '../API functions/user_apis';

function Post(props) {
  const { userData, userLogin } = useContext(LoginContext);
  const [render, setRender] = useState(false);
  const [Liked, setLiked] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [unhidden, setunhidden] = useState(false);
  const [postdata, setPostdata] = useState({});
  const [commentBox, setCommentBox] = useState(false);
  const [commentBody, setCommentBody] = useState('');
  const [stateUpdate, setUpdate] = useState('');
  const [callOnce, setCallOnce] = useState(true);

  const notifyErr = (msg) => toast.error(msg);
  const notifySucc = (msg) => toast.success(msg);
  const navigate = useNavigate();
  // eslint-disable-next-line react/prop-types
  const {
    postData,
    user,
  } = props;

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
        if (res.data?.message === 'new comment') {
          setUpdate(res.data?.message);
        } else {
          setUpdate('');
          setCallOnce(true);
        }
        if (stateUpdate === 'new comment' && callOnce) {
          getPostbyId(postdata._id)
            .then((resp) => {
              if (resp.status === 200) {
                // console.log(resp.data.data);
                // console.log(_.isEqual(postdata, resp.data.data));
                if (!_.isEqual(postdata, resp.data.data)) {
                  // eslint-disable-next-line no-console
                  console.log('reset comment');
                  setPostdata(resp.data.data);
                }
                // setCallOnce(false);
              } else {
                // eslint-disable-next-line no-console
                console.log(resp.response.data.error);
                // notifyErr(resp.response.data.error);
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

  useEffect(() => {
    if (userLogin) {
      if (postData) {
        setPostdata(postData);
        // console.log(postData);
        // console.log(postData);
        // eslint-disable-next-line react/prop-types
        if (postData.likes?.includes(userData.username)) {
          setLiked(true);
        }
        // eslint-disable-next-line react/prop-types
        if (userData.hidden?.includes(postData._id) && user === userData.username) {
          setHidden(true);
        } else if (userData.hidden?.includes(postData._id) && user !== userData.username) {
          setunhidden(true);
        }
        setRender(true);
      }
    }
    return undefined;
  }, [postData, userData]);

  const handlePostEdit = () => {
    navigate('/editpost', { state: { details: postdata } });
  };

  const handleLiked = () => {
    if (Liked) {
      const data = {};
      data.user_id = userData.username;
      // eslint-disable-next-line no-undef
      data.token = localStorage.getItem('token');
      // console.log(data);

      unlikePost(postdata._id, data)
        .then((response) => {
          if (response.status === 200) {
            // eslint-disable-next-line no-console
            console.log(response.status);
            setLiked(false);
          } else {
            // console.log(response);
            notifyErr(response.response.data.message);
          }
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
          notifyErr(err.response.data.message);
        });
    } else {
      const data = {};
      data.user_id = userData.username;
      // eslint-disable-next-line no-undef
      data.token = localStorage.getItem('token');

      likePost(postdata._id, data)
        .then((response) => {
          if (response.status === 200) {
            // eslint-disable-next-line no-console
            console.log(response.status);
            setLiked(true);
          } else {
            // console.log(response);
            notifyErr(response.response.data.message);
          }
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
          notifyErr(err.response.data.message);
        });
    }

    getPostbyId(postdata._id)
      .then((resp) => {
        if (resp.status === 200) {
          // console.log(resp.data.data);
          setPostdata(resp.data.data);
        } else {
          // console.log(response.response.data.error);
          notifyErr(resp.response.data.error);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
  };

  const handlePostUnhide = async () => {
    setunhidden(false);
    unhidePost(postdata._id, userData.username)
      .then((response) => {
        if (response.status === 200) {
          // eslint-disable-next-line no-console
          console.log(response.status);
        } else {
          // eslint-disable-next-line no-console
          console.log(response.response.data.error);
          // notifyErr(response.response.data.error);
        }
      })
      .catch((err) => {
        // console.log(err);
        notifyErr(err);
      });
  };

  const handlePostHide = () => {
    setHidden(true);
    hidePost(postdata._id, userData.username)
      .then((response) => {
        if (response.status === 200) {
          // eslint-disable-next-line no-console
          console.log(response.status);
        } else {
          // eslint-disable-next-line no-console
          console.log(response.response.data.error);
          // notifyErr(response.response.data.error);
        }
      })
      .catch((err) => {
        // console.log(err);
        notifyErr(err);
      });
  };

  const handleComment = () => {
    if (commentBox) {
      setCommentBox(false);
      setCommentBody('');
    } else {
      setCommentBox(true);
    }
  };

  const submitComment = () => {
    const comment = {
      user_id: '',
      content: '',
      // eslint-disable-next-line no-undef
      token: localStorage.getItem('token'),
    };

    comment.user_id = userData.username;
    comment.content = commentBody;

    commentOnPost(postdata._id, comment)
      .then((response) => {
        // eslint-disable-next-line no-console
        console.log(response.status);
        if (response.status === 200) {
          notifySucc('Successfully Added Comment !');
          setCommentBox(false);
          setCommentBody('');
          getPostbyId(postdata._id)
            .then((resp) => {
              if (resp.status === 200) {
                // console.log(resp.data.data);
                setPostdata(resp.data.data);
              } else {
                // eslint-disable-next-line no-console
                console.log(response.response.data.error);
                // notifyErr(resp.response.data.error);
              }
            })
            .catch((err) => {
              // eslint-disable-next-line no-console
              console.log(err);
            });
        } else {
          // console.log(response);
          notifyErr(response.response.data.message);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
        notifyErr(err.response.data.message);
      });
  };

  return (
    render
      && !hidden
      && (
      <div className="Post">
        <div className="Post-Header">
          <img src={logo} alt="profile" className="profileImage" />
          <div className="user-display-name">{postdata?.user_id}</div>
          {
            postdata.user_id === userData.username && (
              <button type="button" className="link-to-edit-post" value={postdata?.datePosted} onClick={() => { handlePostEdit(); }}>Edit Post</button>
            )
          }
          {
            (user === userData.username && user !== postData.user_id) ? (
              <button type="button" className="link-to-edit-post" value={postdata?.datePosted} onClick={() => { handlePostHide(); }}>
                Hide Post
              </button>
            ) : (
              unhidden && (
                <button type="button" className="link-to-edit-post" value={postdata?.datePosted} onClick={() => { handlePostUnhide(); }}>
                  Unhide Post
                </button>
              )
            )
          }
        </div>
        <div className="img-container">
          {
            postdata.mediaURL?.length > 0 && postdata.fileType?.includes('image') && postdata.mediaURL?.includes('https') && (
              <img src={postdata.mediaURL} alt="logo" className="post-img" />
            )
        }
          {
              postdata.mediaURL?.length > 0 && postdata.fileType?.includes('video') && (
                <video
                  className="vid-player"
                  controls
                >
                  <source src={postdata.mediaURL} type="video/mp4" />
                  <track kind="captions" />
                </video>
              )
        }
        </div>
        <div className="Post-Interactions">
          <button type="button" onClick={() => { handleLiked(); }}><img src={Liked ? liked : notLiked} alt="like" /></button>
          <button type="button" className="comment-png" onClick={() => { handleComment(); }}><img src={commentPNG} alt="comment" /></button>
        </div>
        <div className="Post-Description">
          <p>{postdata.description}</p>
          {commentBox && (
            <div className="comment-container">
              <strong>New Comment</strong>
              <textarea
                value={commentBody}
                onChange={(event) => {
                  setCommentBody(event.target.value);
                }}
                className="comment-textarea"
              />
              <button type="button" className="link-to-edit-post" onClick={() => { submitComment(); }}>add comment</button>
              <button type="button" className="cancel-comment" onClick={() => { handleComment(); }}>cancel</button>
            </div>
          )}
        </div>
        <div className="Post-Comments">
          {postdata.comments.map((comment) => <Comment key={comment.content} data={comment} />)}
        </div>
      </div>
      )
  );
}

export default Post;
