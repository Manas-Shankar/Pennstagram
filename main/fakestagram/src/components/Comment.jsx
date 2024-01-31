import { React, useState } from 'react';
import '../css/Comment.css';

function Comment(props) {
  const [username, setUsername] = useState('');
  const [text, setText] = useState('');
  const [init, setInit] = useState(false);
  // eslint-disable-next-line react/prop-types
  const { data } = props;
  useState(() => {
    // eslint-disable-next-line react/prop-types
    setUsername(data.user_id);
    // eslint-disable-next-line react/prop-types
    setText(data.content);
    if (data) { setInit(true); }
  }, [props]);

  return (
    init
    && (
    <div className="Comment">
      <div className="Comment-Header">
        <p>{username}</p>
      </div>
      <div className="Comment-Body">
        <div className="Comment-Text">
          <p>{text}</p>
        </div>
      </div>
    </div>
    ));
}

export default Comment;
