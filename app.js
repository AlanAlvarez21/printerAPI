const express = require('express')
const cors = require('cors')
const app = express()
const pool = require('./db')
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const swaggerOptions = require('./swaggerOptions');
const swaggerSpec = swaggerJSDoc(swaggerOptions);
const { v4: uuidv4 } = require('uuid')
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');


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

// Ruta GET para obtener un usuario por ID
/**
 * @swagger
 * /usuarios/{id}:
 *   get:
 *     summary: Get a user by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         description: ID of the user to retrieve
 *         required: true
 *         type: string
 *     responses:
 *       200:
 *         description: Successful response
 *         schema:
 *           $ref: '#/definitions/User'
 *       404:
 *         description: User not found
 */
app.get('/usuarios/:id', async (req, res) => {
  const userId = req.params.id;

  try {
    const { rows } = await pool.query('SELECT * FROM public.users WHERE id = $1', [userId]);

    if (rows.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
    } else {
      res.json(rows[0]);
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al obtener el usuario' });
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
  const { nombre: name, correo: email, edad: age, sexo: gender } = req.body;

  console.log(req.body)

  // Verificar que los campos no estén vacíos
  // if (!name || !email || !age || !gender) {
  //   return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  // }

  // Verificar si el correo electrónico ya existe en la base de datos
  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1', [email]);

  if (existingUser.rows.length > 0) {
    // El correo electrónico ya existe, respondemos con un error
    return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
  }
  const edadInt = parseInt(age);

  // Validar que la edad sea un número positivo
  if (isNaN(edadInt) || edadInt < 0) {
    return res.status(400).json({ error: 'La edad debe ser un número positivo' });
  }

  // Validar que nombre, correo y sexo sean strings
  if (typeof name !== 'string' || typeof email !== 'string' || typeof gender !== 'string') {
    return res.status(400).json({ error: 'Nombre, correo y sexo deben ser cadenas de texto' });
  }

  try {
    await pool.query(
      'INSERT INTO users (name, age, gender, email, id) VALUES ($1, $2, $3, $4, $5)',
      [name, age, gender, email, id]
    );
    res.status(201).json({ mensaje: 'Usuario creado con éxito' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Ocurrió un error al crear el usuario' });
  }
});


app.post('/print', async (req, res) => {
  console.log(':DDDD');

  const lote = 'FE-C-311023124-12';
  const clave_producto = 'BOPP TRANS 35 /143';
  const peso_bruto = '12.01';
  const peso_neto = '11.5';
  const metros_lineales = '100';
  const cliente = 'don luis';
  const name = 'CACA';
  const longitudName = name.length;
  const longitudClave = clave_producto.length;

  function setName() {
    if (longitudName > 13) {
      return 10;
    } else {
      return 100;
    }
  }

  // Generate the ZPL code using a template string
  const zpl_code = `
  ^XA
  ^CI28
  ^MMT
  ^PW400
  ^LL0500
  ^LS0
  ^FO${setName()},20^A0N,30,30^FD${name}^FS
  ^FO10,60^A0N,35,35^FD     ${clave_producto}^FS
  ^FO10,100^A0N,30,30^FDPB: ${peso_bruto}kg^FS
  ^FO10,135^A0N,30,30^FDPN: ${peso_neto}kg ^FS
  ^FO10,165^A0N,30,30^FDML: ${metros_lineales}m ^FS
  ^FO10,200^BY2,2
  ^BCN,80,Y,N,N
  ^FD${lote}^FS
  ^PQ1,0,1,Y
  ^XZ
  `;

  // Define the Zebra API URL and headers
  const url = 'https://api.zebra.com/v2/devices/printers/send';
  const headers = {
    'accept': 'text/plain',
    'apikey': '31mA0UIAbKTGUMXm21ktVFAAf3emWyEQ',
    'tenant': '490b6deb9f9691080a640daada7d91e9',
    'Content-Type': 'multipart/form-data', // Add Content-Type
  };

  // Create a temporary file with the ZPL code
  fs.writeFileSync('temp.zpl', zpl_code);

  // Send the ZPL file to the Zebra API
  const formData = new FormData();
  formData.append('sn', 'D8N230701799');
  formData.append('zpl_file', fs.createReadStream('temp.zpl'));

  try {
    const response = await axios.post(url, formData, {
      headers: {
        ...formData.getHeaders(), // Include headers from form data
        ...headers, // Include your custom headers
      },
    });

    if (response.status === 200) {
      res.json({ 'message': 'ZPL file sent successfully' });
    } else {
      res.status(response.status).json({ 'message': 'Error sending the ZPL file', 'status_code': response.status });
    }
  } catch (error) {
    res.status(500).json({ 'message': 'Error sending the ZPL file', 'error': error.message });
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
  const { name, email, age, gender } = req.body;

  // Verificar que los campos no estén vacíos
  if (!name || !email || !age || !gender) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios' });
  }

  // Verificar si el correo electrónico ya existe en la base de datos (excepto para el usuario actual)
  const existingUser = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);

  if (existingUser.rows.length > 0) {
    // El correo electrónico ya existe, respondemos con un error
    return res.status(400).json({ error: 'El correo electrónico ya está en uso' });
  }
  const edadInt = parseInt(age);

  // Validar que la edad sea un número positivo
  if (isNaN(edadInt) || edadInt < 0) {
    return res.status(400).json({ error: 'La edad debe ser un número positivo' });
  }

  // Validar que nombre, correo y sexo sean strings
  if (typeof name !== 'string' || typeof email !== 'string' || typeof gender !== 'string') {
    return res.status(400).json({ error: 'Nombre, correo y sexo deben ser cadenas de texto' });
  }

  try {
    // Checa si el usuario existe
    const userExistsQuery = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);

    if (userExistsQuery.rows.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
    } else {
      // Si el usuario existe, procede a actualizar la data
      await pool.query(
        'UPDATE users SET name = $1, email = $2, age = $3, gender = $4 WHERE id = $5',
        [name, email, age, gender, userId]
      );
      res.json({ mensaje: 'Usuario actualizado con éxito' });
    }
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
    const userExists = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);

    if (userExists.rows.length === 0) {
      res.status(404).json({ error: 'Usuario no encontrado' });
    } else {
      await pool.query('DELETE FROM users WHERE id = $1', [userId]);
      res.json({ mensaje: 'Usuario eliminado con éxito' });
    }
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
