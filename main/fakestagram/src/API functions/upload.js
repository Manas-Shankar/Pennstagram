import axios from 'axios';

const uploadFile = async (files) => {
  // console.log(files);
  try {
    // const res =
    await axios.post('http://localhost:8080/upload', files, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    // console.log(res);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.log(err);
    throw err;
  }
};

export default uploadFile;
