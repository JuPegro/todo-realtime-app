import { API_BASE_URL } from './constants';

/**
 * Test function to verify automatic network configuration
 */
export const testNetworkConfiguration = async () => {
  console.log('🚀 TESTING NETWORK CONFIGURATION');
  console.log('🌐 Detected API_BASE_URL:', API_BASE_URL);
  
  try {
    const response = await fetch(`${API_BASE_URL.replace('/api', '')}/api/health`);
    const data = await response.json();
    
    console.log('✅ BACKEND CONNECTION: SUCCESS');
    console.log('📊 Health Check Response:', data);
    
    return {
      success: true,
      url: API_BASE_URL,
      response: data
    };
  } catch (error) {
    console.log('❌ BACKEND CONNECTION: FAILED');
    console.log('🔧 Error:', error);
    
    return {
      success: false,
      url: API_BASE_URL,
      error: error
    };
  }
};

/**
 * Get current network configuration info
 */
export const getNetworkInfo = () => {
  return {
    apiBaseUrl: API_BASE_URL,
    isDevelopment: __DEV__,
    timestamp: new Date().toISOString()
  };
};