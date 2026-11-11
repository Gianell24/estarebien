import fs from 'node:fs/promises';
for(const file of ['plan.md','design-package.md','CONTENIDOS.md']){
 const path=`.10k/archive/v2/${file}`;
 try{await fs.access(path);}catch{await fs.copyFile(`.10k/${file}`,path);}
}
await fs.writeFile('.10k/plan.md',`# Estaré bien — estado vigente V3

Actualizado: 2026-11-11, America/Lima. Continuar sin repetir entrevista, elección Studio ni conexión OpenArt.

## Autorización y fuentes

- Usuario invocó 10k-websites; production_level: studio. Modelo activo conservado, no se afirma ningún cambio. Revisión independiente realizada por /root/visual_review según la habilidad.
- Gasto aprobado: ninguno. Gasto real: 0 créditos. No se generaron medios ni se publicó. Hostinger todavía no conectado.
- Referencias: fotos de sala, comedor, cocina, cuarto; póster Estoy bien; guion literario V2 de Daniel Vilca; logos reales Ruway; cuatro portadas originales del podcast; planta alta y camino de mesa. Originales fuera de site/. Guion interno en .10k/context/screenplay.txt.
- La planta es una adaptación web y el modelo es estilizado. No es fotogrametría ni se afirma superar objetivamente la referencia nomadiichorse.com.

## Versión vigente

- Home: puerta 3D cerrada y CTA crema con mano. Abre con clic y una animación de 2.6 s conduce a la sala. Tipografía se desplaza con el progreso real de la entrada, con tratamiento móvil y movimiento reducido.
- Navegación por teclado, cruceta, arrastre, clic en suelo y scroll. Los atajos cambian de habitación con fundido breve; encontrar un objeto en la misma habitación solo orienta la cámara. Apertura de diálogo cancela ruta y velocidades residuales. Menú durante entrada pausa y reanuda la puerta.
- Arreglados grifo/tetera, laptop con teclado y salvapantalla, plantas con tallos unidos, florero, cuadros rectificados y camino de mesa con caída. Exactamente cuatro sillas hacia la mesa. Plantas a ambos lados del televisor, fuera de su volumen. Paso físico cocina-cuarto libre.
- Proyección final de hotspots forzada antes de detener la animación para evitar marcadores ocultos al terminar una transición. Geometría estática agrupada; sombras estáticas; DPR adaptativo móvil. En pruebas, menos de 100 llamadas de dibujo por escena.
- Libro y cómic: lectores Heyzine dentro del diálogo; verificados cargando sus portadas reales. Podcast: cuatro portadas y reproductores internos. Sinopsis nueva del usuario preservada.
- Audio continúa en fichas, lectores, menú y contacto; cede durante reproducción y vuelve con pausa, cierre o error. Gesto del visitante para activarlo. Respeta silencio y pestaña oculta.
- Estaré bien vuelve al inicio. Ruway es marca crema pequeña no enlazada, extremo derecho del pie. Izquierda: © 2026 Lo Que Estaré Bien. Cortometraje transmedia. / Risen Studios.
- Instagram de Elisa sigue como obra, no como enlace social del menú/pie. YouTube Ruway y Redes de Ruway · Próximamente conservados. No hay modo de ambiente fotográfico.
- Contacto: diálogo Nombre/Correo/Mensaje. Backend suministrado preparado, todavía sin activar en hosting. No se enviaron mensajes. PHP local no disponible. Configuración privada nunca se sirve ni se imprime.

## Verificación y bloqueo externo concreto

- .10k/verify-v3.mjs: 78/78; review/v3/results.json. Teclado, clic, scroll, rutas, objetos, música, medios, cuatro tamaños y errores.
- .10k/verify-v3-final.mjs: 11/11; review/v3/final-results.json. Incluye regresión determinista de la última proyección, interrupción de entrada y error del reproductor. Sin excepciones.
- check.mjs site review/v3: sin defectos. Notas de ausencia de scroll hero no aplican a esta casa 3D interactiva.
- Revisión visual independiente: puerta, laptop, cocina, mesa, podcast390 y cuarto320. Detectó marcador final ausente; corregido y confirmado. No quedan bloqueos visuales. Observación menor: etiqueta cerca del encabezado en320px, sin solaparse.
- Reproducción real dentro del sitio comprobada para episodios1–3. Episodio4 gLvBOfHRjVM devuelve error150: YouTube no permite inserción. El watch directo carga. Se mantiene iframe listo, aviso honesto y enlace externo. El propietario debe habilitar Permitir inserción en YouTube Studio > Contenido > Detalles > Mostrar más. No se modificaron ajustes de su cuenta.
- Libro y cómic reales renderizan dentro de sus iframes; no afirmar prueba de todas sus páginas.
- Sin teléfono físico, publicación ni Lighthouse en hosting. Informe y evaluación subjetiva V2 64/80 → V3 67/80: review/v3/REVISION.md. Evidencias: review/v3/.

## Arquitectura y continuidad

- site/: HTML/CSS/JS estático sin framework ni build. Motores originales scene/fx intactos. Three.js local con licencia. house.js navegación/escena; decor.js objetos y geometría agrupada; refinements.css V3; app.js interfaz; audio.js lo-fi original por síntesis; content.json contenido editable.
- Guía privada de actualización: .10k/CONTENIDOS.md. Pendientes corto/tráiler listos para enlazar. No publicar guiones, masters, scripts ni review/.
- V1 archivado .10k/archive/v1/site/. V2 archivado .10k/archive/v2/site/ y documentos V2 junto a este. No restaurar scripts históricos sobre V3.
- Node24.16, FFmpeg9, Chrome/Edge disponibles. OpenArt OAuth ya conectado; lectura2026-11-10 Free40créditos, no es saldo actual confirmado. No requiere reconexión.
- Vista previa http://127.0.0.1:8080/ con .10k/tools/preview.mjs site --port8080 (usar espacio real antes de8080). PID10692 al reanudar, verificar HTTP antes de reutilizar. Logs .10k/preview-v3-resumed.log/.err. Proceso oculto; no detener servidores ajenos.
- Siguiente: entregar V3 local, recibir reacción visual. Para episodio4 verificar de nuevo después de que el usuario habilite inserción. Publicación/recepción real de formulario requieren hosting y autorización correspondiente; configuración privada en .10k/inbox-setup-private.txt y site/api/config.php, no imprimir.
`, 'utf8');
const design=await fs.readFile('.10k/design-package.md','utf8');
await fs.writeFile('.10k/design-package.md',`# Dirección vigente — revisión 3 (2026-11-11)

Se implementa la entrada desde una puerta de madera cerrada y con herrajes, con un CTA crema destacado y una mano sobre la manija. Copia vigente: «UNA CASA · SEIS HISTORIAS», «Estaré bien.», «Detrás de esta puerta, hay cosas que no se dijeron.», «Comenzar el recorrido», «Haz clic y abre la puerta», «Explora a tu ritmo. Cada objeto guarda una historia». Estaré bien es el enlace al inicio. El pie solicitado lleva el crédito literal a la izquierda y el logo real Ruway en crema a la derecha, sin enlazarlo al home.

## Movimiento y composición

La entrada dura2.6s: la puerta gira en el primer55% del progreso; el avance de cámara comienza al18% y concluye dentro de la sala. El texto se desplaza hacia la izquierda hasta140px y se desvanece durante el primer tercio. En teléfono viaja hacia arriba hasta90px; la puerta se centra y el CTA queda bajo el texto. Todos dependen del mismo progreso de entrada, no de temporizadores independientes. Movimiento reducido muestra directamente la composición final. No hay película, filmtype ni seeking de video que verificar.

El cambio rápido de habitación usa un fundido de0.48s para evitar el vuelo por esquinas. El clic libre conserva rutas transitables y orientación estable. «Encontrarlo» en una misma habitación gira hacia el objeto sin mover la posición. Lecturas y descripciones conservan el instrumental. Las obras audiovisuales lo atenúan; error/pausa/cierre lo recuperan. Los lectores Heyzine están dentro de la ficha.

El mobiliario se revisó para que apoyos y uniones sean visibles: grifo arqueado, tetera en hornilla, cuatro sillas, mantel fino con caída, tallos y hojas unidos, dos plantas a los lados del televisor y planta alta en el comedor. Los cuadros usan las superficies internas de las pinturas originales rectificadas en vez de fotografías de marcos mal recortadas. La laptop tiene teclas, trackpad y fondo original «Respira. Un momento a la vez.». Se conserva el carácter estilizado de la reconstrucción.

## Podcast y estados

Portadas originales optimizadas1280×720WebP. Episodios: La tensión, La despedida, El inicio, La promesa. Los cuatro están publicados; los tres primeros se reprodujeron embebidos durante la revisión. El cuarto presenta error150 del proveedor y necesita que el propietario habilite inserción. No se disimula este error ni se sustituye la obra. Corto en rodaje; libro/cómic/Instagram mantienen estados de desarrollo. Sin gasto adicional ni publicación web.

Evidencia vigente: review/v3/REVISION.md, results.json, final-results.json y capturas. Revisión independiente sin bloqueos tras corregir la proyección final del marcador. Las decisiones contradictorias de los apartados siguientes son historial deV1/V2.

---

${design}`, 'utf8');
const brief=await fs.readFile('.10k/brief.md','utf8');
await fs.writeFile('.10k/brief.md',`# Adenda vigente del usuario — V3

Entrada con puerta cerrada que abre a sala; CTA más vistoso. Flipbooks internos. Corregir desplazamientos erráticos y regreso desde objetos. Reparar grifo, tetera, laptop, plantas/cuadros de comedor y sala, camino de mesa con caída y dos plantas junto aTV. Mejorar rendimiento móvil. Logo crema menor a derecha del pie, crédito literal «© 2026 Lo Que Estaré Bien. Cortometraje transmedia.» y «Risen Studios» a izquierda. Estaré bien vuelve a home. Podcast disponible con cuatro portadas originales y enlaces:

1. La tensión — https://youtu.be/_Qfb3CZEx3U
2. La despedida — https://youtu.be/53lYozWhwqk
3. El inicio — https://youtu.be/KY5vfdY8BxA
4. La promesa — https://youtu.be/gLvBOfHRjVM

Estos requisitos prevalecen sobre estados antiguos del podcast. Sinopsis última se conserva en content.json. Mantener las correcciones previas de música, formulario, redes, cuatro sillas y paso libre. No se autorizó gasto ni publicación.

---

${brief}`, 'utf8');
let guide=await fs.readFile('.10k/CONTENIDOS.md','utf8');
guide=guide.replace('## Cuando esté listo el cortometraje o el podcast','## Cuando esté listo el cortometraje').replace('la obra por su `id`: `corto` o `podcast`.','la obra por su `id`: `corto`.').replace('Para el podcast, escribe `Reproducir podcast` en `action`. ','').replace('Para libros, cómic o un PDF local, conserva `"type": "link"` y actualiza `url`.','Para libro y cómic de Heyzine, conserva `"type": "flipbook"` y actualiza `url`: se abrirán dentro de la web. Para un PDF local o una web que no admita inserción usa `"type": "link"`.');
guide=guide.replace('## Añadir el tráiler',`## Podcast: episodios ya disponibles

La obra podcast usa type: series y una lista episodes. Cada entrada conserva id (ep-1, etc.), number, title, image, type: youtube, url y youtubeId. Para cambiar una portada, guarda la imagen optimizada en assets/ y actualiza image. Para añadir un episodio, añade una entrada con id único y actualiza status. No cambies la serie completa a un solo video.

Los episodios1–3 se reprodujeron dentro del sitio. El episodio4 devuelve error150: su configuración en YouTube no permite inserción. En YouTube Studio abre Contenido > episodio4 > Detalles > Mostrar más, marca Permitir inserción y guarda. Después recarga y comprueba la reproducción. La web ya tiene el enlace correcto; no requiere cambiar código. Si no puedes habilitarla, conserva el enlace externo o facilita un archivo propio autorizado para reproducción local.

Referencias: [API de YouTube](https://developers.google.com/youtube/iframe_api_reference#onError) y [ayuda de inserción](https://support.google.com/youtube/answer/171780?hl=es).

## Añadir el tráiler`);
guide=guide.replace('La casa 3D está en `house.js` y es la pantalla de inicio.','La casa 3D está en `house.js`, con mobiliario en `decor.js`, y es la pantalla de inicio. La puerta cerrada se abre al comenzar; Estaré bien vuelve al inicio.');
await fs.writeFile('.10k/CONTENIDOS.md',guide,'utf8');
await fs.writeFile('review/v3/REVISION.md',`# Revisión3 — 11 de noviembre de2026

Entrada desde puerta3D, navegación estabilizada, detalle del mobiliario, optimización móvil, lectores internos, episodios del podcast y pie corregidos. V2 preservada en .10k/archive/v2/site/.

## Verificación

- 78/78 pruebas generales: results.json; sin excepciones. Incluyen rutas, seis fichas, música, embeds con respuestas aisladas, cuatro sillas, cruce físico cocina-cuarto, clic/scroll, reentrada, movimiento reducido y WebGL no disponible.
- 11/11 pruebas finales: final-results.json. Entrada interrumpida por menú, recuperación del audio tras error150, enlace del episodio4, mensajes nulos y proyección final forzada con un límite de actualización artificialmente alto para reproducir la carrera de marcadores.
- check.mjs: sin defectos. Las notas de scroll hero no aplican: es una casa interactiva. El aviso inicial de foto duplicada era el mismo logo usado en mask/-webkit-mask; se unificó el recurso CSS, manteniendo ambos soportes.
- Medidas móviles:320×667,390×844,844×390; DPR3 emulado en suite, cap de render<=1.15 y menos de100 llamadas de dibujo. Sin solapamiento de título/cruceta ni desbordamiento horizontal. No se probó teléfono físico ni se garantiza un FPS de dispositivo real.
- Episodios1,2,3: reproducción real en navegador integrado, contadores avanzando. Episodio4: error150 observado en iframe, tanto nocookie como host normal; el video directo carga. No presentar como reproducción embebida exitosa.
- Ambos Heyzine muestran sus portadas reales dentro de la web. No se verificaron todas las páginas del proveedor. Música preservada en pruebas aisladas de lectores.
- No se enviaron correos. Contacto conserva las pruebas aisladas V2; activación/almacenamiento/notificación reales pendientes de hostingPHP. No se publicó ni se gastaron créditos.

## Evaluación visual

Juicio de diseño, no certificación técnica ni comparación objetiva con otro sitio.

| Criterio | V2 | V3 | Evidencia / límite |
|---|---:|---:|---|
| Personalidad |8|8|Casa íntima y objetos del universo; entrada con puerta.|
| Tipografía |8|8|CTA claro, desplazamiento sincronizado con puerta y lectura móvil.|
| Color |8|8|Paleta cálida conservada; logo crema.|
| Jerarquía |9|9|Recorrido inmediato; lectores y episodios dentro de su ficha.|
| Imágenes |7|8|Uniones del mobiliario reparadas, pinturas rectificadas y portadas originales. Modelo aún estilizado.|
| Movimiento |8|9|Sin rutas residuales al cerrar; atajos estables, entrada pausada por modal, indicadores finales.|
| Móvil |8|8|Controles y composiciones320/390/paisaje; agrupación geométrica. Falta teléfono físico.|
| Acabado |8|9|Medios integrados, regresiones cubiertas y fallo externo explicado.|
| Total |64/80|67/80|Principal límite: detalle estilizado frente a las imágenes de referencia.|

El revisor independiente inspeccionó door-1440, laptop-1440, kitchen-detail, table-detail, podcast-390 y cuarto-320. Encontró un marcador que podía quedar oculto después de una transición: corregido al publicar siempre la proyección del último frame. Revisó de nuevo cuarto-320 y confirmó ausencia de bloqueos. Señaló como detalle menor la cercanía entre etiqueta y encabezado, sin superposición. Su prueba de navegación por localhost no pudo ejecutarse por la restricción de red; la navegación fue verificada por las suites y el agente principal.

Alternativa descartada para atajos: un vuelo automático largo entre habitaciones mantenía giros alrededor de obstáculos y era la causa visible de desorientación. El fundido breve conserva la exploración libre por clic/teclas y hace predecibles los saltos elegidos en el menú.

## Acción del propietario: episodio4

YouTube devuelve150, equivalente a101: no permite reproducción insertada. [Referencia oficial](https://developers.google.com/youtube/iframe_api_reference#onError).

Habilitar Permitir inserción en YouTube Studio > Contenido > Detalles del episodio4 > Mostrar más, guardar y volver a probar. [Ayuda oficial](https://support.google.com/youtube/answer/171780?hl=es). El sitio ya apunta al video correcto y muestra un enlace directo mientras persista esta restricción. No se cambió la cuenta del usuario.
`, 'utf8');
console.log('V3 continuity, content guide and review updated.');
