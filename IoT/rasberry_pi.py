import RPi.GPIO as GPIO
import time
import json
from datetime import datetime
import requests


# Set up script to use the right pin configuration
GPIO.setmode(GPIO.BCM)
GPIO.setup(23, GPIO.IN)  # set up your pin for prosumer
GPIO.setup(18, GPIO.IN)  # set up your pin for consumer

# Define some constants
SUN_ID = "ID000"
CONSUMER_ID = "ID100"
PROSUMER_ID = "ID101"
MYJSON_URL = "" # IoT Server - type your myjson api url

transaction_list = []

# Put data into IoT server
def putmyjson(consumer_id, producer_id, trans_vol):
	global transaction_list
	global PROSUMER_ID
	global CONSUMER_ID
	payload = {'timestamp': str(int(round(time.time() * 1000))),
            'consumer': consumer_id, 'producer': producer_id, 'transaction': trans_vol}
	transaction_list.append(payload)
	r = requests.put(MYJSON_URL, json=transaction_list)
	if int(r.status_code) == 200:
		if consumer_id == PROSUMER_ID:
			print("Prosumer: {} kwh energy generated".format(trans_vol))
		else:
			print("{} kwh energy transfered from Prosumer to Consumer".format(trans_vol))

print("Running...")

while True:
	button_generate_pressed = GPIO.input(23)  # button for generating electricity
	button_transfer_pressed = GPIO.input(18)  # button for transfering electricity

	energy_generated = 0
	energy_transfered = 0

	# Generate energy
	if button_generate_pressed:
		print("-----------------------------------------------------------")
		print("Generating electricity...")
		print("-----------------------------------------------------------")
		while button_generate_pressed:
			button_generate_pressed = GPIO.input(23)
			print("Energy generated from solar panel: {} kwh ".format(energy_generated))
			print("-----------------------------------------------------------")
			time.sleep(1)
			energy_generated += 1  # add one kwh energy every second
		else:
			print("Stop generating")
			print("===========================================================")
			putmyjson(PROSUMER_ID, SUN_ID, energy_generated)

	# Transfer energy
	if button_transfer_pressed:
		print("-----------------------------------------------------------")
		print("Transfering electricity...")
		print("-----------------------------------------------------------")
		while button_transfer_pressed:
			button_transfer_pressed = GPIO.input(18)
			print("Energy transfer from Prosumer to Consumer: {} kwh ".format(energy_transfered))
			print("-----------------------------------------------------------")
			time.sleep(1)
			energy_transfered += 1  # transfer one kwh energy every second
		else:
			print("Stop transfering")
			print("====================================================================================")
			putmyjson(CONSUMER_ID, PROSUMER_ID, energy_transfered)
