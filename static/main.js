class Message {
  constructor(username, message, timeStamp, channel) {
    this.author = username;
    this.message = message;
    this.hours = timeStamp.getHours(); // used for rendering time in balloons
    this.timeStamp = `${this.hours == 0 ? "12" : ((this.hours % 12) < 10 ? "0" + (this.hours % 12) : (this.hours % 12))}.${timeStamp.getMinutes() < 10 ? "0" + timeStamp.getMinutes() : timeStamp.getMinutes()}${this.hours >= 12 ? 'pm' : 'am'} ${timeStamp.toDateString()}`;
    this.channel = channel.name;
  }
}


class User {
  constructor(dateCreated) {
    this.username;
    this.dateCreated = dateCreated;
    this.channels = []; // channel names
  }

  getUsername(unvalidatedUsername) {
    let userHolder = this;

    // Send to server to validate
    let usernameCheck = new Promise((resolve, reject) => {
      socket.emit("new username", unvalidatedUsername);

      // Results
      socket.on("username result", function(result) {
        if (result == "not allowed") {
          reject(new Error("Username used"));
        } else {
          userHolder.username = unvalidatedUsername;
          resolve(unvalidatedUsername);
        }
      });
    });

    return usernameCheck;
  }

  addChannel(channel) {
    if (!this.channels.includes(channel.name)) {
      this.channels.push(channel.name);

      socket.emit("update user", JSON.stringify(this));
    }
  }

  dataUpdate() {
  // Bundle the 3 together
    USER_STATE = this;

    socket.emit("new user", JSON.stringify(USER_STATE));

    // Store user object client side
    localStorage.setItem("user", USER_STATE.username);
  }
}


class Channel {
  constructor(name, owner, visibility=true) {
    this.name = name; // Name of channel
    this.owner = owner; // Creator
    this.participants = [];
    this.visibility = visibility;
  }

  addUser(username) {
    this.participants.push(username);
  }

  // Handle the viewing of chat details
  showChat(privateFriendChat = false) {
    let channelHolder = this;
    
    if (privateFriendChat) {
      // dynamic display of same channel name
      // 1st item is blank string
      document.querySelector("#Chat-Name").innerHTML = 
        this.name.split("%%").filter(name => name != USER_STATE.username)[1];
    } else {

      // 1v1 chats does not display members number
      document.querySelector("#Chat-Name").innerHTML = this.name + 
      `  <span class="is-size-7 has-text-grey-light">| Members: <button class="is-size-7 has-text-grey-light">${this.participants.length}</button></span>`;

      // show group members
      document.querySelector("#Chat-Name button").addEventListener("click", function(event) {
        let groupMembers = document.querySelector("#Chat-Members section");

        // reset content
        groupMembers.innerHTML = "";

        channelHolder.participants.forEach(function(name) {
          let contactContainer = document.createElement("div");
          let contactName = document.createElement("span");
          
          contactName.append(name);
          contactContainer.append(contactName);

          if (name != USER_STATE.username) {
            let contactButton = document.createElement("button");
            contactButton.className = "button is-info";
            contactButton.append("Contact");
            contactContainer.append(contactButton);

            contactButton.addEventListener("click", function(event) {
              event.preventDefault();

              // in 1v1 convo names are not important other than to track messages
              // names are sorted to ensure that both the users will reach same channels everytime
              let namesSorted = [name, USER_STATE.username].sort();

              socket.emit("new channel attempt", "%%" + namesSorted[0] + "%%" + namesSorted[1], false);

              // after user got redirected to a private chat
              document.querySelector("#Chat-Members").classList.remove("is-active");
            });
          }
          groupMembers.append(contactContainer);
        });

        // after constructing the modal
        document.querySelector("#Chat-Members").classList.add("is-active");
      });

      document.querySelector("#Chat-Members button").addEventListener("click", function(event) {
        document.querySelector("#Chat-Members").classList.remove("is-active");
      });
    }

    // Upon showing convo history, set channel as CHANNEL_STATE
    this.dataUpdate();
   
    socket.emit('get messages', this.name);

    socket.on('messages return', messageObjectArray => {
      let today = new Date().getDate();
       
      document.querySelector("#Chat-Convo").innerHTML = "";

      if (messageObjectArray) {
        messageObjectArray.forEach(msg => {
          document.querySelector("#Chat-Convo").innerHTML += BalloonTemp({
            "classes": msg.author == USER_STATE.username ? "self-chat" : "",
            "author" : msg.author,
            "time"   : new Date(msg.timeStamp.slice(8)).getDate() == today ? msg.timeStamp.slice(0,7) : msg.timeStamp,
            "message": unescape(msg.message)
          });
        });

          // scroll to bottom
          document.querySelector("#Chat-Convo").scrollTo(0, document.querySelector("#Chat-Convo").scrollHeight);
       } else {
        document.querySelector("#Chat-Convo").innerHTML = "<div id='Chat-Welcome'>There is no message to be displayed. Start chatting!</div>";
       }
    });
  }


  showChatList(privateFriendChat = false) {
    // display channel in sidebar
    let li = document.createElement("li");
    let button = document.createElement("button");
    let feed = document.createElement("span");
    
    li.append(button, feed);
    if (privateFriendChat) {

      button.append(this.name.split("%%").filter(name => name != USER_STATE.username)[1]);
    } else {
      button.append(this.name);
    }
    let channelHolder = this;

    let counter = {};
    socket.on('message in', messageParcel => {
      if (messageParcel.channel == channelHolder.name && 
          messageParcel.channel != CHANNEL_STATE.name) {
        
        if (counter[messageParcel.channel]) {
          counter[messageParcel.channel]++;
        } else {
          counter[messageParcel.channel] = 1;
        }

        feed.className = "tag is-success";
        feed.innerHTML = counter[messageParcel.channel];

        // keep participants in sync
        if (!this.participants.includes(messageParcel.author)) {
          this.addUser(messageParcel.author);
        }
      }
    });

    button.addEventListener("click", function(event) {
      event.preventDefault();
      console.log("button click", 505);

      channelHolder.showChat(privateFriendChat);

      counter[channelHolder.name] = 0;
      feed.className = "";
      feed.innerHTML = "";
    });

    return li;
  }

  messageHandler(msgObj) {
    // everytime a message is sent out, the user will be checked whether he is a member
    msgObj["message"] = escape(msgObj["message"]);
    socket.emit("message out", msgObj);

    if (!CHANNEL_STATE.participants.includes(USER_STATE.username)) {
      let memberCount = document.querySelector("#Chat-Name button.has-text-grey-light");

      if (memberCount) {
        memberCount.textContent = parseInt(memberCount.textContent) + 1;
      }

      CHANNEL_STATE.addUser(USER_STATE.username);
      socket.emit("update channel", JSON.stringify(CHANNEL_STATE));
    }
  }

  dataUpdate() {
  // Bundle the 3 together
    if (CHANNEL_STATE != this) {
      CHANNEL_STATE = this;

      // Store user object client side
      localStorage.setItem("channel", CHANNEL_STATE.name);
      console.log(localStorage.getItem("channel"), 527);
    }
  }
}

// JSON convertor to User Objects
function userJSONConvert(userParcel) {
  if (userParcel) {
    if (typeof userParcel == "string") {
      userParcel = JSON.parse(userParcel);
    }
    let returnedUser = new User(userParcel.dateCreated);
    returnedUser.username = userParcel.username;
    returnedUser.channels = userParcel.channels || {}; // blank object will be converted to undefined
    return returnedUser;
  } else {
    return userParcel;
  }
}

// JSON convertor to Channel Objects
function channelJSONConvert(objParcel) {
  if (typeof objParcel == "string") {
    objParcel = JSON.parse(objParcel);
  }
  let returnedChannel = new Channel(objParcel.name, objParcel.owner, objParcel.visibility);
  returnedChannel.participants = objParcel.participants;

  return returnedChannel;
}