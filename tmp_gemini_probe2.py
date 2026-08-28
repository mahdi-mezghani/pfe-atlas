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
base = 'https://gemini.googleapis.com'
headers = {
    'Authorization': f"Bearer {env.get('AI_GEMINI_API_KEY', '')}",
    'Content-Type': 'application/json',
}

paths = [
    '/v1beta/',
    '/v1/',
    '/v1beta/models',
    '/v1/models',
    '/v1beta/models/',
    '/v1/models/',
    f'/v1beta/models/{model}',
    f'/v1/models/{model}',
    f'/v1beta/models/{model}:generateContent',
    f'/v1/models/{model}:generateContent',
    f'/v1beta/models/gemini-3.6-flash:generateContent',
    f'/v1/models/gemini-3.6-flash:generateContent',
    '/v1beta/models/gemini-embedding-2:embedContent',
    '/v1/models/gemini-embedding-2:embedContent',
]

endpoints = []
for path in paths:
    if path.startswith('/v1beta/models') and ':generateContent' in path:
        data = {'model': model, 'prompt': {'text': 'Hello, confirm if this Gemini endpoint works.'}}
    elif path.startswith('/v1') and ':generateContent' in path:
        data = {'model': model, 'prompt': {'text': 'Hello, confirm if this Gemini endpoint works.'}}
    elif path.endswith(':embedContent'):
        data = {'model': 'gemini-embedding-2', 'input': ['test embedding']}
    else:
        data = None
    endpoints.append((path, data))

for path, data in endpoints:
    url = base + path
    print('===', url)
    try:
        if data is None:
            req = urllib.request.Request(url, headers=headers, method='GET')
        else:
            body = json.dumps(data).encode('utf-8')
            req = urllib.request.Request(url, data=body, headers=headers, method='POST')
        with urllib.request.urlopen(req, timeout=30) as res:
            print('status', res.status)
            print(res.read().decode('utf-8'))
    except urllib.error.HTTPError as e:
        print('HTTP', e.code, e.reason)
        print(e.read().decode('utf-8', errors='replace'))
    except Exception:
        import traceback
        traceback.print_exc()
