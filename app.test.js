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

    const response = await request(app)
      .post('/usuarios')
      .send(newUser);
    expect(response.status).toBe(201);
    expect(response.body.mensaje).toBe('Usuario creado con éxito');
  });

  it('should handle missing fields', async () => {
    const invalidUser = {
      nombre: 'John Doe',
    };

    const response = await request(app)
      .post('/usuarios')
      .send(invalidUser);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('Todos los campos son obligatorios');
  });

  it('should handle duplicate email', async () => {
    const duplicateUser = {
      nombre: 'John Doe',
      correo: 'johndoe@example.com', // Use an email that already exists
      edad: 30,
      sexo: 'Male',
    };

    const response = await request(app)
      .post('/usuarios')
      .send(duplicateUser);
    expect(response.status).toBe(400);
    expect(response.body.error).toBe('El correo electrónico ya está en uso');
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

    // Replace '1' with an existing user ID for testing
    const existingUserId = '1';

    const response = await request(app)
      .put(`/usuarios/${existingUserId}`)
      .send(updatedUser);
    expect(response.status).toBe(200);
    expect(response.body.mensaje).toBe('Usuario actualizado con éxito');
  });

  it('should handle updating a non-existing user', async () => {
    const updatedUser = {
      nombre: 'Updated Name',
      correo: 'updated@example.com',
      edad: 35,
      sexo: 'Female',
    };

    // Replace '1000' with a non-existing user ID for testing
    const nonExistingUserId = '1000';

    const response = await request(app)
      .put(`/usuarios/${nonExistingUserId}`)
      .send(updatedUser);
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Usuario no encontrado');
  });
});

describe('DELETE /usuarios/:id', () => {
  it('should delete a user by ID', async () => {
    // Replace '1' with an existing user ID for testing
    const existingUserId = '1';

    const response = await request(app).delete(`/usuarios/${existingUserId}`);
    expect(response.status).toBe(200);
    expect(response.body.mensaje).toBe('Usuario eliminado con éxito');
  });

  it('should handle deleting a non-existing user', async () => {
    // Replace '1000' with a non-existing user ID for testing
    const nonExistingUserId = '1000';

    const response = await request(app).delete(`/usuarios/${nonExistingUserId}`);
    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Usuario no encontrado');
  });
});
