import requests

r = requests.put("", json=[]) # type your myjson api url
print(r.status_code)