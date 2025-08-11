# Configuración del Frontend React Native

## ✅ CONFIGURACIÓN AUTOMÁTICA

¡Buenas noticias! **No necesitas configurar nada manualmente**. La aplicación detecta automáticamente tu IP local y puerto.

## 🚀 Inicio Rápido

```bash
npm install
npx expo start
```

**¡Eso es todo!** La app se configura sola.

## 🔧 Configuración Avanzada (Opcional)

Si necesitas personalizar el puerto del backend:

1. Copia `.env.example` a `.env`
2. Cambia el puerto si es necesario:
   ```env
   EXPO_PUBLIC_API_PORT=3001
   ```

## 🌐 ¿Cómo funciona la detección automática?

1. **IP**: Expo detecta la IP de tu servidor de desarrollo
2. **Puerto**: Usa variable de entorno o default `3000`
3. **Fallbacks**: Para emuladores Android usa `10.0.2.2`

## 📱 Plataformas soportadas:

- ✅ **iOS Device/Simulator**: Detección automática
- ✅ **Android Device**: Detección automática  
- ✅ **Android Emulator**: Usa IP especial `10.0.2.2`
- ✅ **Web**: Usa `localhost`

## 🐛 Verificar conexión

En los logs de Expo deberías ver:
```
🌐 API_BASE_URL (dynamic): http://TU_IP:3000/api
```

Si ves esto, ¡la configuración automática funcionó!

## 💡 Ventajas de esta implementación:

- ✅ **Cero configuración manual**
- ✅ **Funciona en cualquier red**
- ✅ **Puerto configurable**
- ✅ **Fallbacks para todos los casos**
- ✅ **Listo para producción**

¡Perfecto para pruebas técnicas y desarrollo colaborativo!