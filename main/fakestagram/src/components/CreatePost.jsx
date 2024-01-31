import React, {
  useEffect, useContext, useRef, useState,
} from 'react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
import LoginContext from '../context/LoginContext';
import '../css/CreatePost.css';
import { createPost } from '../API functions/post_apis';
import uploadFile from '../API functions/upload';
// import { setAuthToken } from '../API functions/user_apis';

function CreatePost() {
  const [imgPreview, setImgPreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [postData, setPostData] = useState({
    body: '',
    // imagePath: null,
    // videoPath: null,
  });
  const [files, setFiles] = useState([]);
  const [fileType, setFileType] = useState('');
  const notifyErr = (msg) => toast.error(msg);
  const notifySucc = (msg) => toast.success(msg);

  const { userData, userLogin } = useContext(LoginContext);

  const navigate = useNavigate();

  useEffect(() => {
    if (!userLogin) {
      navigate('/signin');
    }
  });

  const inputFile = useRef(null);

  const updateFile = (e) => {
    setFiles([...e.target.files]);
  };

  const loadImage = (e) => {
    setFileType(e?.target?.files[0]?.type);
    if (e?.target?.files[0]?.type === 'video/mp4') {
      setVideoPreview(URL.createObjectURL(e?.target?.files[0]));
    } else {
      setImgPreview(URL.createObjectURL(e.target.files[0]));
    }
  };

  const clearInput = () => {
    setImgPreview('');
    setVideoPreview('');
    setFileType('');

    if (inputFile.current) {
      inputFile.current.value = '';
      inputFile.current.type = 'text';
      inputFile.current.type = 'file';
    }

    // console.log(postData);
  };

  const postDetails = async () => {
    if (!postData.body) {
      return notifyErr('Please fill out the details');
    }

    const formData = new FormData();
    for (let i = 0; i < files.length; i += 1) {
      if ((files[i].type.includes('image') && files[i].size > 50000000) || (files[i].type.includes('video') && files[i].size > 209000000)) {
        return notifyErr('File is too large ! please upload a smaller file.');
      }
      formData.append(`File_${i}`, files[i]);
    }

    // console.log(formData);
    // upload the file
    try {
      await uploadFile(formData);
      const data = {};
      data.user_id = userData.username;
      data.fileType = fileType;
      data.description = postData.body;
      // eslint-disable-next-line no-undef
      data.token = localStorage.getItem('token');
      createPost(data)
        .then((response) => {
          // console.log(response);
          if (response.status === 201) {
            // console.log(response.data.data);
            notifySucc('Successfully Posted !');
            navigate('/');
          } else {
            // console.log(response);
            notifyErr(response.response.data.message);
          }
        })
        .catch((err) => {
          // eslint-disable-next-line no-console
          console.log(err);
          notifyErr(err);
        });
    } catch (err) {
      // eslint-disable-next-line no-console
      console.log(err);
      notifyErr(err);
    }
    return null;
  };

  return (
    <form className="createPost">
      <div className="post-header">
        <span>
          Create Post
        </span>
      </div>

      <div>

        <input
          type="file"
          accept="image/*, video/*"
          onChange={(event) => {
            loadImage(event);
            updateFile(event);
          }}
          className="fileButton"
          ref={inputFile}
          data-testid="file-input"
        />
        <button type="button" className="clearButton" onClick={() => { clearInput(); }} data-testid="clear-button">clear selected file</button>

        {imgPreview
          ? (
            <p className="img-preview-wrapper">
              <img src={imgPreview} alt="preview" className="img" />
            </p>
          ) : null}
        {videoPreview
          ? (
            <video
              className="vid"
              controls
              src={videoPreview}
            >
              <track kind="captions" />
            </video>
          ) : null}

        <textarea
          type="text"
          placeholder="Write a caption..."
          value={postData.body}
          onChange={(event) => {
            setPostData({
              ...postData,
              body: event.target.value,
            });
          }}
          className="textarea"
        />

      </div>
      <button
        type="button"
        className="closeButton"
        onClick={() => {
          postDetails();
        }}
      >
        Post
      </button>
      {/* <input type="submit" value="Post" /> */}
    </form>
  );
}

export default CreatePost;
