import json
import pathlib
import urllib.parse
from urllib.error import HTTPError
from urllib.request import Request, urlopen

env_path = pathlib.Path('.env')
if not env_path.exists():
    raise SystemExit('.env not found')

env = {}
for line in env_path.read_text().splitlines():
    if not line.strip() or line.strip().startswith('#'):
        continue
    key, sep, value = line.partition('=')
    if not sep:
        continue
    env[key.strip()] = value.strip().strip('"')

url = env.get('VITE_SUPABASE_URL') or env.get('SUPABASE_URL')
key = env.get('VITE_SUPABASE_PUBLISHABLE_KEY') or env.get('SUPABASE_ANON_KEY')
if not url or not key:
    raise SystemExit('Missing Supabase URL or key')

email = 'test.signup4@example.com'
password = 'Testpass1'
redirect_to = 'http://localhost:8081/auth'

calls = [
    ('signup', f"{url}/auth/v1/signup?redirect_to={urllib.parse.quote(redirect_to, safe='')}", {'email': email, 'password': password, 'data': {}, 'gotrue_meta_security': {}}),
    ('signin', f"{url}/auth/v1/token?grant_type=password", {'email': email, 'password': password, 'gotrue_meta_security': {}}),
]

for name, endpoint, payload in calls:
    req = Request(endpoint, data=json.dumps(payload).encode('utf-8'), headers={
        'Content-Type': 'application/json',
        'apikey': key,
    })
    try:
        with urlopen(req) as resp:
            body = resp.read().decode('utf-8')
            print(name, resp.status, body)
    except HTTPError as e:
        print(name, e.code, e.read().decode('utf-8'))
