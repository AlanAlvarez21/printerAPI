# Node.js API

Rest Api de Usuarios con Node.js y postgresql

Deployado en kinsta: `https://nodejs-users-api-v86xc.kinsta.app/usuarios`

- POST /users - crear usuario
- GET / - obtener todos los usuarios
- GET users/:user_id - obtener un usuario 
- PUT users/:user_id - editar usuario
- DELETE users/:user_id - eliminar usuario

Documentación de la API con swagger: `https://nodejs-users-api-v86xc.kinsta.app/api-docs/#/`

Para correr el repo en local:
- npm i
- npm start 

Para correr los test:
- npm test 