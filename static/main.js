class Message {
  constructor(usrObject, message, timeStamp, channel) {
    // Directly tying usrObject with message to extract more info
    this.author = usrObject;
    this.message = message;
    this.timeStamp = timeStamp;
    this.channel = channel.name;
  }
}

class User {
  constructor(username, dateCreated) {
    this.username = username;
    this.dateCreated = dateCreated;
  }

  changeUsername(newUsername) {
    this.username = newUsername;
  }
}

class Channel {
  constructor(name, owner) {
    this.history = []; // up to 100 messages
    this.participants = []; // open for anyone, handled by participantAdd
    this.name = name; // Name of channel
    this.owner = owner; // Creator
  }

  // Convo Manager
  messageHandler(msgObj) {

  }
 
  // upon firing a message into the channel, add user into list TODO
  participantAdd(userObj) {
    this.participants.push(userObj);
  }

  // Handle the viewing of chat details
  showChat(channelHead, channelConvo) {
    channelHead.textContent = this.name;
    channelConvo.innerHTML = this.history
      .map(msg => 
        `<div>
          <p>${msg.author} at ${msg.timeStamp}</p>
          <div>${msg.message}</div>
        </div>`).join("") || "There is no message to be displayed. Start chatting!";
  }

  showChatList(channel) {
    let li = document.createElement("li");
    let button = document.createElement("button");
    li.append(button);
    button.append(this.name);

    button.addEventListener("click", function(event) {
      event.preventDefault();

      // upon click, the window will switch to this channel
      channel.showChat(channelHead, channelConvo);

    });

    return li;
  }
}

// JSON convertor to Channel Objects
function channelJSONConvert(objParcel) {
  objParcel = JSON.parse(objParcel);
  let returnedChannel = new Channel(objParcel.name, objParcel.owner);
  returnedChannel.history = objParcel.history;
  returnedChannel.participants = objParcel.history;

  return returnedChannel;
}

  // Private channels get to limit their participants
  // Entrance only by invitation
  // Participants is predefined
class PrivateChannel extends Channel {
  constructor(name, owner, participants) {
    super(name, owner);
    this.participants = participants;
  }

  invite(usrObj) {
    this.participants.push(usrObj);
  }
}