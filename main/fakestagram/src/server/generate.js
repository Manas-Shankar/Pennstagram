// Requires faker and lodash
// npm install --save-dev @faker-js/faker
// npm i --save lodash

function generate() {
  const { faker } = require('@faker-js/faker');
  const _ = require('lodash');
  return {
    users: _.times(5, (n) => {
      const firstName = faker.person.firstName();
      const lastName = faker.person.lastName();
      return {
        id: n,
        username: `user${n}`,
        fullname: `${firstName} ${lastName}`,
        email: faker.internet.exampleEmail({ firstName, lastName }),
        avatar: faker.internet.avatar(),
        password: 'abc',
        followers: [
          // ID number of follower
          `user${faker.number.int({ min: 0, max: 5 })}`, `user${faker.number.int({ min: 0, max: 5 })}`,
        ],
        following: [
          // ID number of following
          `user${faker.number.int({ min: 0, max: 5 })}`, `user${faker.number.int({ min: 0, max: 5 })}`, faker.number.int({ min: 0, max: 5 }),
        ],
      };
    }),
    posts: _.times(10, (n) => ({
      id: n,
      postedBy: `user${n % 5}`,
      media: faker.image.urlLoremFlickr(),
      description: faker.lorem.paragraph({ min: 1, max: 3 }),
      likedBy: [
        `user${faker.number.int({ min: 0, max: 5 })}`, `user${faker.number.int({ min: 0, max: 5 })}`,
      ],
      comments:
                    _.times(2, (n) => ({
                      username: `user${faker.number.int({ min: 0, max: 5 })}`,
                      text: faker.lorem.sentence(),
                    })),
    })),
  };
}
// var jsonData = JSON.stringify(generate());
// const fs = require('fs');
// fs.writeFile('db.json', jsonData, (err) => {
//     if (err) throw err;
// })
module.exports = { generate };
