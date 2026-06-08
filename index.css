import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const LoginForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Mock credentials for different user roles
  const mockCredentials = [
    { email: 'jane.doe@lawfirm.com', password: 'Receptionist123!', role: 'Receptionist' },
    { email: 'admin@lawfirm.com', password: 'Admin123!', role: 'Administrator' },
    { email: 'attorney@lawfirm.com', password: 'Attorney123!', role: 'Attorney' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    
    // Simulate authentication delay
    setTimeout(() => {
      const validCredential = mockCredentials.find(
        cred => cred.email === formData.email && cred.password === formData.password
      );
      
      if (validCredential) {
        // Store user session
        localStorage.setItem('userSession', JSON.stringify({
          email: validCredential.email,
          role: validCredential.role,
          loginTime: new Date().toISOString()
        }));
        
        // Navigate to dashboard
        navigate('/');
      } else {
        setErrors({
          general: 'Invalid email or password. Please check your credentials and try again.'
        });
      }
      
      setIsLoading(false);
    }, 1500);
  };

  const handleForgotPassword = () => {
    // In a real app, this would navigate to password reset
    alert('Password reset functionality would be implemented here. Please contact your system administrator.');
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-surface rounded-lg shadow-professional border border-border p-8">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
            <Icon name="Mic" size={32} color="white" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">VoiceLink Translator</h1>
          <p className="text-muted-foreground text-sm">
            Secure access for law firm staff
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* General Error Message */}
          {errors.general && (
            <div className="bg-error/10 border border-error/20 rounded-lg p-3 flex items-start space-x-2">
              <Icon name="AlertCircle" size={16} className="text-error mt-0.5 flex-shrink-0" />
              <p className="text-sm text-error">{errors.general}</p>
            </div>
          )}

          {/* Email Field */}
          <Input
            label="Email Address"
            type="email"
            name="email"
            placeholder="Enter your work email"
            value={formData.email}
            onChange={handleInputChange}
            error={errors.email}
            required
            disabled={isLoading}
          />

          {/* Password Field */}
          <div className="relative">
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleInputChange}
              error={errors.password}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-9 text-muted-foreground hover:text-foreground transition-professional"
              disabled={isLoading}
            >
              <Icon name={showPassword ? 'EyeOff' : 'Eye'} size={16} />
            </button>
          </div>

          {/* Sign In Button */}
          <Button
            type="submit"
            variant="default"
            size="lg"
            fullWidth
            loading={isLoading}
            disabled={isLoading}
            iconName="LogIn"
            iconPosition="right"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>

          {/* Forgot Password Link */}
          <div className="text-center">
            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-sm text-primary hover:text-primary/80 transition-professional focus-ring rounded"
              disabled={isLoading}
            >
              Forgot your password?
            </button>
          </div>
        </form>

        {/* Demo Credentials Helper */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="bg-muted rounded-lg p-4">
            <h3 className="text-sm font-medium text-foreground mb-2 flex items-center">
              <Icon name="Info" size={14} className="mr-2" />
              Demo Credentials
            </h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div>
                <strong>Receptionist:</strong> jane.doe@lawfirm.com / Receptionist123!
              </div>
              <div>
                <strong>Administrator:</strong> admin@lawfirm.com / Admin123!
              </div>
              <div>
                <strong>Attorney:</strong> attorney@lawfirm.com / Attorney123!
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;