const request = require('supertest');
const app = require('../index');

describe('Multi-Step Form API', () => {
  describe('POST /verify-aadhaar', () => {
    test('should return 200 for valid Aadhaar', async () => {
      const response = await request(app)
        .post('/verify-aadhaar')
        .send({
          aadhaar: '123456789012'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('OTP sent to your registered mobile number');
    });

    test('should return 400 for invalid Aadhaar format', async () => {
      const response = await request(app)
        .post('/verify-aadhaar')
        .send({
          aadhaar: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Aadhaar number must be exactly 12 digits');
    });

    test('should return 400 for wrong Aadhaar number', async () => {
      const response = await request(app)
        .post('/verify-aadhaar')
        .send({
          aadhaar: '999999999999'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Invalid Aadhaar number');
    });
  });

  describe('POST /verify-otp', () => {
    test('should return 200 for valid OTP', async () => {
      const response = await request(app)
        .post('/verify-otp')
        .send({
          otp: '123456'
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('OTP verified successfully');
    });

    test('should return 400 for invalid OTP format', async () => {
      const response = await request(app)
        .post('/verify-otp')
        .send({
          otp: '123'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('OTP must be exactly 6 digits');
    });

    test('should return 400 for wrong OTP', async () => {
      const response = await request(app)
        .post('/verify-otp')
        .send({
          otp: '999999'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Invalid OTP');
    });
  });

describe('POST /submit', () => {
  describe('Validation Tests', () => {
    test('should return 400 for invalid Aadhaar (less than 12 digits)', async () => {
      const response = await request(app)
        .post('/submit')
        .send({
          aadhaar: '12345',
          otp: '123456',
          pan: 'ABCDE1234F'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Aadhaar number must be exactly 12 digits');
    });

    test('should return 400 for invalid Aadhaar (more than 12 digits)', async () => {
      const response = await request(app)
        .post('/submit')
        .send({
          aadhaar: '1234567890123',
          otp: '123456',
          pan: 'ABCDE1234F'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Aadhaar number must be exactly 12 digits');
    });

    test('should return 400 for invalid Aadhaar (contains letters)', async () => {
      const response = await request(app)
        .post('/submit')
        .send({
          aadhaar: '12345678901A',
          otp: '123456',
          pan: 'ABCDE1234F'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Aadhaar number must be exactly 12 digits');
    });

    test('should return 400 for invalid OTP (less than 6 digits)', async () => {
      const response = await request(app)
        .post('/submit')
        .send({
          aadhaar: '123456789012',
          otp: '123',
          pan: 'ABCDE1234F'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('OTP must be exactly 6 digits');
    });

    test('should return 400 for invalid OTP (more than 6 digits)', async () => {
      const response = await request(app)
        .post('/submit')
        .send({
          aadhaar: '123456789012',
          otp: '1234567',
          pan: 'ABCDE1234F'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('OTP must be exactly 6 digits');
    });

    test('should return 400 for invalid OTP (contains letters)', async () => {
      const response = await request(app)
        .post('/submit')
        .send({
          aadhaar: '123456789012',
          otp: '12345A',
          pan: 'ABCDE1234F'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('OTP must be exactly 6 digits');
    });

    test('should return 400 for invalid PAN (wrong format)', async () => {
      const response = await request(app)
        .post('/submit')
        .send({
          aadhaar: '123456789012',
          otp: '123456',
          pan: 'INVALID'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('PAN must be in format: 5 letters, 4 digits, 1 letter');
    });

    test('should return 400 for invalid PAN (numbers in wrong position)', async () => {
      const response = await request(app)
        .post('/submit')
        .send({
          aadhaar: '123456789012',
          otp: '123456',
          pan: '1BCDE1234F'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('PAN must be in format: 5 letters, 4 digits, 1 letter');
    });

    test('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/submit')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveLength(5); // Now includes dummy data validation
    });

    test('should return 400 for multiple validation errors', async () => {
      const response = await request(app)
        .post('/submit')
        .send({
          aadhaar: '123',
          otp: '12',
          pan: 'INVALID'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toHaveLength(5); // Now includes dummy data validation
    });
  });

  describe('Success Tests', () => {
    test('should return 201 for valid complete data', async () => {
      const response = await request(app)
        .post('/submit')
        .send({
          aadhaar: '123456789012',
          otp: '123456',
          pan: 'ABCDE1234F'
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Registration completed successfully');
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data).toHaveProperty('createdAt');
    });

    test('should return 400 for valid format but wrong Aadhaar in final submit', async () => {
      const response = await request(app)
        .post('/submit')
        .send({
          aadhaar: '999999999999',
          otp: '123456',
          pan: 'ABCDE1234F'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Invalid Aadhaar number');
    });

    test('should return 400 for valid format but wrong OTP in final submit', async () => {
      const response = await request(app)
        .post('/submit')
        .send({
          aadhaar: '123456789012',
          otp: '999999',
          pan: 'ABCDE1234F'
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.errors).toContain('Invalid OTP');
    });
  });
});
});

describe('GET /', () => {
  test('should return API info', async () => {
    const response = await request(app).get('/');
    
    expect(response.status).toBe(200);
    expect(response.body.message).toBe('Udyam Registration API Server');
  });
});
