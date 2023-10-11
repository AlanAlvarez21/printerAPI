const request = require('supertest');
const app = require('./app'); // Import your Express app

describe('GET /usuarios', () => {
  it('should get a list of users', async () => {
    const response = await request(app).get('/usuarios');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
  });
});

describe('POST /usuarios', () => {
  it('should create a new user', async () => {
    const newUser = {
      nombre: 'John Doe',
      correo: 'johndoe@example.com',
      edad: 30,
      sexo: 'Male',
    };

    const response = await request(app).post('/usuarios').send(newUser);
    expect(response.status).toBe(201);
    expect(response.body.mensaje).toBe('Usuario creado con éxito');
  });
});

describe('PUT /usuarios/:id', () => {
  it('should update user data', async () => {
    const updatedUser = {
      nombre: 'Updated Name',
      correo: 'updated@example.com',
      edad: 35,
      sexo: 'Female',
    };

    const response = await request(app).put('/usuarios/1').send(updatedUser); // Replace '1' with a valid user ID
    expect(response.status).toBe(200);
    expect(response.body.mensaje).toBe('Usuario actualizado con éxito');
  });
});

describe('DELETE /usuarios/:id', () => {
  it('should delete a user by ID', async () => {
    const response = await request(app).delete('/usuarios/1'); // Replace '1' with a valid user ID
    expect(response.status).toBe(200);
    expect(response.body.mensaje).toBe('Usuario eliminado con éxito');
  });
});
