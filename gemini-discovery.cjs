const fs = require('fs');
const path = require('path');
const file = path.resolve(__dirname, 'discovery-v1beta.json');
const raw = fs.readFileSync(file, 'utf8');
const obj = JSON.parse(raw);
const types = ['GenerateContentRequest', 'EmbedContentRequest', 'GenerateTextRequest', 'GenerateMessageRequest', 'EmbedTextRequest'];
for (const t of types) {
  const schema = obj.schemas && obj.schemas[t];
  if (!schema) {
    console.log('MISSING', t);
    continue;
  }
  console.log('TYPE', t, schema.type);
  if (schema.properties) {
    for (const [k, v] of Object.entries(schema.properties)) {
      const ref = v.$ref || (v.items && v.items.$ref) || undefined;
      const type = v.type || (v.items && v.items.type) || undefined;
      console.log('  prop', k, JSON.stringify({ type, ref }));
    }
  }
  console.log('---');
}
