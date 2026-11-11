# Cómo actualizar Estaré bien

El sitio está en `site/`. La información de las obras se edita en `site/content.json`. Puedes pedir los cambios en este chat con los enlaces o archivos definitivos; no necesitas editar código para solicitarlos.

## Cuando esté listo el cortometraje

Busca en `stories` la obra por su `id`: `corto`. Conserva `id`, `room`, `object` y `number`, que conectan la obra con el objeto de la casa. Actualiza:

```json
"status": "Disponible",
"ready": true,
"type": "youtube",
"url": "https://www.youtube.com/watch?v=ID_DEL_VIDEO",
"youtubeId": "ID_DEL_VIDEO",
"action": "Reproducir cortometraje"
```

Reemplaza `ID_DEL_VIDEO` por los 11 caracteres reales de YouTube. Puedes omitir `youtubeId`: el sitio también lo obtiene del enlace de YouTube. Mantén la obra como no disponible y con `url: null` mientras no esté lista.

## Podcast: episodios ya disponibles

La obra podcast usa type: series y una lista episodes. Cada entrada conserva id (ep-1, etc.), number, title, image, type: youtube, url y youtubeId. Para cambiar una portada, guarda la imagen optimizada en assets/ y actualiza image. Para añadir un episodio, añade una entrada con id único y actualiza status. No cambies la serie completa a un solo video.

Los episodios1–3 se reprodujeron dentro del sitio. El episodio4 devuelve error150: su configuración en YouTube no permite inserción. En YouTube Studio abre Contenido > episodio4 > Detalles > Mostrar más, marca Permitir inserción y guarda. Después recarga y comprueba la reproducción. La web ya tiene el enlace correcto; no requiere cambiar código. Si no puedes habilitarla, conserva el enlace externo o facilita un archivo propio autorizado para reproducción local.

Referencias: [API de YouTube](https://developers.google.com/youtube/iframe_api_reference#onError) y [ayuda de inserción](https://support.google.com/youtube/answer/171780?hl=es).

## Añadir el tráiler

Reemplaza el `"trailer": null` del principio por:

```json
"trailer": {
  "type": "youtube",
  "url": "https://youtu.be/ID_DEL_TRAILER",
  "youtubeId": "ID_DEL_TRAILER"
}
```

La ficha del corto mostrará «Ver tráiler» automáticamente, aunque el corto siga en rodaje. No cambies la disponibilidad del corto solo porque ya exista un tráiler.

## Alojar archivos propios

Copia un MP4 a `site/assets/cortometraje.mp4`; en la obra usa `"type": "video"` y `"url": "assets/cortometraje.mp4"`. Para audio, usa `"type": "audio"` y una ruta como `assets/podcast.mp3`. Quita un `youtubeId` antiguo para evitar confusión.

Para libro y cómic de Heyzine, conserva `"type": "flipbook"` y actualiza `url`: se abrirán dentro de la web. Para un PDF local o una web que no admita inserción usa `"type": "link"`. Los archivos finales se añaden al directorio público `site/`; evita poner allí documentos de producción, guiones o archivos privados. En hosting, YouTube permite distribuir videos grandes sin cargar el peso al propio sitio.

## Portadas, sinopsis y enlaces

- `title`: título de la obra.
- `kind`: Videoclip, Libro, Cómic, Instagram, Podcast o Cortometraje.
- `image`: ruta de portada WebP/JPG/PNG dentro de `site/`.
- `excerpt`: presentación breve, visible al abrir.
- `synopsis`: texto que se muestra al desplegar «Leer la sinopsis».
- `status`: texto visible, por ejemplo «Disponible», «En rodaje» o «En desarrollo».
- `ready`: indica si la obra está terminada, independientemente de que ya haya un enlace provisional.
- `action`: texto del botón de apertura o reproducción.

El correo y las redes globales también están en los enlaces de `site/index.html`. Si cambian, hay que actualizar esas apariciones además de `content.json`.

## Verlo y publicarlo

La vista local funciona en `http://127.0.0.1:8080/` mientras siga encendido el servidor. Si se cerró, abre PowerShell en la carpeta del proyecto y ejecuta:

```powershell
node .10k/tools/preview.mjs site --port 8080
```

Después de editar el JSON, guarda y recarga la página. Comprueba la ficha, el reproductor y el objeto de la casa. No abras `index.html` directamente como archivo: necesita el servidor para cargar el contenido y los módulos.

La dirección local solo funciona en esta computadora. Para compartirlo públicamente falta autorizar/configurar la publicación. El paquete de hosting debe contener únicamente `site/`. Antes de publicar, se completarán el dominio, canonical, OG y sitemap y se verificará HTTPS y la experiencia desde la dirección final.

## Música y modelo

La música actual es una composición de síntesis en `audio.js`, sin muestras externas, con opción de silencio. Una futura banda sonora oficial puede sustituirla conservando los controles.

La casa 3D está en `house.js`, con mobiliario en `decor.js`, y es la pantalla de inicio. La puerta cerrada se abre al comenzar; Estaré bien vuelve al inicio. Se puede hacer clic en el suelo para caminar, usar scroll para avanzar/retroceder, arrastrar para mirar, o utilizar flechas/cruceta. No hay vista de ambientes originales. La música sigue durante la lectura de fichas y se silencia temporalmente al reproducir una obra.

## Formulario de contacto

«Contáctanos» abre el formulario con nombre, correo y mensaje. Su interfaz está preparada y valida los campos. La vista local no envía mensajes y muestra esa situación sin confirmar una recepción inexistente.

Para activarlo al publicar, el hosting debe ejecutar PHP. El código de recepción y bandeja está en `api/`, `admin/` y `data/`. Hay que configurar el dominio/remitente, comprobar el almacenamiento privado y que las notificaciones llegan a `ruwayproducciones@gmail.com`. El correo de destino no equivale a una cuenta remitente SMTP configurada. La contraseña la elegirá el propietario en su bandeja; no debe enviarse en el chat.

Se conserva el acceso directo al correo dentro del formulario. Los archivos de configuración y setup contienen datos privados: no servirlos como archivos estáticos ni incluirlos en repositorios públicos. El servidor de vista previa incluido bloquea PHP y carpetas privadas.
