const request = require('supertest');
const app = require('../../app');
const { loadPlanetsData } = require("../../models/planets.model");
const { mongoConnect, mongoDisconnect } = require('../../services/mongo');

describe('Launches API', () => {
  beforeAll(async () => {
    await mongoConnect();
    await loadPlanetsData()
  });

  afterAll(async () => {
    await mongoDisconnect();
  });

  describe('Test GET /launches', () => {
    test('It should respond with 200 success', async () => {
      const response = await request(app)
        .get('/v1/launches') //
        .expect('Content-Type', /json/)
        .expect(200);
    });
  });

  describe('Test POST /launches', () => {
    const completeLaunchData = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-62 f',
      launchDate: 'January 4, 2028',
    };

    const launchDataWithoutDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-62 f',
    };

    const launchDataWithInvalidDate = {
      mission: 'USS Enterprise',
      rocket: 'NCC 1701-D',
      target: 'Kepler-62 f',
      launchDate: 'zoot',
    };

    test('It should respond with 201 created', async () => {
      const response = await request(app) //
        .post('/v1/launches')
        .send(completeLaunchData)
        .expect('Content-Type', /json/)
        .expect(201);

      const requestDate = new Date(completeLaunchData.launchDate).valueOf();
      const responseDate = new Date(response.body.launchDate).valueOf();
      expect(responseDate).toBe(requestDate);
      expect(response.body).toMatchObject(launchDataWithoutDate);

      const upcoming = response.body.upcoming;
      const success = response.body.success;

      expect(upcoming).toBe(true);
      expect(success).toBe(true);
    });

    test('It should catch missing required properties', async () => {
      const response = await request(app) //
        .post('/v1/launches')
        .send(launchDataWithoutDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Missing required launch property',
      });
    });

    test('It should catch invalid dates', async () => {
      const response = await request(app) //
        .post('/v1/launches')
        .send(launchDataWithInvalidDate)
        .expect('Content-Type', /json/)
        .expect(400);

      expect(response.body).toStrictEqual({
        error: 'Invalid launch date',
      });
    });
  });

  describe('Test delete /launches:id', () => {
    test('It should respond with 404 not found', async () => {
      const response = await request(app) //
        .delete('/v1/launches/-5')
        .expect('Content-Type', /json/)
        .expect(404);
    });

    test('It should catch launch not found', async () => {
      const response = await request(app) //
        .delete('/v1/launches/-5')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body).toStrictEqual({
        error: 'Launch not found',
      });
    });

    // test('It should catch launch already aborted', async () => {
    //   const response = await request(app) //
    //     .delete('/v1/launches/1')
    //     .expect('Content-Type', /json/)
    //     .expect(400);

    //   expect(response.body).toStrictEqual({
    //     error: 'Launch already aborted',
    //   });
    // });
  });
});
