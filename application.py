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

users = []

# Check whether username used
@socketio.on("new username")
def username_validate(username):
  if username in users:
    emit("username result", "not allowed")
  else: 
    emit("username result", "allowed")
  
# New user to add in memory
@socketio.on("new user")
def user_handler(user_object):
  users.append(user_object)
  print(users) # Test


"""Message management"""
@socketio.on("message out")
def message_handler(messageParcel, channel_name):
  emit("message in", messageParcel)

"""Channel management"""
public_channels_names = []
public_channels = []

@socketio.on("get channels")
def channel_display():
  print(public_channels)
  emit("give channels", list(json.dumps(public_channel) for public_channel in public_channels))

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
    public_channels.append(channel)
    room = channel_name
    join_room(room)


# Run python3 application.py for development server
if __name__ == '__main__':
    socketio.run(app)