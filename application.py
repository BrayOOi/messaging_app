import os
import json

from flask import Flask, render_template, redirect, jsonify
from flask_socketio import SocketIO, emit, join_room, leave_room

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)


@app.route("/")
def index():
  return render_template("index.html", public_channels=public_channels)


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

# Check whether channel name used
@socketio.on("new channel name")
def channel_validate(channelParcel):
  if channelParcel in public_channels_names:
    emit("Channel attempt", "false")
  else: 
    emit("Channel attempt", "true")

# New channel to add in memory
@socketio.on("new channel")
def channel_handler(channel_object, channel_name):
  room = channel_name
  join_room(room)
  emit("channel update", channel_object)


# Run python3 application.py for development server
if __name__ == '__main__':
    socketio.run(app)