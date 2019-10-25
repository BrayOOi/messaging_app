class Message {
  constructor(usrObject, message, timeStamp) {
    // Directly tying usrObject with message to extract more info
    this.author = usrObject;
    this.message = message;
    this.timeStamp = timeStamp;
  }
}

class User {
  constructor(username, dateCreated) {
    this.username = username;
    this.dateCreated = dateCreated;
  }
}

class Channel {
  constructor(name, owner) {
    this.history = []; // up to 100 messages
    this.participants = []; // open for anyone, handled by participantAdd
    this.name = name; // Name of channel
    this.owner = owner; // Creator
  }

  // History Manager
  convoHistory(msgObj) {
    // Only storing 100 messages per channel
    if (this.history.length >= 100) {
      this.history.shift();
    } 

    this.history.push(msgObj);
  }

  // upon firing a message into the channel, add user into list TODO
  participantAdd(userObj) {
    this.participants.push(userObj);
  }
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

/*EVENTS HANDLERS*/
// const menu = document.querySecletor("#navbarBasicExample");
// const menuToggle = document.querySecletor("#Nav a.burger");


// menuToggle.addEventListener("click", function() {
//   if (menu.classList.contains("is-active")) {
//     menu.classList.remove("is-active");
//   } else {
//     menu.classList.add("is-active");
//   }
// });