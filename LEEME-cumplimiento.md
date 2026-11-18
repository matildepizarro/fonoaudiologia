# Cumplimiento Ley de Datos Personales — qué se hizo y qué te toca a ti

> **Versión "solo subir":** basta con subir todo a GitHub. La carpeta vieja `fonoaudiologia-main/` queda reemplazada por una redirección al sitio nuevo.
> La política NO promete aún la verificación en dos pasos ni el borrado automático del calendario. Cuando hagas los pasos 2 y 3 de abajo, avísame y agrego esas frases.

Fecha: 17-11-2026 · Versión de textos legales: 1.0

## Lo que quedó hecho en el sitio
| Exigencia | Dónde quedó |
|---|---|
| Art. 14 ter: política pública con los 12 contenidos, fecha y versión | `privacidad.html` |
| Arts. 12 y 16: consentimiento libre, previo, por acción afirmativa, casillas sin marcar; consentimiento **expreso** para datos de salud | Formulario de Agenda |
| Art. 12: poder **probar** el consentimiento | Cada correo de Formspree trae fecha, hora y versión aceptada |
| Art. 16 quáter: niños, niñas y adolescentes | Pregunta "¿Para quién es la atención?" |
| Arts. 4 a 11: derechos y procedimiento (30 días, gratis, bloqueo en 2 días hábiles, reclamo ante la Agencia) | `privacidad.html#derechos` con plantilla de correo |
| Art. 14 quáter: minimización y privacidad por defecto | El nombre ya no se guarda en la Sheet; el mapa de Google solo carga si se aprieta el botón |
| Art. 3 c: no conservar más de lo necesario | `Code.gs` borra filas 30 días después de la sesión |
| Ley del Consumidor (3 bis, 12 A): condiciones, abono, cancelación, retracto | `condiciones.html` + aceptación en el formulario |
| FAQ y textos del sitio alineados | Pregunta de cancelación actualizada y nueva pregunta de datos |

## Haz esto TÚ (no se puede hacer desde la página)
1. **Sube los archivos** al repositorio y **borra la carpeta `fonoaudiologia-main/` anidada**: es una copia vieja de tu sitio, con el formulario sin consentimientos, que hoy es pública en `/fonoaudiologia-main/`.
2. **Google Apps Script**: pega el nuevo `google-apps-script/Code.gs`, vuelve a implementar la Web App, ejecuta una vez `instalarLimpiezaDiaria` y una vez `borrarNombresGuardados`.
3. **Activa verificación en dos pasos** en tu Gmail, Google y Formspree (la política dice que lo haces).
4. **Retención en Formspree y Gmail**: borra envíos/correos de solicitudes que no se concretaron con más de 6 meses.
5. **Testimonios en video**: ten autorización **escrita** de cada persona (y de madre/padre si es menor). La ley te obliga a poder demostrarla, y debe poder retirarse.
6. **Primera atención**: prepara un consentimiento informado y ficha clínica (Ley 20.584; se guarda 15 años). La política promete entregarlos.
7. **Evaluación de impacto (art. 15 ter)**: si tratas datos de salud sin consentimiento (art. 16 bis e), la ley la exige. Pídele a un abogado/a de datos que valide si te aplica y cómo hacerla simple.
8. **Procedimiento de brechas**: anota qué harás si pierdes un celular o te hackean el correo (avisar a la Agencia y a las personas afectadas).
9. Revisa los términos de datos de Formspree, Google y la plataforma de videollamada.

## Afirmaciones de los textos que deben ser ciertas
- No grabas las sesiones online (salvo acuerdo escrito).
- Solo tú accedes a correos y planillas.
- No vendes ni cedes datos.
- No usas cookies de análisis (en el código no hay).

## Decisiones mías que debes confirmar (cámbialas si no te sirven)
- **Plazos:** 6 meses para solicitudes no concretadas; 30 días para el calendario.
- **Abono:** lo escribí como pago a cuenta de los $20.000 (se descuenta). Quité la nota interna ("avísame si el abono se pide por cada sesión...") que se veía en público; quedó "$10.000 por cada hora".
- **Cancelación:** 24 horas de aviso; con menos, el abono no se devuelve, salvo urgencia o fuerza mayor.
- **Retracto (10 días):** lo dejé vigente porque es lo más seguro frente al SERNAC. La ley permite excluirlo en servicios, pero debes avisarlo antes de contratar. Si lo excluyes, cambia la sección 6 de `condiciones.html` y consulta con un abogado/a.
- **Abono a domicilio:** el sitio solo menciona abono para presencial y online; quedó escrito así.

## Limitaciones
- Google Fonts sigue cargando al entrar (envía la IP a Google). Está informado en la política. Para eliminarlo hay que descargar las tipografías y alojarlas en `assets/` (aquí no tuve internet para hacerlo).
- Esto es un trabajo técnico y de redacción, no asesoría legal. Conviene que un abogado/a lo revise.
