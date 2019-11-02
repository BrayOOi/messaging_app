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
def channel_display(args):
  print(args, 60)
  results = []

  if type(args) != list:
    if args in public_channels.keys():
      print(args, "64")
      results.append(json.dumps(public_channels[args]))
  else:
    for channel in args: 
      # Channels cannot be changed names nor removed
      if public_channels[channel]:
        results.append(json.dumps(public_channels[channel]))

  if not results:
    results = 0
  emit("channel results", results)

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

  emit("channel search result", search_result)


# Check whether channel name used
@socketio.on("new channel attempt")
def channel_validate(channel_name):
  if channel_name in public_channels.keys():
    emit("channel create", 0)
  else: 
    # Placeholder
    public_channels[channel_name] = True
    emit("channel create", 1)

# New channel to add in memory
@socketio.on("new channel")
def channel_handler(channel_object):
  channel = json.loads(channel_object)
  print(channel['name'], 108)
  public_channels[channel['name']] = channel
  room = channel['name']
  join_room(room)

messages = {}

"""Message management"""
@socketio.on("get messages")
def message_history(channel_name):
  if channel_name in messages.keys():
    emit("messages return", messages[channel_name])
  else:
    emit("messages return", 0)


@socketio.on("message out")
def message_out(messageParcel, channel_name):
  room = channel_name
  join_room(room)
  emit("message in", messageParcel, room=room)


# Run python3 application.py for development server
if __name__ == '__main__':
    socketio.run(app)