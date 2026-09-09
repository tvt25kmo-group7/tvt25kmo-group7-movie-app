export function handleHealthRoute(req, res) {
  if (req.url !== '/health') {
    return false;
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'ok' }));

  return true;
}
