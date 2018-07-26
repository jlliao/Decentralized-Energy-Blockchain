import RPi.GPIO as GPIO # for raspberry pi
import time
import json
from datetime import datetime
import requests


# set up script to use the right pin configuration
GPIO.setmode(GPIO.BCM)
GPIO.setup (23,GPIO.IN) # set up your pin for prosumer
GPIO.setup (18,GPIO.IN) # set up your pin for consumer

# define some variables, C - Consumer, P - Prosumer, new - latest state
# initial state
TokenC = 0
TokenP = 100
CoinC = 100
CoinP = 0

# updated value
TokenC_new = 0
TokenP_new = 0
CoinC_new = 0
CoinP_new = 0

myjson_url = "https://api.myjson.com/bins/"
myjson_id = "" # edit with your myjson id

# define function to put data into Myjson
def putmyjson(consumerID, producerID):
	myList = []
	payload = {'timestamp':int(round(time.time() * 1000)), 'consumer':consumerID, 'producer':producerID, 'transaction':TransVolume}
	myList.append(payload)
	r = requests.put(myjson_url, json = myList)
	print(r.status_code)

print("Running...")
  
while True:	
	# generate electricity - Prosumer
	InputValue1 = GPIO.input(23)
	if InputValue1 == 1 and TokenP<200:
		print ("Generating electricity...")
		print("Consumer Token = ", TokenC , "     Prosumer Token = ", TokenP)
		print("Consumer Coin = ", CoinC , "       Prosumer Coin = ", CoinP)
		print("-----------------------------------------------------------")
		time.sleep(1)
		TokenP_new=TokenP
		while InputValue1 == 1 and TokenP_new <200:
			InputValue1 = GPIO.input(23)
			TokenP_new = TokenP_new + 1
			print("Consumer Token = ", TokenC , "     Prosumer Token = ", TokenP_new)
			print("Consumer Coin = ", CoinC , "       Prosumer Coin = ", CoinP)
			print("-----------------------------------------------------------")
			time.sleep(1)
		print("Stop generating")
		print("====================================================================================")
		time.sleep(1)
		TransVolume=TokenP_new -TokenP
		putmyjson('ID100', 'ID000')


	# charge electricity - Consumer
	InputValue2 = GPIO.input(18)
	if InputValue2 == 1 and CoinC>0 and TokenP>0:
		print ("Charging electricity...")
		print("Consumer Token = ", TokenC , "     Prosumer Token = ", TokenP)
		print("Consumer Coin = ", CoinC , "       Prosumer Coin = ", CoinP)
		print("-----------------------------------------------------------")
		time.sleep(1)
		TokenC_new=TokenC
		while InputValue2 == 1 and CoinC>0 and TokenP>0:
			InputValue2 = GPIO.input(18)
			TokenC_new = TokenC_new + 1
			CoinC = CoinC - 1
			TokenP = TokenP - 1
			CoinP = CoinP + 1
			print("Consumer Token = ", TokenC_new , "     Prosumer Token = ", TokenP)
			print("Consumer Coin = ", CoinC , "       Prosumer Coin = ", CoinP)
			print("-----------------------------------------------------------")
			time.sleep(1)
		print("Stop charging") 
		print("====================================================================================") 
		time.sleep(1)
		TransVolume=TokenC_new - TokenC
		putmyjson('ID101', 'ID100')





	#else: 
		#print ("******************Time to return******************")

