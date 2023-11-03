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

app.post('/print', async (req, res) => {


  console.log('Petición recibida en el server');
  console.log('Body:', req.body); // Imprimir el cuerpo (body)
  console.log('Params', req.params); // Imprimir los parámetros (params) de la URL

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
