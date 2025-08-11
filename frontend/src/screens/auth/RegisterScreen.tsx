import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  TextInput, 
  Alert, 
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

type Props = StackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register, isLoading } = useAuth();
  const { colors, isDark, toggleTheme } = useTheme();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateForm = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    };

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'El nombre debe tener al menos 2 caracteres';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Ingresa un email válido';
    }

    if (!formData.password.trim()) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    if (!formData.confirmPassword.trim()) {
      newErrors.confirmPassword = 'Confirma tu contraseña';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return !newErrors.name && !newErrors.email && !newErrors.password && !newErrors.confirmPassword;
  };

  const handleRegister = async () => {
    console.log('REGISTER_SCREEN - Form validation started');
    if (!validateForm()) {
      console.log('REGISTER_SCREEN - Form validation failed');
      return;
    }

    console.log('REGISTER_SCREEN - Form validation passed, attempting registration');
    try {
      const credentials = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      };
      console.log('REGISTER_SCREEN - Sending credentials:', { name: credentials.name, email: credentials.email });
      
      await register(credentials);
      console.log('REGISTER_SCREEN - Registration successful');
    } catch (error: any) {
      console.log('REGISTER_SCREEN - Registration failed:', error.message);
      Alert.alert('Error', error.message || 'Error al crear la cuenta');
    }
  };

  const handleGoToLogin = () => {
    navigation.replace('Login');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const gradientColors = isDark 
    ? ['#1f2937', '#374151', '#4b5563']
    : ['#1e3a8a', '#3b82f6', '#60a5fa'];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />
      <LinearGradient
        colors={gradientColors}
        style={styles.fullContainer}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Logo Section - Fixed, no scroll */}
          <View style={styles.logoSectionContent}>
            <View style={styles.logoContainer}>
              <View style={styles.logoBackground}>
                <Ionicons name="flash" size={32} color="white" />
              </View>
            </View>
            <Text style={styles.logoText}>TaskFlow</Text>
            <Text style={styles.logoSubtext}>Crea tu cuenta</Text>
          </View>
        </SafeAreaView>
      </LinearGradient>
      
      {/* Form Section with White Background */}
      <View style={styles.formContainer}>
        <View style={[styles.formInner, { backgroundColor: colors.surface }]}>
          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card, 
                borderColor: colors.border, 
                color: colors.text 
              }]}
              placeholder="Nombre completo"
              placeholderTextColor={colors.placeholder}
              value={formData.name}
              onChangeText={(value) => updateFormData('name', value)}
              autoCapitalize="words"
              autoCorrect={false}
              editable={!isLoading}
            />
            {errors.name ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.name}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <TextInput
              style={[styles.input, { 
                backgroundColor: colors.card, 
                borderColor: colors.border, 
                color: colors.text 
              }]}
              placeholder="Correo electrónico"
              placeholderTextColor={colors.placeholder}
              value={formData.email}
              onChangeText={(value) => updateFormData('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              editable={!isLoading}
            />
            {errors.email ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.email}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, { 
                  backgroundColor: colors.card, 
                  borderColor: colors.border, 
                  color: colors.text 
                }]}
                placeholder="Contraseña"
                placeholderTextColor={colors.placeholder}
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons 
                  name={showPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={colors.placeholder} 
                />
              </TouchableOpacity>
            </View>
            {errors.password ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.password}</Text> : null}
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.passwordInput, { 
                  backgroundColor: colors.card, 
                  borderColor: colors.border, 
                  color: colors.text 
                }]}
                placeholder="Confirmar contraseña"
                placeholderTextColor={colors.placeholder}
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity 
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons 
                  name={showConfirmPassword ? "eye-off" : "eye"} 
                  size={20} 
                  color={colors.placeholder} 
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword ? <Text style={[styles.errorText, { color: colors.error }]}>{errors.confirmPassword}</Text> : null}
          </View>

          {/* Register Button */}
          <TouchableOpacity 
            style={[
              styles.registerButton, 
              { backgroundColor: colors.primary },
              isLoading && { backgroundColor: colors.placeholder }
            ]} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.registerButtonText}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>

          {/* Login Button */}
          <TouchableOpacity 
            style={styles.loginTextButton} 
            onPress={handleGoToLogin}
            disabled={isLoading}
          >
            <Text style={[styles.loginTextButtonText, { color: colors.primary }]}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>

        </View>
      </View>
      
      {/* Theme Button in Top-Right */}
      <TouchableOpacity
        style={[styles.topRightThemeButton, { backgroundColor: colors.primary }]}
        onPress={toggleTheme}
        disabled={isLoading}
      >
        <Ionicons 
          name={isDark ? 'sunny' : 'moon'} 
          size={20} 
          color="white" 
        />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  fullContainer: {
    paddingBottom: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  safeArea: {
    flex: 0,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  logoSectionContent: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    minHeight: height * 0.25,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  logoBackground: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  logoText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  logoSubtext: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginTop: 4,
    fontWeight: '500',
  },
  formContainer: {
    backgroundColor: 'transparent',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: height * 0.3,
    marginTop: -40,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  formInner: {
    borderRadius: 20,
    padding: 24,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 16,
    paddingRight: 50,
    fontSize: 16,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    height: '100%',
  },
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  registerButton: {
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  registerButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  loginTextButton: {
    paddingVertical: 16,
    marginBottom: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loginTextButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
  topRightThemeButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    zIndex: 1000,
  },
});

export default RegisterScreen;