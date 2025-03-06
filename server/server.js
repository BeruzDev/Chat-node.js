import express from 'express'
import logger from 'morgan'
import dotenv from 'dotenv'
import cron from 'node-cron'
import { Server } from 'socket.io'
import { createServer } from 'node:http'
import { createClient } from '@libsql/client'

dotenv.config()

const port = process.env.PORT ?? 3000

const app = express()
const server = createServer(app)
const io = new Server(server, {
  connectionStateRecovery: {},
})

const db_connection = createClient({
  url: process.env.TURSO_DATABASE_URL,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

//const db_structure = await db_connection.execute("PRAGMA table_info(message);");
//console.log(db_structure);

// const db_table_content = await db_connection.execute('SELECT * FROM message')
// console.log(db_table_content)

// await db_connection.execute(`
//   DROP TABLE IF EXISTS message
//   `)

const createMessageTable = async () => {
  await db_connection.execute(`
    CREATE TABLE IF NOT EXISTS message (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      content TEXT,
      user TEXT
    )
  `)
}

await createMessageTable()

// Sintaxis cron
// * * * * *
// | | | | |
// | | | | +---- Día de la semana (0 - 7) (Domingo es 0 o 7)
// | | | +------ Mes (1 - 12)
// | | +-------- Día del mes (1 - 31)
// | +---------- Hora (0 - 23)
// +------------ Minuto (0 - 59)

// Borrar chat cada 15 minutos
cron.schedule('*/15 * * * *', async () => {
  console.log('Borrando y recreando la tabla de mensajes...')
  await db_connection.execute(`DROP TABLE IF EXISTS message`)
  await createMessageTable()
  io.emit('refresh')
  console.log('Chat reseteado.')
})

io.on('connection', async (socket) => {
  console.log('a user has connected!')

  socket.on('disconnect', () => {
    console.log('a user has disconnected')
  })

  socket.on('chat message', async (msg) => {
    let result
    const username = socket.handshake.auth.username ?? 'anonymous'
    console.log({ username })
    try {
      result = await db_connection.execute({
        sql: `INSERT INTO message (content, user) VALUES (:msg, :username)`,
        args: { msg, username },
      })
    } catch (error) {
      console.error(error)
      return
    }

    io.emit('chat message', msg, result.lastInsertRowid.toString(), username)
  })

  if (!socket.recovered) {
    try {
      const results = await db_connection.execute({
        sql: `SELECT id, content, user FROM message WHERE id > ?`,
        args: [socket.handshake.auth.serverOffset ?? 0],
      })

      results.rows.forEach((row) => {
        socket.emit('chat message', row.content, row.id.toString(), row.user)
      })
    } catch (error) {
      console.error(error)
    }
  }
})

app.use(logger('dev'))

app.use(express.static('client'))

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/client/index.html')
})

server.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
