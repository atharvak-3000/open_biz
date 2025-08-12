'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';

interface FormField {
  name: string;
  label: string;
  type: string;
  regex: string;
  required: boolean;
  placeholder?: string;
  errorMessage?: string;
}

interface FormStep {
  id: number;
  title: string;
  description: string;
  fields: FormField[];
  submitText: string;
  endpoint: string;
}

interface FormSchema {
  steps: FormStep[];
  dummyData: {
    validAadhaar: string;
    validOtp: string;
  };
}

interface FormData {
  aadhaar?: string;
  otp?: string;
  pan?: string;
}

export default function UdyamForm() {
  const [schema, setSchema] = useState<FormSchema | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [formData, setFormData] = useState<FormData>({});

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue
  } = useForm<FormData>();

  // Load form schema
  useEffect(() => {
    fetch('/form_schema.json')
      .then(response => response.json())
      .then(data => setSchema(data))
      .catch(error => console.error('Error loading form schema:', error));
  }, []);

  const onSubmit = async (data: FormData) => {
    if (!schema) return;

    setIsSubmitting(true);
    setSubmitMessage(null);

    const currentStepData = schema.steps.find(step => step.id === currentStep);
    if (!currentStepData) return;

    try {
      // Handle step-specific validation and API calls
      if (currentStep === 1) {
        // Aadhaar validation
        if (data.aadhaar !== schema.dummyData.validAadhaar) {
          setSubmitMessage({
            type: 'error',
            message: 'Invalid Aadhaar number. Please use: ' + schema.dummyData.validAadhaar
          });
          setIsSubmitting(false);
          return;
        }

        // Store Aadhaar and move to OTP step
        setFormData(prev => ({ ...prev, aadhaar: data.aadhaar }));
        setSubmitMessage({
          type: 'success',
          message: 'OTP sent to your registered mobile number'
        });
        setCurrentStep(2);
        reset();

      } else if (currentStep === 2) {
        // OTP validation
        if (data.otp !== schema.dummyData.validOtp) {
          setSubmitMessage({
            type: 'error',
            message: 'Invalid OTP. Please use: ' + schema.dummyData.validOtp
          });
          setIsSubmitting(false);
          return;
        }

        // Store OTP and move to PAN step
        setFormData(prev => ({ ...prev, otp: data.otp }));
        setSubmitMessage({
          type: 'success',
          message: 'OTP verified successfully'
        });
        setCurrentStep(3);
        reset();

      } else if (currentStep === 3) {
        // Final submission with all data
        const finalData = { ...formData, pan: data.pan };

        const response = await fetch(`${API_URL}/submit`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(finalData),
        });

        const result = await response.json();

        if (response.ok) {
          setSubmitMessage({
            type: 'success',
            message: 'Registration completed successfully!'
          });
          // Reset everything
          setFormData({});
          setCurrentStep(1);
          reset();
        } else {
          setSubmitMessage({
            type: 'error',
            message: result.errors ? result.errors.join(', ') : result.message || 'Submission failed'
          });
        }
      }
    } catch (error) {
      setSubmitMessage({
        type: 'error',
        message: 'Network error. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!schema) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading form...</div>
      </div>
    );
  }

  const currentStepData = schema.steps.find(step => step.id === currentStep);
  if (!currentStepData) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-6">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              {schema.steps.map((step) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.id < currentStep
                      ? 'bg-green-500 text-white'
                      : step.id === currentStep
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.id < currentStep ? '✓' : step.id}
                  </div>
                  {step.id < schema.steps.length && (
                    <div className={`w-12 h-1 mx-2 ${
                      step.id < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {currentStepData.title}
              </h1>
              <p className="text-gray-600">
                {currentStepData.description}
              </p>
            </div>
          </div>

          {/* Dummy credentials info */}
          {currentStep === 1 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Demo Aadhaar:</strong> {schema.dummyData.validAadhaar}
              </p>
            </div>
          )}

          {currentStep === 2 && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
              <p className="text-sm text-blue-800">
                <strong>Demo OTP:</strong> {schema.dummyData.validOtp}
              </p>
            </div>
          )}

          {submitMessage && (
            <div className={`mb-4 p-4 rounded-md ${
              submitMessage.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {submitMessage.message}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {currentStepData.fields.map((field) => (
              <div key={field.name}>
                <label
                  htmlFor={field.name}
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  {field.label}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </label>
                <input
                  id={field.name}
                  type={field.type}
                  placeholder={field.placeholder}
                  {...register(field.name as keyof FormData, {
                    required: field.required ? `${field.label} is required` : false,
                    pattern: {
                      value: new RegExp(field.regex),
                      message: field.errorMessage || `Invalid ${field.label} format`
                    }
                  })}
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors[field.name as keyof FormData]
                      ? 'border-red-300 bg-red-50'
                      : 'border-gray-300'
                  }`}
                />
                {errors[field.name as keyof FormData] && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors[field.name as keyof FormData]?.message}
                  </p>
                )}
              </div>
            ))}

            <div className="flex space-x-3">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => {
                    setCurrentStep(currentStep - 1);
                    setSubmitMessage(null);
                    reset();
                  }}
                  className="flex-1 py-2 px-4 border border-gray-300 rounded-md font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Back
                </button>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className={`${currentStep > 1 ? 'flex-1' : 'w-full'} py-2 px-4 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                } text-white transition-colors duration-200`}
              >
                {isSubmitting ? 'Processing...' : currentStepData.submitText}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
