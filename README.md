# Project 2

- A simple messaging web app that utilizes Flask-SocketIO, LodashJS and BulmaCSS
- Store user's name and last channel in localStorage
- Allow every users to create both public and private channels
- Allow users to private message other users
- Implement emojis
- Click on the search icon the view full list of public channels
- Retrieve the messaging history of a particular channel once the user clicked on it, 
-- but will not retrieve further messages unless user join the channel

- User can join the channel by sending a message in
- The user's name and timeStamp are displayed together with the message resembling Whatsapp's depictions

- The personal touch of this project includes the implementation of emojis and support of private channels and private messaging

- the javascript files and mainly helpers functions that help to route responses and define behavior

Bugs: 
- The initial loading time for registration varies heavily after I installed and uninstalled eventlet
- The emoji click event listener does not work on the first load and will work on refresh (and I have absolutely no idea why)
-- (this also happened on several functions but I was able to work around them by attaching the functions to the nodes themselves) (and I have no idea as well)
-- have tried set onclick attribute, variations of functions and the initial versions that involved using querySelectorAll but all of these will only work after refresh
-- (the bug also happened after i uninstalled eventlet and works fine using a prior querySelectorAll method)
--- (due to performance reason i decided not to reattempt the querySelectorAll method)

- the contact button to established private contacts was supposed to bring user to the chat between the users (test10's convo), but it did not work after i broke everything with eventlet