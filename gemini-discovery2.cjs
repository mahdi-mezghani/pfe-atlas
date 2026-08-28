const fs = require('fs');
const obj = JSON.parse(fs.readFileSync('discovery-v1beta.json', 'utf8'));
const inspect = (name) => {
  const schema = obj.schemas && obj.schemas[name];
  if (!schema) {
    console.log('MISSING', name);
    return;
  }
  console.log('SCHEMA', name, 'type=' + schema.type);
  if (schema.properties) {
    for (const [k, v] of Object.entries(schema.properties)) {
      const type = v.type || (v.items && v.items.type) || undefined;
      const ref = v.$ref || (v.items && v.items.$ref) || undefined;
      console.log('  prop', k, 'type=' + type, 'ref=' + ref);
    }
  }
  if (schema.oneOf) {
    console.log('  oneOf count', schema.oneOf.length);
  }
  console.log('---');
};
['Content', 'GenerateContentRequest', 'GenerateContentResponse', 'EmbedContentRequest', 'EmbedContentResponse', 'EmbedTextRequest', 'BatchEmbedTextRequest', 'BatchEmbedTextResponse', 'GenerateTextRequest', 'GenerateMessageRequest', 'TextPrompt', 'MessagePrompt'].forEach(inspect);
