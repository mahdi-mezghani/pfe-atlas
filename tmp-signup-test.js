const https = require('https');
const project = 'opweromunjvxzomvzhlf';
const key = 'sb_publishable_xKUrhqWStZHNtiamqLZ09w_rkkPsrzO';
const email = `test+signup-${Date.now()}@example.com`;
const body = JSON.stringify({
  email,
  password: 'Test1234!',
  options: { emailRedirectTo: 'http://127.0.0.1:8081/auth' },
});
const opts = {
  hostname: `${project}.supabase.co`,
  path: '/auth/v1/signup',
  method: 'POST',
  headers: {
    apikey: key,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  },
};
const req = https.request(opts, (res) => {
  console.log('STATUS', res.statusCode);
  console.log('HEADERS', JSON.stringify(res.headers, null, 2));
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    console.log('BODY', data);
  });
});
req.on('error', (err) => {
  console.error('ERROR', err.message);
});
req.write(body);
req.end();
