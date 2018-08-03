import requests

r = requests.put("https://api.myjson.com/bins/1g3idq", json=[])
print(r.status_code)