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

usernames_used = [] # Raw usernames strings
users = {} # User JSON

# Return user objects upon request
@socketio.on("get user")
def return_userObj(username):
  if username in users.keys():
    emit("return user", json.dumps(users[username]))
  else:
    emit("return user", "error")

# Check whether username used
@socketio.on("new username")
def username_validate(username):
  if username in usernames_used:
    emit("username result", "not allowed")
  else: 
    usernames_used.append(username)
    emit("username result", "allowed")
  
# New user to add in memory
@socketio.on("new user")
def user_handler(user_object):
  user_object = json.loads(user_object)
  print(user_object)
  users[user_object["username"]] = user_object
  print(users)


"""Channel management"""
public_channels_names = []
public_channels = {}

# Search public channels
@socketio.on("search channels")
def channel_display(searchBarValue = ""):
  search_results = list(filter(lambda channel_name: searchBarValue in channel_name["name"], public_channels))
  emit("search channels results", list(json.dumps(search_result) for search_result in search_results))

# Check whether channel name used
@socketio.on("new channel name")
def channel_validate(channelParcel):
  if channelParcel in public_channels_names:
    emit("Channel attempt", 0)
  else: 
    public_channels_names.append(channelParcel)
    emit("Channel attempt", 1)

# New channel to add in memory
@socketio.on("new channel")
def channel_handler(channel_object, channel_name):
  channel = json.loads(channel_object)
  if channel["name"] in list(public_channel["name"] for public_channel in public_channels):
    return
  else:
    public_channels[channel_name] = channel
    room = channel_name
    join_room(room)

"""Message management"""
@socketio.on("get messages")
def message_history(channel_name):
  if channel_name:
    return


@socketio.on("message out")
def message_out(messageParcel, channel_name):
  room = channel_name
  join_room(room)
  emit("message in", messageParcel, room=room)


# Run python3 application.py for development server
if __name__ == '__main__':
    socketio.run(app)