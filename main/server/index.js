/* eslint-disable no-console */
const app = require('./server');

const port = 8081;

app.listen(port, async () => {
  console.log(`Server running on port: ${port}`);
});
