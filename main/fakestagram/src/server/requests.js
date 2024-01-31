const axios = require('axios');

const username = 'user0';
const data = {};
const id = 0;

// Request to get all posts
axios.get('http://localhost:3001/posts')
  .then((response) => {
    console.log(response.data);
  })
  .catch((err) => {
    console.log(err);
  });

// Request to get posts by a specific user
axios.get(`http://localhost:3001/posts?postedBy=${username}`)
  .then((response) => {
    console.log(response.data);
  })
  .catch((err) => {
    console.log(err);
  });

// Request to create a new post for a user
// data must be the complete post object
/*
Example post object:
{
      "id": 0,
      "postedBy": "user0",
      "media": "https://loremflickr.com/640/480?lock=7548492603981824",
      "description": "Aurum confugo vulticulus aufero paulatim thermae volubilis tepidus delibero.",
      "likedBy": [
        "user0",
        "user1"
      ],
      "comments": [
        [
          {
            "username": "user1",
            "text": "Templum thalassinus carcer cuius."
          },
          {
            "username": "user3",
            "text": "Absum voluntarius colo et voro."
          }
        ]
      ]
    }
*/
axios.post('http://localhost:3001/posts', data)
  .then((response) => {
    console.log(response.data);
  })
  .catch((err) => {
    console.log(err);
  });

// Request to update a post
// You can get the id from the post object
// Updates to posts include: liking a post, unliking a post, commenting on a post
// data must be the entire post object plus the modification to the post object
// you require. Below is a change of user1 unliking a post
/*
Example post object before:
{
    "id": 0,
    "postedBy": "user0",
    "media": "https://loremflickr.com/640/480?lock=7548492603981824",
    "description": "Aurum confugo vulticulus aufero paulatim thermae volubilis tepidus delibero.",
    "likedBy": [
    "user0",
    "user1"
    ],
    "comments": [
    [
        {
        "username": "user1",
        "text": "Templum thalassinus carcer cuius."
        },
        {
        "username": "user3",
        "text": "Absum voluntarius colo et voro."
        }
    ]
    ]
}
Example post object after:
{
    "id": 0,
    "postedBy": "user0",
    "media": "https://loremflickr.com/640/480?lock=7548492603981824",
    "description": "Aurum confugo vulticulus aufero paulatim thermae volubilis tepidus delibero.",
    "likedBy": [
    "user0"
    ],
    "comments": [
    [
        {
        "username": "user1",
        "text": "Templum thalassinus carcer cuius."
        },
        {
        "username": "user3",
        "text": "Absum voluntarius colo et voro."
        }
    ]
    ]
}
*/

axios.put(`http://localhost:3001/posts/${id}`, data)
  .then((response) => {
    console.log(response.data);
  })
  .catch((err) => {
    console.log(err);
  });

// Request to create a new user
// data must be the complete user object
axios.post('http://localhost:3001/users', data)
  .then((response) => {
    console.log(response.data);
  })
  .catch((err) => {
    console.log(err);
  });

// Request to get a specific user
axios.get(`http://localhost:3001/users?username=${username}`)
  .then((response) => {
    console.log(response.data);
  })
  .catch((err) => {
    console.log(err);
  });

// Request to update a specifier user
// You can get the id from the user object
// Data must be the entire user object you are trying to modify plus the
// modifications. Modifications include: following a new user, unfollowing
// a user. For example, if a user0 clicks "Follow" on user2's profile,
// the user object for user0 will change as follows:
/*
User object before:
{
    "id": 0,
    "username": "user0",
    "fullname": "Paula Thiel",
    "email": "Paula_Thiel@example.com",
    "avatar": "https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/854.jpg",
    "password": "abc",
    "followers": [
    "user2",
    "user1"
    ],
    "following": [
    "user0",
    "user1"
    ]
}
User object after:
{
    "id": 0,
    "username": "user0",
    "fullname": "Paula Thiel",
    "email": "Paula_Thiel@example.com",
    "avatar": "https://cloudflare-ipfs.com/ipfs/Qmd3W5DuhgHirLHGVixi6V76LhCkZUz6pnFt5AJBiyvHye/avatar/854.jpg",
    "password": "abc",
    "followers": [
    "user2",
    "user1"
    ],
    "following": [
    "user0",
    "user1",
    "user2"
    ]
}
*/
axios.put(`http://localhost:3001/users/${id}`, data)
  .then((response) => {
    console.log(response.data);
  })
  .catch((err) => {
    console.log(err);
  });
