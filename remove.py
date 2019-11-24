#!/usr/bin/python                                                               

# Load the JSON module and use it to load your JSON file.                       
# I'm assuming that the JSON file contains a list of objects.                   
import json
from past.builtins import xrange
obj  = json.load(open("nyc.json"))

# Iterate through the objects in the JSON and pop (remove)                      
# the obj once we find it. 
length = len(obj["features"])
print(length)
i = 1
while i < len(obj["features"]):
	print(i)
	print(obj["features"][i]['properties']["borough"])
	if obj["features"][i]['properties']["borough"] == "Staten Island":
		# print(obj["features"][i])
		del obj["features"][i]
		i -= 1
	i += 1

# Output the updated file with pretty JSON                                      
open("updated-nyc.json", "w").write(
    json.dumps(obj)
)