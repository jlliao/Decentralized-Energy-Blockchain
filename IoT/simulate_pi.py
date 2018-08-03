# simlate_pi.py - simulate action on raspberry pi

import requests
import random
import time

payload = []

SUN_ID = "ID000"
CONSUMER_ID = "ID100"
PROSUMER_ID = "ID101"
MYJSON_URL = "" # type your myjson api url

# create unit tests
for i in range(10):
    random_pair = random.choice([[CONSUMER_ID, PROSUMER_ID], [PROSUMER_ID, SUN_ID]])
    consumerID = random_pair[0]
    producerID = random_pair[1]
    transact_value = random.randint(1, 10)
    data = {'timestamp':str(int(round(time.time() * 1000))), 'consumer': consumerID, 'producer': producerID, 'transaction': transact_value}
    payload.append(data)
    time.sleep(0.2)

r = requests.put(MYJSON_URL, json = payload)
if int(r.status_code) == 200:
    print('Unit test created in IoT server')