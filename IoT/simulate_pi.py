import requests
import random
import time

payload = []
myjson_id = "" # edit with your myjson id

# create unit tests
for i in range(10):
    random_pair = random.choice([['ID101', 'ID100'], ['ID100', 'ID000']])
    consumerID = random_pair[0]
    producerID = random_pair[1]
    transact_value = random.randint(1, 10)
    data = {'timestamp':int(round(time.time() * 1000)), 'consumer': consumerID, 'producer': producerID, 'transaction': transact_value}
    payload.append(data)
    time.sleep(0.2)

r = requests.put("https://api.myjson.com/bins/" + myjson_id, json = payload)
print(r.status_code)