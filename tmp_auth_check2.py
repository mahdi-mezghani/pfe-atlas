import json
import pathlib
import urllib.parse
from urllib.request import Request, urlopen
from urllib.error import HTTPError

p = pathlib.Path('.env')
env = {}
for line in p.read_text().splitlines():
    if not line.strip() or line.strip().startswith('#'):
        continue
    key, sep, value = line.split('=', 1)
    env[key.strip()] = value.strip().strip('"')

url = env.get('VITE_SUPABASE_URL') or env.get('SUPABASE_URL')
key = env.get('VITE_SUPABASE_PUBLISHABLE_KEY') or env.get('SUPABASE_ANON_KEY')
if not url or not key:
    raise SystemExit('Missing Supabase URL or key')

email = 'signup.test.user.1234@gmail.com'
password = 'Testpass1'
redirect_to = 'http://localhost:8081/auth'

calls = [
    ('signup', f"{url}/auth/v1/signup?redirect_to={urllib.parse.quote(redirect_to, safe='')}", {'email': email, 'password': password, 'data': {}, 'gotrue_meta_security': {}}),
    ('signin', f"{url}/auth/v1/token?grant_type=password", {'email': email, 'password': password, 'gotrue_meta_security': {}}),
]
for name, endpoint, payload in calls:
    req = Request(endpoint, data=json.dumps(payload).encode('utf-8'), headers={'Content-Type': 'application/json', 'apikey': key})
    try:
        with urlopen(req) as res:
            print(name, res.status, res.read().decode('utf-8'))
    except HTTPError as e:
        print(name, e.code, e.read().decode('utf-8'))
