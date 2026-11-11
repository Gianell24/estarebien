# Dirección vigente — revisión 3 (2026-11-11)

Se implementa la entrada desde una puerta de madera cerrada y con herrajes, con un CTA crema destacado y una mano sobre la manija. Copia vigente: «UNA CASA · SEIS HISTORIAS», «Estaré bien.», «Detrás de esta puerta, hay cosas que no se dijeron.», «Comenzar el recorrido», «Haz clic y abre la puerta», «Explora a tu ritmo. Cada objeto guarda una historia». Estaré bien es el enlace al inicio. El pie solicitado lleva el crédito literal a la izquierda y el logo real Ruway en crema a la derecha, sin enlazarlo al home.

## Movimiento y composición

La entrada dura2.6s: la puerta gira en el primer55% del progreso; el avance de cámara comienza al18% y concluye dentro de la sala. El texto se desplaza hacia la izquierda hasta140px y se desvanece durante el primer tercio. En teléfono viaja hacia arriba hasta90px; la puerta se centra y el CTA queda bajo el texto. Todos dependen del mismo progreso de entrada, no de temporizadores independientes. Movimiento reducido muestra directamente la composición final. No hay película, filmtype ni seeking de video que verificar.

El cambio rápido de habitación usa un fundido de0.48s para evitar el vuelo por esquinas. El clic libre conserva rutas transitables y orientación estable. «Encontrarlo» en una misma habitación gira hacia el objeto sin mover la posición. Lecturas y descripciones conservan el instrumental. Las obras audiovisuales lo atenúan; error/pausa/cierre lo recuperan. Los lectores Heyzine están dentro de la ficha.

El mobiliario se revisó para que apoyos y uniones sean visibles: grifo arqueado, tetera en hornilla, cuatro sillas, mantel fino con caída, tallos y hojas unidos, dos plantas a los lados del televisor y planta alta en el comedor. Los cuadros usan las superficies internas de las pinturas originales rectificadas en vez de fotografías de marcos mal recortadas. La laptop tiene teclas, trackpad y fondo original «Respira. Un momento a la vez.». Se conserva el carácter estilizado de la reconstrucción.

## Podcast y estados

Portadas originales optimizadas1280×720WebP. Episodios: La tensión, La despedida, El inicio, La promesa. Los cuatro están publicados; los tres primeros se reprodujeron embebidos durante la revisión. El cuarto presenta error150 del proveedor y necesita que el propietario habilite inserción. No se disimula este error ni se sustituye la obra. Corto en rodaje; libro/cómic/Instagram mantienen estados de desarrollo. Sin gasto adicional ni publicación web.

El encabezado móvil se separó de las etiquetas para evitar congestión en320px. Evidencia vigente: review/v3/REVISION.md, results.json, final-results.json y capturas. Revisión independiente sin bloqueos tras corregir la proyección final del marcador. Las decisiones contradictorias de los apartados siguientes son historial deV1/V2.

---

# Estaré bien — dirección y primera versión navegable

Estado: tratamiento local para revisión, basado en las imágenes entregadas y el guion V2. production_level: studio (selección explícita del usuario). Ninguna generación de pago aprobada. Coste de generación de esta versión: 0 créditos. Publicación pendiente.

## Revisión 2 — dirección vigente solicitada por el usuario

La casa 3D pasa a ser la home completa. El título «Estaré bien» y «Comenzar el recorrido» aparecen sobre la escena, junto al logo blanco original de Ruway. Se retira el recorrido fotográfico y la página editorial larga. Los objetos abren fichas sin fotos de los ambientes; el videoclip conserva su póster. Si falla WebGL, se ofrece reintentar y abrir el menú de historias.

El visitante camina haciendo clic en el suelo, usando scroll, las flechas o la cruceta, y arrastra para mirar. Cuatro sillas miran hacia la mesa. El dintel de la puerta no bloquea el suelo y el escritorio deja libre el cruce cocina-cuarto. Las rutas usan los mismos límites físicos que el movimiento libre.

La música continúa al leer, abrir menú y contacto. Cede exclusivamente al reproducir una obra y vuelve al cerrar el reproductor. Instagram de Elisa se conserva como obra, se elimina como enlace social. Se conserva YouTube de Ruway y la opción «Redes de Ruway · Próximamente».

Contacto: diálogo con nombre, correo y mensaje, respetando la referencia del usuario. Texto: «Estamos a un mensaje de distancia. Cuéntanos qué tienes en mente. Nos encantará leerte». No se promete un tiempo de respuesta. El envío requiere activar y comprobar el backend en hosting; la vista local lo informa sin fingir recepción. La nueva sinopsis del podcast se conserva íntegra en content.json.

Este bloque reemplaza las decisiones de portada, vista fotográfica, contacto por mailto y atenuación de audio de la versión inicial descrita debajo. Evidencia actual: review/v2/.

## Contexto y autoridad

Guion de Daniel Vilca, extraído completo (210 párrafos no vacíos, sin cambios controlados) para contexto interno. No se incluye el guion en el sitio público. Autoridad visual: póster Estoy bien, sala de Elisa, comedor, cocina y cuarto de Elisa entregados por el usuario. Los originales permanecen en `photos/`, fuera del sitio desplegable.

El usuario pide navegación tridimensional con clic, teclado y objetos, por lo que la cámara y la casa son geometría WebGL interactiva adicional a los motores suministrados. No se reemplaza esa petición por un video lineal. Los motores `scene.js/css` y `fx.js/css` se copian sin modificar; se usan sus recursos de composición y aparición. No hay película generada en este tratamiento ni se afirma haber verificado sincronía de tipografía con una película inexistente.

## La idea

**Lo que una casa guarda.** Un hogar cálido por fuera de las emociones de Elisa: madera oscura, cerámica, luz de lámpara, objetos cotidianos. El visitante descubre las obras a través de las cosas que sus personajes han dejado. El recorrido comienza con el videoclip y permite explorar el resto libremente. La casa no revela el desenlace del corto.

Alternativas consideradas: un archivo de pistas con cajas y documentos haría central a Julián; una casa nocturna de terror distorsionaría el tono. Se elige la casa íntima de Elisa por las referencias del usuario y la continuidad con el corto. La planta es una adaptación web propuesta, no un levantamiento de la locación real. El modelo usa formas estilizadas, no se presenta como reconstrucción fotogramétrica de las imágenes.

## Recorrido y objetos

| Ambiente | Objeto | Obra | Función narrativa |
|---|---|---|---|
| Sala | Televisor | Estoy bien, videoclip | El punto de partida; póster original y reproducción bajo demanda |
| Sala | Libro en la mesa | Mi familia y luego yo | Una historia sobre sostener a los demás en silencio |
| Comedor | Teléfono | La cuenta de Elisa | Lo que se muestra y lo que queda fuera de la pantalla |
| Cocina | Radio | Estaré bien, podcast | La voz de Esther y el origen de una frase |
| Cuarto | Cuaderno de dibujos | ¿Me conoces?, cómic | La intimidad y las amistades de Elisa |
| Cuarto | Lámpara | Estaré bien, cortometraje | La noche, el cansancio y el espacio para poner un límite |

## Tratamiento visual

Paleta tomada de los materiales y sombras de las referencias: fondo #171d1b, panel #222925, crema #f1e7d4, latón #d9b878, texto secundario #c2c4b7. La fotografía de sala ocupa la portada completa. Cormorant Garamond normal e italic para títulos; Manrope 400/500/600 para lectura y controles. Se alojan los archivos WOFF2 y sus licencias.

La tipografía de portada mantiene una composición legible, con el título a gran escala y la sala visible. En teléfono, el título y CTA se recomponen abajo, dejando el ambiente arriba. La experiencia no depende de un video. Dentro de la casa, indicadores HTML accesibles siguen las coordenadas proyectadas de los objetos 3D; no flotan sobre una captura plana. Las etiquetas son estables, los aros señalan interacción y el movimiento se detiene con preferencia de movimiento reducido.

## Texto de portada y camino editorial

- Identidad: RUWAY / PRODUCCIONES.
- Eyebrow: UN UNIVERSO TRANSMEDIA.
- H1: Estaré bien.
- Entrada: Una casa guarda más de lo que se ve. Entra y descubre lo que sus habitantes no supieron decir.
- CTA: Entrar a la casa.
- Alternativa accesible: Ver todas las historias.
- Detalle: 03:47 A. M. / ELISA SIGUE DESPIERTA.
- Instrucción al entrar: Muévete con las flechas. Arrastra para mirar. Toca los objetos iluminados.
- Inicio del relato: Todo empieza con un «estoy bien».
- Presentación del videoclip: Julián pierde su trabajo y decide ocultárselo a Elisa. Entre las deudas y lo que nunca se dice, una relación empieza a romperse.
- Acción: Ver videoclip.
- Índice: La historia continúa en otros lugares.
- Cierre: A veces, estar bien empieza por poder decirlo.
- Contacto: Hablemos. / Contáctanos.
- Correo: ruwayproducciones@gmail.com.

Cada ficha usa el título, sinopsis y URL del brief. Solo el videoclip se etiqueta como disponible y terminado. Libro y cómic se etiquetan como versiones en desarrollo con acceso a los enlaces entregados; Instagram, como relato en desarrollo. Podcast: próximamente. Cortometraje: en rodaje. Un enlace al canal Ruway no se presenta como si fuera el video pendiente.

## Interacciones y accesibilidad

Recorrido: cámara 3D con flechas arriba/abajo para caminar, izquierda/derecha para girar y arrastre para mirar. Botones táctiles equivalentes. Atajos a habitaciones y menú de historias siempre disponibles. Los objetos tienen aros luminosos, nombre y foco visible. Las colisiones evitan atravesar paredes y muebles. Ayuda, mapa y regreso a portada son explícitos.

Menú lateral y fichas: diálogos con foco controlado, cierre por Escape, devolución del foco y contenido exterior inerte. Los medios externos solo se cargan tras clic de reproducción; cerrar destruye el reproductor. Fallback de imagen y acceso a todas las obras si falla WebGL. Movimiento reducido desactiva transiciones y la música puede silenciarse en cualquier momento.

Audio: instrumental lo-fi original generado en el navegador por síntesis musical programada, sin muestras ni canciones de terceros. Activación solo después de gesto de entrada y opción del visitante. Se atenúa/pausa al abrir una obra y se detiene con pestaña oculta. No se declara como banda sonora oficial.

Contenido futuro: `site/content.json` es la fuente de verdad de URL, estado, portada, sinopsis, tráiler y medios. Se permite YouTube y archivos locales MP4/MP3/PDF. Una guía privada explica la actualización. Contacto mediante mailto, conforme a la elección del usuario; no requiere contraseña ni backend.

## Revisión

Completadas: capturas asentadas de portada y secciones inferiores en 1440 px, 2560 px y teléfono; casa, ficha y menú; recorrido, teclado, medios y respaldo fotográfico; movimiento reducido y menús cortos en retrato/paisaje. Check sin defectos, 26/26 verificaciones generales, 19/19 de refinamiento y 9/9 de entrega. El videoclip real se reprodujo en YouTube dentro del sitio. No se ha probado en teléfono físico ni publicado. Ver review/REVISION.md para puntuación antes/después, evidencia y limitaciones.

Refinamientos: tipografía de estado y lectura ampliada; cruceta móvil visible; mural del cuarto basado en los bocetos entregados; encuadre de retrato hacia la lámpara; etiquetas de fotografías dentro del viewport; redes y contacto siempre visibles en el menú. La casa conserva una geometría estilizada, más sencilla que las imágenes originales.

El texto íntegro de la sinopsis del podcast se conserva en la ficha desplegable, además de su introducción breve. Se mantiene el texto del usuario sin revelar escenas adicionales del guion. Esta versión no equivale a aprobar una producción de imágenes/video adicional ni publicación.

Gate de copia: el texto de este paquete se implementa literalmente; cambios de copy se anotan aquí antes de la entrega.
