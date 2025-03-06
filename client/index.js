import { io } from 'https://cdn.socket.io/4.3.2/socket.io.esm.min.js'

const getUserName = async () => {
  const username = sessionStorage.getItem('username')
  //TODO -> validar con el servidor
  if (username) {
    return username
  }

  // Llamada a API para crear usuarios random ⬇
  const res = await fetch('https://random-data-api.com/api/users/random_user')
  const { username: randomUsername } = await res.json()
  sessionStorage.setItem('username', randomUsername)
  return randomUsername
}

const socket = io({
  auth: {
    username: await getUserName(),
    serverOffset: 0,
  },
})

const form = document.getElementById('form')
const input = document.getElementById('input')
const messages = document.getElementById('messages')

socket.on('chat message', (msg, serverOffset, msgUsername) => {
  const isCurrentUser = socket.auth.username === msgUsername
  const item = `
  <li class="${isCurrentUser ? 'current-user' : 'other-user'}">
    <small>${msgUsername}</small>
    <p>${msg}</p>
  </li>`
  messages.insertAdjacentHTML('beforeend', item)
  socket.auth.serverOffset = serverOffset
  messages.scrollTop = messages.scrollHeight
})

form.addEventListener('submit', (e) => {
  e.preventDefault()

  if (input.value) {
    socket.emit('chat message', input.value)
    input.value = ''
  }
})
