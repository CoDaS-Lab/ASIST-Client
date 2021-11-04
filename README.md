# CODAS LAB EXPERIMENT

This client is in beta version and part of a game built for ASIST project using Phaser.js. The client works with the API available at [ASIST-API](https://github.com/CoDaS-Lab/ASIST-API)

## Requirements

- Node 16.9.1+

## Running on localhost

1. Install node modules from the current directory of the project
     - `npm install`
2. Set up environment variables
   - `LOCAL_SOCKET_URL`: API server URL. for example: `https://api-asist.herokuapp.com/` or `http://127.0.0.1:5000/`
   - `PORT="880"`
   - `IP="0.0.0.0"`
3. Start the node server and it should be should be available at `http://localhost:880`
     - `node server.js`
