const chatForm = document.getElementById('chat-form');
const chatMessages = document.querySelector('.chat-messages');
const roomName = document.getElementById('room-name');
const userList = document.getElementById('users');

//
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

const socket = io();

// Join chatroom
socket.emit('joinRoom', { username, room });


socket.on('roomUsers', ({ room, users }) => {
  outputRoomName(room);
  outputUsers(users);
});

// Message van de server
socket.on('message', (message) => {
  console.log(message);
  outputMessage(message);

// Scroll down
  chatMessages.scrollTop = chatMessages.scrollHeight;
});

// Bericht versturen
chatForm.addEventListener('submit', (e) => {
  e.preventDefault();

// Haal bericht op
  let msg = e.target.elements.msg.value;

  msg = msg.trim();

  if (!msg) {
    return false;
  }

// Emit message naar de server
  socket.emit('chatMessage', msg);

// Clear input
  e.target.elements.msg.value = '';
  e.target.elements.msg.focus();
});

// Output message naar de DOM
function outputMessage(message) {
  const div = document.createElement('div');
  div.classList.add('message');
  const p = document.createElement('p');
  p.classList.add('meta');
  p.innerText = message.username;
  // p.innerHTML += `<span>${message.time}</span>`;
  div.appendChild(p);
  const para = document.createElement('p');
  para.classList.add('text');
  para.innerText = message.text;
  div.appendChild(para);
  document.querySelector('.chat-messages').appendChild(div);
}

// Voeg kamer toe aan de DOM
function outputRoomName(room) {
  roomName.innerText = room;
}

// Voeg gebruikers toe aan de DOM
function outputUsers(users) {
  userList.innerHTML = '';
  users.forEach((user) => {
    const li = document.createElement('li');
    li.innerText = user.username;
    userList.appendChild(li);
  });
}

// De pop-up als je de chat wilt verlaat
document.getElementById('leave-btn').addEventListener('click', () => {
  const leaveRoom = confirm('Weet  je zeker dat je hier weg wilt? :(');
  if (leaveRoom) {
    window.location = '../index.html';
  } else {
  }
});
