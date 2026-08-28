import fs from 'fs';
const url = 'https://generativelanguage.googleapis.com/$discovery/rest?version=v1beta';
const res = await fetch(url);
console.log('status', res.status);
const body = await res.text();
fs.writeFileSync('discovery-v1beta.json', body, 'utf8');
try {
  const obj = JSON.parse(body);
  console.log('name', obj.name);
  console.log('version', obj.version);
  console.log('resources', Object.keys(obj.resources || {}).join(', '));
  if (obj.resources && obj.resources.models) {
    const methods = obj.resources.models.methods;
    for (const [name, method] of Object.entries(methods)) {
      console.log('method', name, method.path, JSON.stringify({ httpMethod: method.httpMethod, request: method.request?.$ref, response: method.response?.$ref, parameters: Object.keys(method.parameters || {}).join(', ') }));
    }
  }
} catch (err) {
  console.error('parse error', err.message);
}
