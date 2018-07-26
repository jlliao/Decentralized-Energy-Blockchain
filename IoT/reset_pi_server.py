import requests

myjson_id = "" # edit with your myjson id

r = requests.put("https://api.myjson.com/bins/" + myjson_id, json=[])
print(r.status_code)