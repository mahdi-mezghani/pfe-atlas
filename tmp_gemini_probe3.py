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
base_hosts = [
    'https://gemini.googleapis.com',
    'https://api.labs.google.com',
    'https://gemini.labs.google.com',
    'https://generativelanguage.googleapis.com',
    'https://generativelanguage.googleapis.com',
]
paths = [
    '/v1beta/models',
    '/v1beta2/models',
    '/v1beta3/models',
    '/v1beta/models/',
    '/v1beta2/models/',
    '/v1beta3/models/',
    f'/v1beta/models/{model}:generateContent',
    f'/v1beta2/models/{model}:generateContent',
    f'/v1beta3/models/{model}:generateContent',
    f'/v1beta/models/{model}:generate',
    f'/v1beta2/models/{model}:generate',
    f'/v1beta3/models/{model}:generate',
    f'/v1beta/models/{model}:embedContent',
    f'/v1beta2/models/{model}:embedContent',
    f'/v1beta3/models/{model}:embedContent',
    '/v1beta',
    '/v1beta2',
    '/v1beta3',
    '/v1',
]
headers = {
    'Authorization': f"Bearer {env.get('AI_GEMINI_API_KEY', '')}",
    'Content-Type': 'application/json',
}

for base in base_hosts:
    for path in paths:
        url = base + path
        data = None
        method = 'GET'
        if ':generate' in path or ':generateContent' in path:
            data = {'model': model, 'prompt': {'text': 'Hello, confirm if this Gemini endpoint works.'}}
            method = 'POST'
        elif ':embedContent' in path:
            data = {'model': model, 'input': ['test embedding']}
            method = 'POST'
        try:
            if data is None:
                req = urllib.request.Request(url, headers=headers, method=method)
            else:
                body = json.dumps(data).encode('utf-8')
                req = urllib.request.Request(url, data=body, headers=headers, method=method)
            with urllib.request.urlopen(req, timeout=30) as res:
                print('OK', url, res.status)
                print(res.read(500).decode('utf-8', errors='replace'))
        except urllib.error.HTTPError as e:
            print('HTTP', e.code, url)
            try:
                print(e.read(500).decode('utf-8', errors='replace'))
            except Exception:
                print('NO-BODY')
        except Exception as e:
            print('ERR', type(e).__name__, url, e)
