# Despliegue en Railway

El proyecto queda configurado para desplegarse desde la raíz del repositorio.

1. Crea un proyecto en Railway y selecciona **Deploy from GitHub repo**.
2. Elige este repositorio sin cambiar el directorio raíz.
3. Railway detectará `railway.json`, ejecutará `npm run build` y arrancará con `npm start`.
4. En **Settings > Networking**, genera el dominio público.

No se requieren variables de entorno propias de la aplicación. Railway proporciona `PORT` automáticamente y el servidor escucha en `0.0.0.0`.

La ruta `/health` se usa para comprobar que cada despliegue esté listo antes de recibir tráfico.
