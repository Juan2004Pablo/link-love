# Link & Love

## Contexto y visión del producto

Quiero construir una web app llamada **[NOMBRE_APP]** (sugerencia: "Reko", "Linkeo" o "TuLista" — elige el que prefieras) dirigida a influencers de belleza, moda y tecnología en LATAM y a sus seguidores.

El problema que resuelve: los influencers recomiendan productos constantemente en historias de Instagram/TikTok, pero esas recomendaciones desaparecen en 24 horas y quedan dispersas. Mi app le da a cada creador **una página pública permanente** con todas sus recomendaciones organizadas, para poner ese enlace único en la bio de sus redes sociales. Los seguidores entran ahí y encuentran todo en un solo lugar, organizado por semana, categoría o colección, en vez de perseguir historias.

Referencias de producto: LTK (rewardStyle) y TikTok Shop, pero simplificado — en el MVP no hay checkout ni pagos dentro de la app, solo reseñas cortas + link externo de compra.

Modelo de negocio: la app es **gratuita** tanto para creadores como para seguidores. Se monetiza con publicidad display y contenido patrocinado (fase 1), y a futuro con comisión por afiliación cuando el usuario compra a través de los links (fase 2, no implementar aún, solo dejar la estructura de datos preparada).

## Roles de usuario

1. **Creador/Recomendador**: se registra, arma su perfil público y publica recomendaciones de productos.
2. **Seguidor/Visitante**: puede explorar y ver perfiles sin registrarse; si se registra, puede seguir creadores y guardar favoritos.
3. **Admin** (yo, por ahora sin panel visual, gestión manual desde la base de datos): controla qué publicidad y contenido patrocinado se muestra.

## Funcionalidades del MVP

### Perfil del creador (página pública)
- URL amigable tipo `/@usuario` para compartir en la bio de Instagram/TikTok.
- Foto, nombre, bio corta, categoría principal (belleza / moda / tech, puede tener más de una), links a sus redes sociales.
- Grid de recomendaciones tipo Pinterest/Instagram (imagen del producto como protagonista).
- Filtros/tabs dentro del perfil: **Recientes**, **Por semana** (ej. "Semana del 18 de agosto"), **Por categoría**, y colecciones personalizadas que el creador puede crear (ej. "Skincare de noche", "Looks de oficina").
- El creador decide cómo organiza su perfil (no todos usan las mismas tabs).

### Publicar una recomendación (desde el panel del creador)
- Imagen del producto (subida o URL).
- Título/nombre del producto.
- Reseña corta (límite de caracteres, ej. 280).
- Link externo de compra.
- Categoría/etiquetas.
- Asignar a una o varias colecciones/semana.
- Marcar como destacado (opcional).

### Exploración para seguidores
- Home/Descubrir: creadores destacados, mezcla de categorías, sin necesidad de login.
- Explorar por categoría (belleza / moda / tech).
- Buscador simple de creadores.
- Vista de detalle de una recomendación: imagen grande, reseña, botón claro "Ver producto" que abre el link externo en nueva pestaña.
- Con cuenta: seguir creadores, guardar recomendaciones en favoritos, feed personalizado de creadores seguidos.

### Registro / autenticación
- Login con email y con Google.
- Al registrarse, elegir si es Creador o Seguidor (un creador también puede consumir contenido como seguidor).

## Monetización con publicidad (importante, sin ser invasivo)

Quiero un sistema de anuncios similar a VSCO: presente pero discreto, nunca bloqueando la experiencia constantemente.

- **Banner fijo en el footer** dentro de las vistas de exploración (Home, categorías, perfil de creador). Debe ser descartable/minimizable por el usuario en esa sesión.
- **Modal publicitario ocasional**, NO en cada clic — mostrar como máximo una vez cada X minutos de navegación o cada N recomendaciones vistas (dejar ese número como constante configurable). Debe tener botón de cerrar visible de inmediato, sin delay forzado.
- **Tarjetas de "Contenido patrocinado"** mezcladas dentro del grid de recomendaciones, con una etiqueta clara y visible que diga "Publicidad" o "Patrocinado" para que el usuario nunca la confunda con una recomendación orgánica del creador.
- Estructura de datos preparada para que estos anuncios tengan: marca, imagen, link, tipo (banner/modal/card), ubicación donde aparece, fecha de inicio y fin de la campaña, y estado activo/inactivo — para poder gestionarlos manualmente por ahora.

## Estructura de datos sugerida

- `users`: id, tipo (creador/seguidor), nombre, username, foto, bio, categoría principal, redes sociales, fecha de registro.
- `recommendations`: id, creador_id, título, imagen, reseña_corta, link_externo, categoría, tags, fecha, destacado (bool).
- `collections`: id, creador_id, nombre, tipo (semanal / categoría / personalizada).
- `recommendation_collections`: tabla intermedia (una recomendación puede estar en varias colecciones).
- `follows`: seguidor_id, creador_id.
- `favorites`: seguidor_id, recommendation_id.
- `sponsored_content`: id, marca, imagen, link, tipo (banner/modal/card), ubicación, fecha_inicio, fecha_fin, activo (bool).
- (Preparar, sin implementar aún) `clicks`: recommendation_id, timestamp — para medir qué tan efectivo es cada link, base para el futuro modelo de afiliación.

## Pantallas necesarias

1. Home / Descubrir (pública).
2. Explorar por categoría.
3. Perfil público de creador (`/@usuario`).
4. Detalle de una recomendación/producto.
5. Búsqueda.
6. Login / Registro.
7. Panel del creador: crear/editar recomendaciones, crear colecciones, ver su perfil como lo ven los demás.
8. Perfil del seguidor: favoritos guardados, creadores seguidos.

## Diseño y experiencia visual

- Mobile-first (la mayoría entrará desde el link en la bio de Instagram/TikTok, en el celular).
- Estética inspirada en LTK, TikTok Shop y VSCO: minimalista, mucho espacio para que la imagen del producto sea protagonista, tipografía limpia y moderna.
- Grid tipo masonry/Pinterest para los productos.
- Paleta de colores moderna y cálida, con onda LATAM (puedes proponerme 2-3 opciones de paleta).
- Los anuncios y contenido patrocinado deben tener un estilo visualmente diferenciado (borde sutil o fondo distinto) para que se noten como publicidad sin ser feos ni invasivos.

## Notas técnicas

- Usa Supabase para autenticación y base de datos.
- Todo en español (LATAM).
- Prioriza que las páginas de perfil de creador carguen rápido y sean fácilmente compartibles (deben verse bien también como preview/link en redes sociales — Open Graph tags con foto y bio del creador).

## Fuera del alcance del MVP (fase 2, no construir todavía)

- Sistema de afiliación con tracking de comisiones y pagos a creadores.
- Dashboard de analíticas para creadores (clics, vistas, conversión).
- Notificaciones push cuando un creador seguido publica algo nuevo.
- Panel de autoservicio para que marcas compren su propia publicidad.
- App móvil nativa.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/41512c20-91f0-4dd1-b4f9-40c90c652de7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
