# Beruz-Chat

Beruz-Chat es una aplicación de chat en tiempo real construida con Node.js, Express, Socket.IO y una base de datos SQL. 

Cada vez que se abre una ventana con la dirección `https://chat-node-js-2u1m.onrender.com/`, representa un usuario distinto. Al abrir distintas ventanas, se puede ver la comunicación entre diferentes usuarios en tiempo real. El chat se borra automáticamente cada 15 minutos utilizando node-cron.

Este proyecto ha sido extraído del curso de Node.js de Midudev.

## Dependencias

- Node.js
- Express
- Socket.IO
- dotenv
- morgan
- @libsql/client
- node-cron

## Despliegue

La aplicación está desplegada en Render. Puedes acceder a ella en la siguiente URL: [https://chat-node-js-2u1m.onrender.com/](https://chat-node-js-2u1m.onrender.com/).

## Licencia

Este proyecto está licenciado bajo la Licencia ISC.
