import json
import urllib.request
from pathlib import Path

text = Path('.env').read_text(encoding='utf-8')
env = {}
for line in text.splitlines():
    line = line.strip()
    if not line or line.startswith('#'):
        continue
    k, v = line.split('=', 1)
    v = v.strip()
    if v.startswith('"') and v.endswith('"'):
        v = v[1:-1]
    env[k] = v

model = env.get('AI_GEMINI_CHAT_MODEL', 'gemini-1.5-flash')
url = f'https://gemini.googleapis.com/v1beta/models/{model}:generateContent'
body = json.dumps({'model': model, 'prompt': {'text': 'Hello, confirm if this Gemini endpoint works.'}}).encode('utf-8')
headers = {
    'Authorization': f"Bearer {env.get('AI_GEMINI_API_KEY', '')}",
    'Content-Type': 'application/json',
}
req = urllib.request.Request(url, data=body, headers=headers, method='POST')
try:
    with urllib.request.urlopen(req, timeout=30) as res:
        print('status', res.status)
        print(res.read().decode('utf-8'))
except Exception as e:
    import traceback
    traceback.print_exc()
