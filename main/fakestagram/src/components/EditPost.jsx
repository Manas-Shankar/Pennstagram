import React, {
  useEffect, useContext, useRef, useState,
} from 'react';
import { toast } from 'react-toastify';
import { useNavigate, useLocation } from 'react-router-dom';
// import axios from 'axios';
import LoginContext from '../context/LoginContext';
import '../css/CreatePost.css';
import { editPost } from '../API functions/post_apis';
import uploadFile from '../API functions/upload';

function EditPost() {
  const location = useLocation();
  const [body, setBody] = useState('');
  const [files, setFiles] = useState([]);
  const [fileType, setFileType] = useState('');
  const [imgPreview, setImgPreview] = useState('');
  const [videoPreview, setVideoPreview] = useState('');
  const [details, setDetails] = useState({});
  const { userLogin } = useContext(LoginContext);

  const notifyErr = (msg) => toast.error(msg);
  const notifySucc = (msg) => toast.success(msg);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userLogin) {
      navigate('/signin');
    } else {
      setDetails(location.state.details);
      setBody(location.state.details.description);
      if (location.state.details.mediaURL?.includes('https') && location.state.details.fileType?.includes('image')) {
        setImgPreview(location.state.details.mediaURL);
      } else if (location.state.details.fileType?.includes('video')) {
        setVideoPreview(location.state.details.mediaURL);
      }
    }
  }, [location?.state]);

  const inputFile = useRef(null);

  const updateFile = (e) => {
    setFiles([...e.target.files]);
  };

  const loadImage = (e) => {
    // console.log(e.target.files[0]);
    if (e.target.files[0].type === 'video/mp4') {
      setVideoPreview(URL.createObjectURL(e.target.files[0]));
      setFileType(e.target.files[0].type);
    } else {
      setImgPreview(URL.createObjectURL(e.target.files[0]));
      setFileType(e.target.files[0].type);
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
  };

  const postDetails = async () => {
    // console.log(details);
    if (!body || (details.description === body && files.length === 0)) {
      return notifyErr('Please modify the details');
    }
    if (files.length > 0) {
      const formData = new FormData();
      for (let i = 0; i < files.length; i += 1) {
        if ((files[i].type.includes('image') && files[i].size > 50000000) || (files[i].type.includes('video') && files[i].size > 209000000)) {
          return notifyErr('File is too large ! please upload a smaller file.');
        }
        formData.append(`File_${i}`, files[i]);
      }
      await uploadFile(formData);
    }
    const post = {};
    post.description = body;
    // eslint-disable-next-line no-undef
    post.token = localStorage.getItem('token');
    if (files.length > 0) {
      post.mediaURL = '';
      post.fileType = fileType;
    } else {
      post.mediaURL = details.mediaURL;
      post.fileType = details.fileType;
    }

    editPost(details._id, post)
      .then((response) => {
        // console.log(response);
        if (response.status === 200) {
          notifySucc('Successfully Updated Post !');
          navigate('/');
        } else {
          // console.log(response);
          notifyErr(response.response.data.message);
        }
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.log(err);
      });
    return null;
  };

  return (
    <div className="createPost">
      <div className="post-header">
        <span>
          Edit Post
        </span>
      </div>

      <div className="details">

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
        <button type="button" className="clearButton" onClick={() => { clearInput(); }} data-testid="clear-button">clear file</button>

        {imgPreview.length > 0
          && (
            <p className="img-preview-wrapper">
              <img src={imgPreview} alt="preview" className="img" />
            </p>
          ) }
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
          value={body}
          onChange={(event) => {
            setBody(event.target.value);
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
        Update
      </button>
    </div>
  );
}

export default EditPost;
