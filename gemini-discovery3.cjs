const fs = require('fs');
const obj = JSON.parse(fs.readFileSync('discovery-v1beta.json', 'utf8'));
const inspect = (name) => {
  const schema = obj.schemas && obj.schemas[name];
  if (!schema) {
    console.log('MISSING', name);
    return;
  }
  console.log('SCHEMA', name);
  console.log(JSON.stringify(schema, null, 2));
  console.log('---');
};
['Content', 'Part', 'EmbedTextResponse', 'EmbedContentResponse', 'GenerateContentResponse', 'Candidate'].forEach(inspect);
