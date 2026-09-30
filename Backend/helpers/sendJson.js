// helpers/sendJson.js

function sendJson(res, statusCode, body, headers = {}) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  });

  res.end(JSON.stringify(body));
}

export { sendJson };