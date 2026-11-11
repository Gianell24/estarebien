# Estaré bien — estado vigente V3

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
- .10k/verify-v3-final.mjs: 12/12; review/v3/final-results.json. Incluye regresión determinista de la última proyección, interrupción de entrada y error del reproductor. Sin excepciones.
- check.mjs site review/v3: sin defectos. Notas de ausencia de scroll hero no aplican a esta casa 3D interactiva.
- Revisión visual independiente: puerta, laptop, cocina, mesa, podcast390 y cuarto320. Detectó marcador final ausente; corregido y confirmado. No quedan bloqueos visuales. La separación entre etiqueta y encabezado en320px se amplió después de la revisión y quedó verificada.
- Reproducción real dentro del sitio comprobada para episodios1–3. Episodio4 gLvBOfHRjVM devuelve error150: YouTube no permite inserción. El watch directo carga. Se mantiene iframe listo, aviso honesto y enlace externo. El propietario debe habilitar Permitir inserción en YouTube Studio > Contenido > Detalles > Mostrar más. No se modificaron ajustes de su cuenta.
- Libro y cómic reales renderizan dentro de sus iframes; no afirmar prueba de todas sus páginas.
- Sin teléfono físico, publicación ni Lighthouse en hosting. Informe y evaluación subjetiva V2 64/80 → V3 67/80: review/v3/REVISION.md. Evidencias: review/v3/.

## Arquitectura y continuidad

- site/: HTML/CSS/JS estático sin framework ni build. Motores originales scene/fx intactos. Three.js local con licencia. house.js navegación/escena; decor.js objetos y geometría agrupada; refinements.css V3; app.js interfaz; audio.js lo-fi original por síntesis; content.json contenido editable.
- Guía privada de actualización: .10k/CONTENIDOS.md. Pendientes corto/tráiler listos para enlazar. No publicar guiones, masters, scripts ni review/.
- V1 archivado .10k/archive/v1/site/. V2 archivado .10k/archive/v2/site/ y documentos V2 junto a este. No restaurar scripts históricos sobre V3.
- Node24.16, FFmpeg9, Chrome/Edge disponibles. OpenArt OAuth ya conectado; lectura2026-11-10 Free40créditos, no es saldo actual confirmado. No requiere reconexión.
- Vista previa http://127.0.0.1:8080/ con .10k/tools/preview.mjs site --port 8080. PID10692 al reanudar, verificar HTTP antes de reutilizar. Logs .10k/preview-v3-resumed.log/.err. Proceso oculto; no detener servidores ajenos.
- Siguiente: entregar V3 local, recibir reacción visual. Para episodio4 verificar de nuevo después de que el usuario habilite inserción. Publicación/recepción real de formulario requieren hosting y autorización correspondiente; configuración privada en .10k/inbox-setup-private.txt y site/api/config.php, no imprimir.
