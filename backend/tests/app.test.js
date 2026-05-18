import mongoose from 'mongoose';
import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';

let app;
let User;
let mongoServer;

const register = (payload) => request(app).post('/api/v1/auth/register').send(payload);
const login = (payload) => request(app).post('/api/v1/auth/login').send(payload);

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  process.env.NODE_ENV = 'test';
  process.env.MONGO_URI = mongoServer.getUri();
  process.env.JWT_SECRET = 'test_access_secret_with_more_than_24_chars';
  process.env.JWT_REFRESH_SECRET = 'test_refresh_secret_with_more_than_24_chars';
  process.env.JWT_EXPIRES_IN = '15m';
  process.env.JWT_REFRESH_EXPIRES_IN = '7d';
  process.env.CLIENT_URLS = 'http://localhost:5173';

  ({ default: app } = await import('../src/app.js'));
  ({ default: User } = await import('../src/models/User.js'));
  await mongoose.connect(process.env.MONGO_URI);
});

afterEach(async () => {
  await Promise.all([mongoose.connection.collection('users').deleteMany({}), mongoose.connection.collection('tasks').deleteMany({})]);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

test('register creates a normal user even when role admin is supplied', async () => {
  const res = await register({
    name: 'Public Admin Attempt',
    email: 'public@example.com',
    password: 'password123',
    role: 'admin'
  });

  expect(res.status).toBe(201);
  expect(res.body.user.role).toBe('user');
});

test('login rejects invalid credentials', async () => {
  await register({ name: 'User One', email: 'user@example.com', password: 'password123' });

  const res = await login({ email: 'user@example.com', password: 'wrong-password' });

  expect(res.status).toBe(401);
});

test('users can manage own tasks and admins can see all tasks', async () => {
  const userRes = await register({ name: 'User One', email: 'user@example.com', password: 'password123' });
  const userToken = userRes.body.token;

  const admin = await User.create({
    name: 'Admin',
    email: 'admin@example.com',
    password: 'password123',
    role: 'admin'
  });

  const adminRes = await login({ email: admin.email, password: 'password123' });
  const adminToken = adminRes.body.token;

  const taskRes = await request(app)
    .post('/api/v1/tasks')
    .set('Authorization', `Bearer ${userToken}`)
    .send({ title: 'Private task', description: 'Owned by user' });

  expect(taskRes.status).toBe(201);

  const userTasks = await request(app).get('/api/v1/tasks?page=1&limit=10').set('Authorization', `Bearer ${userToken}`);
  const adminTasks = await request(app).get('/api/v1/tasks?page=1&limit=10').set('Authorization', `Bearer ${adminToken}`);

  expect(userTasks.status).toBe(200);
  expect(userTasks.body.total).toBe(1);
  expect(userTasks.body.totalPages).toBe(1);
  expect(adminTasks.status).toBe(200);
  expect(adminTasks.body.total).toBe(1);
});

test('non-admin users cannot access admin user list', async () => {
  const userRes = await register({ name: 'User One', email: 'user@example.com', password: 'password123' });

  const res = await request(app).get('/api/v1/users').set('Authorization', `Bearer ${userRes.body.token}`);

  expect(res.status).toBe(403);
});

