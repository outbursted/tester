// This is the front end js file 

Notification.requestPermission()

const chatForm=document.getElementById('chat-form');
const chatMessages=document.querySelector('.chat-messages');
const roomName=document.getElementById('room-name');
const userList=document.getElementById('users');

const {username, room}=Qs.parse(location.search,{
    ignoreQueryPrefix:true
});

//We now have access to the front end socket here 
const socket=io();

//send the room name and user name to the server 
if (username.includes("Server")) {
    alert("You cannot put this as your username!");
}
else {
    socket.emit('joinRoom',{username,room});
}


//Get room and users
socket.on('roomUsers',({room,users})=>{
    outputRoomName(room);
    outputUsers(users);
});

// Catch the message here
socket.on('message', message=>{
    var hidden = document.hidden;
    if (hidden) {
        // Send a notification to the user
        var notification = new Notification(`Chat: ${message.username}`, {
            body: message.textMessage.toString()
        });
    }

    console.log(message);
    outputMessage(message);

    chatMessages.scrollTop=chatMessages.scrollHeight;
});

const slowModeDelay = 1000; // 1 seconds
let lastMessageTime = 0;

//Submit the form
chatForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    const currentTime = new Date().getTime();
    if (currentTime - lastMessageTime < slowModeDelay) {
        alert("You are sending messages too fast, please wait before sending another message.");
        return;
    }
    lastMessageTime = currentTime;
    //gettting the message
    const msg = e.target.elements.msg.value;

    //Emit message to the server
    socket.emit('chatMessage', msg);

    e.target.elements.msg.value='';
    e.target.elements.msg.focus();

});

// Output message to DOM
function outputMessage(message){
    const div = document.createElement('div');

    div.classList.add('message');
    div.innerHTML=` <p class="meta">${message.username}<span> ${message.time}</span></p>
    <p class="text">
        ${message.textMessage}
    </p>`;

    document.querySelector('.chat-messages').appendChild(div);
}


//Output room name to DOM
function outputRoomName(room){
    roomName.innerText=room;
}

function outputUsers(users){
    userList.innerHTML=`
    ${users.map(user=>`<li>${user.username}</li>`).join('')}
    `;
}
