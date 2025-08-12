const express = require('express');
const cors = require('cors');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 3001;

// Middleware
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Validation regex patterns
const VALIDATION_PATTERNS = {
  aadhaar: /^[0-9]{12}$/,
  otp: /^[0-9]{6}$/,
  pan: /^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/
};

// Dummy data for validation
const DUMMY_DATA = {
  validAadhaar: '123456789012',
  validOtp: '123456'
};

// Validation function
function validateField(fieldName, value) {
  if (!value || typeof value !== 'string') {
    return { isValid: false, message: `${fieldName} is required` };
  }
  
  const pattern = VALIDATION_PATTERNS[fieldName];
  if (!pattern.test(value)) {
    switch (fieldName) {
      case 'aadhaar':
        return { isValid: false, message: 'Aadhaar number must be exactly 12 digits' };
      case 'otp':
        return { isValid: false, message: 'OTP must be exactly 6 digits' };
      case 'pan':
        return { isValid: false, message: 'PAN must be in format: 5 letters, 4 digits, 1 letter' };
      default:
        return { isValid: false, message: `Invalid ${fieldName} format` };
    }
  }
  
  return { isValid: true };
}

// Routes
app.get('/', (req, res) => {
  res.json({ message: 'Udyam Registration API Server' });
});

// Step 1: Aadhaar verification
app.post('/verify-aadhaar', (req, res) => {
  try {
    const { aadhaar } = req.body;

    const aadhaarValidation = validateField('aadhaar', aadhaar);
    if (!aadhaarValidation.isValid) {
      return res.status(400).json({
        success: false,
        errors: [aadhaarValidation.message]
      });
    }

    // Check against dummy Aadhaar
    if (aadhaar !== DUMMY_DATA.validAadhaar) {
      return res.status(400).json({
        success: false,
        errors: ['Invalid Aadhaar number']
      });
    }

    res.json({
      success: true,
      message: 'OTP sent to your registered mobile number'
    });

  } catch (error) {
    console.error('Error in Aadhaar verification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Step 2: OTP verification
app.post('/verify-otp', (req, res) => {
  try {
    const { otp } = req.body;

    const otpValidation = validateField('otp', otp);
    if (!otpValidation.isValid) {
      return res.status(400).json({
        success: false,
        errors: [otpValidation.message]
      });
    }

    // Check against dummy OTP
    if (otp !== DUMMY_DATA.validOtp) {
      return res.status(400).json({
        success: false,
        errors: ['Invalid OTP']
      });
    }

    res.json({
      success: true,
      message: 'OTP verified successfully'
    });

  } catch (error) {
    console.error('Error in OTP verification:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Step 3: Final submission
app.post('/submit', async (req, res) => {
  try {
    const { aadhaar, otp, pan } = req.body;

    // Validate all fields
    const validationErrors = [];

    const aadhaarValidation = validateField('aadhaar', aadhaar);
    if (!aadhaarValidation.isValid) {
      validationErrors.push(aadhaarValidation.message);
    }

    const otpValidation = validateField('otp', otp);
    if (!otpValidation.isValid) {
      validationErrors.push(otpValidation.message);
    }

    const panValidation = validateField('pan', pan);
    if (!panValidation.isValid) {
      validationErrors.push(panValidation.message);
    }

    // Additional validation for dummy data (in real app, this would be session-based)
    if (aadhaar !== DUMMY_DATA.validAadhaar) {
      validationErrors.push('Invalid Aadhaar number');
    }

    if (otp !== DUMMY_DATA.validOtp) {
      validationErrors.push('Invalid OTP');
    }

    // If there are validation errors, return 400
    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        errors: validationErrors
      });
    }

    // Save to database
    const submission = await prisma.udyamSubmission.create({
      data: {
        aadhaar,
        otp,
        pan
      }
    });

    res.status(201).json({
      success: true,
      message: 'Registration completed successfully',
      data: {
        id: submission.id,
        createdAt: submission.createdAt
      }
    });

  } catch (error) {
    console.error('Error processing submission:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = app;
