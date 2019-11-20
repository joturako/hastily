const path = require('path');
const http = require('http');
const fs = require('fs');
const express = require('express');

const hastily = require('../');

const imageDir = path.resolve(__dirname, 'images');
const files = fs.readdirSync(imageDir);

function paramsFrom(dict) {
  const params = new URLSearchParams();
  Object.entries(dict).forEach(([name, value]) => params.set(name, value));
  return params;
}

function serve(middleware) {
  return new Promise((resolve, reject) => {
    try {
      const app = express();
      app.use(middleware);
      const server = http.createServer(app);
      server.on('error', reject);
      server.listen(process.env.PORT || 0, '0.0.0.0', () => {
        const { address, port } = server.address();
        resolve(`http://${address}:${port}`);
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function main() {
  const demo = express();
  const static = express.static(imageDir);
  demo.use('/original', static);
  demo.use('/hastily', hastily.imageopto(), static);
  files.forEach(filename => {
    demo.get(`/${filename}.html`, (req, res) => {
      const original = `/original/${filename}`;
      const params = paramsFrom(req.query);
      const resized = `/hastily/${filename}?${params.toString()}`;
      res.status(200).send(
        `

<html>
  <head>
    <title>hastily demo</title>
    <style>
      body {
        font-size: 16px;
        margin: 0;
        padding: 0;
        background-color: #${req.query.bg || 'ffeebb'};
      }
      figure {
        border: 1px solid black;
        padding: 2rem;
        margin: 1rem;
      }
    </style>
  </head>
  <body>
      <figure>
        <img src="${original}">
        <figcaption>Original ${filename}</figcaption>
      </figure>
      <figure>
        <img src="${resized}">
        <figcaption>Resized: ${resized}</figcaption>
      </figure>
  </body>
</html>
 `.trim()
      );
    });
  });
  const demoURLBase = await serve(demo);
  files.forEach(filename => {
    console.log(new URL(`/${filename}.html`, demoURLBase).href);
  });
}

main();
