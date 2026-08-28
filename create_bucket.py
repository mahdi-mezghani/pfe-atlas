import json, sys, urllib.request
url = 'https://opweromunjvxzomvzhlf.supabase.co/storage/v1/admin/buckets'
headers = {
    'Authorization': 'Bearer sbp_1c29814707d079eaf92d5aa63b58c8657a97d147',
    'Content-Type': 'application/json'
}
data = json.dumps({"name":"pfe-reports","public":False}).encode('utf-8')
req = urllib.request.Request(url, data=data, headers=headers, method='POST')
try:
    with urllib.request.urlopen(req) as res:
        print(res.status)
        print(res.read().decode())
except urllib.error.HTTPError as e:
    print('ERROR', e.code)
    print(e.read().decode())
    sys.exit(1)
