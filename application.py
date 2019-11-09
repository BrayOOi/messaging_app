# -*- coding: utf-8 -*-
import os
import json

from flask import Flask, render_template, redirect, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/")
def index():
  return render_template("index.html")


"""User management"""

users = {} # User JSON

# Return user objects upon request
@socketio.on("get user")
def return_userObj(username):
  if username in users.keys():
    emit("return user", json.dumps(users[username]))

    # Automatically join rooms
    print(28)
    print(users[username]["channels"])
    for channel in users[username]["channels"]:
      join_room(channel)
  else:
    emit("return user", "error")

# Check whether username used
@socketio.on("new username")
def username_validate(username):
  if username in users.keys():
    emit("username result", "not allowed")
  else: 
    # Serve as placeholder
    users[username] = True
    emit("username result", "allowed")
  
# New user to add in memory
@socketio.on("new user")
def user_handler(user_object):
  print(user_object)
  user_object = json.loads(user_object)
  users[user_object["username"]] = user_object

# Update user information such as new channels
@socketio.on("update user")
def user_update(user_object):
  user_object = json.loads(user_object)
  if user_object["username"] in users.keys():
    users[user_object["username"]] = user_object


"""Channel management"""
public_channels = {}

# get public channels
# return a list of JSONs
@socketio.on("get channels")
def channel_display(args): # array
  results = []
  print(args, 61)

  for channel in args: 
    # Channels cannot be changed names nor removed
    if channel in public_channels.keys():
      results.append(json.dumps(public_channels[channel]))

  if not results:
    results = 0
  emit("channel results", results)

@socketio.on("get last channel")
def return_last_channel(channel): #string
  # The 2 routes are separated as the parcel will be used
  # for different actions
  if channel in public_channels.keys():
    emit("last channel", json.dumps(public_channels[channel]))
  else: 
    emit("last channel", 0)

# search channels
@socketio.on("search channels")
def search_channels(search_term):
  search_result = []
  if search_term:
    for channel_name in public_channels.keys():
      if search_term in channel_name:
        search_result.append(json.dumps(public_channels[channel_name]))
    print(search_result)
  else:
    # If no arguments passed in, return all public channels
    for channels in public_channels.values():
      search_result.append(json.dumps(channels))

  if not search_result:
    search_result = 0

  emit("channel search result", search_result)


# Check whether channel name used
@socketio.on("new channel attempt")
def channel_validate(channel_name, visibility=True):
  if channel_name in public_channels.keys():
    emit("channel create", [0, visibility])
  else: 
    # Placeholder
    public_channels[channel_name] = True
    emit("channel create", [channel_name, visibility])

# New channel to add in memory
@socketio.on("new channel")
def channel_handler(channel_object):
  channel = json.loads(channel_object)
  public_channels[channel['name']] = channel
  room = channel['name']
  join_room(room)

@socketio.on("update channel")
def channel_update(channel_object):
  print(public_channels)
  channel = json.loads(channel_object)
  public_channels[channel['name']] = channel

messages = {}

"""Message management"""
@socketio.on("get messages")
def message_history(channel_name):
  if channel_name in messages.keys():
    emit("messages return", messages[channel_name])
  else:
    emit("messages return", 0)


@socketio.on("message out")
def message_out(messageParcel):
  room = messageParcel["channel"]
  if room not in messages.keys():
    messages[room] = []
  messages[room].append(messageParcel)
  print(messages, 132)
  join_room(room)
  emit("message in", messageParcel, room=room)


# Run python3 application.py for development server
if __name__ == '__main__':
    socketio.run(app)