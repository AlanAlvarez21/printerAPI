const bodyParser = require('body-parser');
const express = require('express')
const cors = require('cors')
const app = express()
const pool = require('./db')
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('./swaggerOptions');
const swaggerSpec = swaggerJSDoc(swaggerOptions);

const { v4: uuidv4 } = require('uuid')


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(cors())
app.use(express.json()) 


// Ruta GET para obtener la lista de usuarios
/**
 * @swagger
 * /usuarios:
 *   get:
 *     summary: Get a list of users
 *     responses:
 *       200:
 *         description: Successful response
 *         schema:
 *           type: array
 *           items:
 *             $ref: '#/definitions/User'
 */
app.get('/usuarios', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM public.users ORDER BY email ASC ');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al obtener los usuarios' });
  }
});


// Ruta POST para crear nuevos usuarios
/**
 * @swagger
 * /usuarios:
 *   post:
 *     summary: Create a new user
 *     parameters:
 *       - name: user
 *         in: body
 *         description: The user to create
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 */
app.post('/usuarios', async (req, res) => {
  const id = uuidv4();

  const { nombre, correo, edad, sexo } = req.body;
  try {
    await pool.query(
      'INSERT INTO users (name, age, gender, email, id) VALUES ($1, $2, $3, $4, $5)',
      [nombre, edad, sexo, correo, id]
    );
    res.status(201).json({ mensaje: 'Usuario creado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al crear el usuario' });
  }
});

// Ruta PUT para editar los datos del usuario por ID
/**
 * @swagger
 * /usuarios/{id}:
 *   put:
 *     summary: Update user data by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the user to update
 *         required: true
 *         type: string
 *       - name: user
 *         in: body
 *         description: New user data
 *         required: true
 *         schema:
 *           $ref: '#/definitions/User'
 *     responses:
 *       200:
 *         description: User updated successfully
 *       400:
 *         description: Invalid input
 *       404:
 *         description: User not found
 *       500:
 *         description: Error occurred while updating the user
 */
app.put('/usuarios/:id', async (req, res) => {
  const userId = req.params.id;
  const { nombre, correo, edad, sexo } = req.body;
  try {
    await pool.query(
      'UPDATE users SET name = $1, email = $2, age = $3, gender = $4 WHERE id = $5',
      [nombre, correo, edad, sexo, userId]
    );
    res.json({ mensaje: 'Usuario actualizado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al actualizar el usuario' });
  }
});

// Ruta DELETE para borrar un usuario por ID
/**
 * @swagger
 * /usuarios/{id}:
 *   delete:
 *     summary: Delete a user by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the user to delete
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: User deleted successfully
 *       404:
 *         description: User not found
 *       500:
 *         description: Error occurred while deleting the user
 */
app.delete('/usuarios/:id', async (req, res) => {
  const userId = req.params.id;
  try {
    await pool.query('DELETE FROM users WHERE id = $1', [userId]);
    res.json({ mensaje: 'Usuario eliminado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al eliminar el usuario' });
  }
});

/**
 * @swagger
 * definitions:
 *   User:
 *     type: object
 *     properties:
 *       nombre:
 *         type: string
 *         example: "Alan Alvarez"
 *       correo:
 *         type: string
 *         example: "alandanielalvarez0000@gmail.com"
 *       edad:
 *         type: integer
 *         example: 27
 *       sexo:
 *         type: string
 *         example: "Masculino"
 */

app.listen(process.env.PORT, () => {
  console.log(`Servidor en ejecución en el puerto ${process.env.PORT}`);
});

module.exports = app
