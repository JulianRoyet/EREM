import tobii_research as tobii
import time

def gaze_data_callback(gaze_data):
    print("callback")
    print(gaze_data)

trackers = tobii.find_all_eyetrackers()

if len(trackers) == 0:
    print("No eye tracker found")
else:
    eyes = trackers[0]
    print("Address: " + eyes.address)
    print("Model: " + eyes.model)
    print("Name (It's OK if this is empty): " + eyes.device_name)
    print("Serial number: " + eyes.serial_number)
    eyes.subscribe_to(tobii.EYETRACKER_GAZE_DATA, gaze_data_callback, as_dictionary=True)
    time.sleep(10)