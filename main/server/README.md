# Starting the server
- Run `node server.js` or `npm run start`

# Testing
To run the tests, do the following:
- In `server.js`, comment out lines 31-36 (port and the call to `app.listen()`)
- In `db/conn.js`, set `dbURL` to the value of `ATLAS_URI` from the file `config.env`
- In one terminal, run `node index.js`
- In a second terminal, run `npm test`
- Rejoice in successful tests!