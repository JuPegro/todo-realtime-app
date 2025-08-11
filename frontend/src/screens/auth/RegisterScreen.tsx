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
  ScrollView
} from 'react-native';
import { StackScreenProps } from '@react-navigation/stack';
import { AuthStackParamList } from '../../types';
import { useAuth } from '../../context/AuthContext';

type Props = StackScreenProps<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC<Props> = ({ navigation }) => {
  const { register, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
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
    navigation.navigate('Login');
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Text style={styles.title}>Realtime Todo</Text>
          <Text style={styles.subtitle}>Crear Cuenta</Text>
          
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Nombre</Text>
              <TextInput
                style={[styles.input, errors.name ? styles.inputError : null]}
                placeholder="Tu nombre completo"
                value={formData.name}
                onChangeText={(value) => updateFormData('name', value)}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
              />
              {errors.name ? <Text style={styles.errorText}>{errors.name}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, errors.email ? styles.inputError : null]}
                placeholder="ejemplo@correo.com"
                value={formData.email}
                onChangeText={(value) => updateFormData('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Contraseña</Text>
              <TextInput
                style={[styles.input, errors.password ? styles.inputError : null]}
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChangeText={(value) => updateFormData('password', value)}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirmar Contraseña</Text>
              <TextInput
                style={[styles.input, errors.confirmPassword ? styles.inputError : null]}
                placeholder="Repite tu contraseña"
                value={formData.confirmPassword}
                onChangeText={(value) => updateFormData('confirmPassword', value)}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
            </View>
          </View>
          
          <TouchableOpacity 
            style={[styles.button, isLoading && styles.buttonDisabled]} 
            onPress={handleRegister}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.buttonText}>Crear Cuenta</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.linkButton} 
            onPress={handleGoToLogin}
            disabled={isLoading}
          >
            <Text style={styles.linkText}>¿Ya tienes cuenta? Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#343a40',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 24,
    fontWeight: '600',
    textAlign: 'center',
    color: '#495057',
    marginBottom: 48,
  },
  form: {
    marginBottom: 32,
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#495057',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    paddingVertical: 14,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  inputError: {
    borderColor: '#dc3545',
  },
  errorText: {
    color: '#dc3545',
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#28a745',
    paddingVertical: 16,
    borderRadius: 8,
    marginBottom: 16,
    minHeight: 52,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#6c757d',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  linkButton: {
    paddingVertical: 12,
  },
  linkText: {
    color: '#007bff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default RegisterScreen;