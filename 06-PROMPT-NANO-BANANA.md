# ELEVN DJ'S — PROMPTS NANO BANANA (Fotos de Perfil DJ)

## Objetivo

Transformar las fotos reales de los DJs en retratos editoriales con smoking sobre fondo negro de fotocall. El resultado debe parecer una sesión de fotos profesional tipo GQ, no un recorte digital.

---

## Prompt Principal

> Cascos en el cuello, look clásico editorial

```
Keep the subject's face, facial features, skin tone, hair, and glasses exactly as in the reference photo. If the subject wears glasses, preserve them identically. Dress the subject in a tailored black tuxedo with satin peak lapels, crisp white dress shirt, and black bow tie. Place professional DJ headphones around the subject's neck, resting on the collar. Replace the background with a solid seamless black studio backdrop. Dramatic editorial side lighting creating elegant shadows and cinematic contrast. The mood is sophisticated, dark, and high-end. Style: professional fashion portrait, like a GQ magazine cover. Sharp focus on the face, shallow depth of field. Clean composition, no other objects or people in frame.
```

---

## Variante: Cascos en la Cabeza

> Cascos puestos, ligeramente ladeados

```
Keep the subject's face, facial features, skin tone, hair, and glasses exactly as in the reference photo. If the subject wears glasses, preserve them identically. Dress the subject in an elegant black tuxedo with satin lapels, white shirt, and black silk bow tie. The subject is wearing sleek black DJ headphones on their head, slightly tilted to one side. Solid black seamless studio backdrop. Single dramatic key light from the side creating cinematic contrast and deep shadows. High-end editorial fashion photography style, dark and minimal. Sharp focus, clean composition. No other props, objects, or people.
```

---

## Variante: Casual (Sin Corbata)

> Look más relajado, camisa abierta

```
Keep the subject's face, facial features, skin tone, hair, and glasses exactly as in the reference photo. If the subject wears glasses, preserve them identically. The subject wears a black tuxedo jacket with satin lapels over a white shirt, top button undone, no bow tie. Professional DJ headphones resting around the neck. Solid black photocall backdrop. Dramatic studio lighting, moody and dark. Style: editorial portrait photography, sophisticated and effortless. Clean frame, no distractions. The subject looks confident and natural.
```

---

## Variante: Multi-referencia + Gafas de Sol + Sonrisa

> Sube varias fotos de la misma persona para máxima fidelidad facial. Añade gafas de sol y sonrisa natural.

```
Use all the provided reference photos to accurately capture the subject's face, facial structure, skin tone, and hair. Generate a portrait of this exact person wearing a tailored black tuxedo with satin peak lapels, crisp white dress shirt, and black bow tie. The subject is wearing stylish black wayfarer-style sunglasses and has a natural, confident smile. Professional DJ headphones resting around the neck. Solid seamless black studio backdrop. Dramatic editorial side lighting with cinematic contrast and deep shadows. Style: high-end fashion portrait, GQ magazine editorial. Sharp focus on the face, shallow depth of field. Clean composition, no other objects or people in frame. Photorealistic, not illustrated.
```

### Variante con cascos en la cabeza:

```
Use all the provided reference photos to accurately capture the subject's face, facial structure, skin tone, and hair. Generate a portrait of this exact person wearing an elegant black tuxedo with satin lapels, white shirt, and black silk bow tie. The subject is wearing stylish black sunglasses and has a warm, natural smile. Sleek black DJ headphones on their head, slightly tilted to one side. Solid black seamless studio backdrop. Single dramatic key light from the side creating cinematic contrast. High-end editorial fashion photography, dark and minimal. Sharp focus, clean composition. Photorealistic, not illustrated.
```

### Variante casual (sin corbata):

```
Use all the provided reference photos to accurately capture the subject's face, facial structure, skin tone, and hair. Generate a portrait of this exact person wearing a black tuxedo jacket with satin lapels over a white shirt, top button undone, no bow tie. The subject is wearing stylish black sunglasses and has a relaxed, confident smile. Professional DJ headphones resting around the neck. Solid black photocall backdrop. Dramatic studio lighting, moody and dark. Style: editorial portrait, sophisticated and effortless. Clean frame, no distractions. Photorealistic, not illustrated.
```

### Tips para multi-referencia:
1. **Sube 3-5 fotos** de la misma persona desde distintos ángulos (frontal, 3/4, perfil)
2. **Incluye al menos una foto con buena iluminación** en la cara
3. **Varía las expresiones** en las referencias para que la IA entienda mejor la estructura facial
4. Si el resultado no se parece, añadir: `"Preserve the exact facial identity from all reference images, prioritize likeness over style"`

---

## Instrucciones de Uso

### Paso 1: Subir la foto original
- Sube la foto (o fotos) del DJ como imagen de referencia
- Usar el modo **img2img / face swap / face reference** de Nano Banana

### Paso 2: Ajustar fidelidad facial
- Fidelidad/strength: **65-75%**
- Esto mantiene los rasgos pero permite cambios de ropa y fondo
- Si la cara se deforma, bajar el strength o añadir al prompt:
  ```
  Preserve exact facial identity from reference image, photorealistic face
  ```

### Paso 3: Copiar y pegar el prompt
- Elegir una de las tres variantes según el look deseado
- Pegar el prompt completo en Nano Banana

### Paso 4: Revisar y regenerar si es necesario

---

## Solución de Problemas

### La cara se deforma o no se parece
- Bajar el parámetro de fidelidad/strength a **60-65%**
- Añadir al prompt: `"Preserve exact facial identity from reference image, photorealistic face"`
- Probar con una foto de referencia más frontal y bien iluminada

### Las gafas desaparecen o cambian
- Reforzar en el prompt: `"The subject wears the same glasses as in the reference photo, preserve glasses shape and style exactly"`
- Si se eliminan por completo, hacer un segundo pase con **inpainting** añadiendo las gafas originales

### Los cascos no aparecen bien
1. Generar primero solo el outfit (sin cascos) — eliminar la frase de headphones del prompt
2. Luego hacer un segundo pase con **inpainting** añadiendo los cascos en la zona del cuello/cabeza

### El smoking se ve raro o oversized
- Añadir al prompt: `"fitted modern slim-cut tuxedo, not oversized"`
- Si sigue mal, especificar: `"contemporary tailored fit, like a Tom Ford tuxedo"`

### El fondo no es negro puro
- Añadir al prompt: `"pure black seamless backdrop, no gradients, no texture"`
- En post-producción: subir negros con curvas

---

## Post-producción Rápida

Después de generar la imagen, ajustar en Lightroom/Photoshop o directamente en el editor de Instagram:

1. **Subir contraste** — Refuerza la separación sujeto/fondo
2. **Profundizar negros** — Curvas: bajar los negros al máximo
3. **Bajar saturación ligeramente** — Cohesión con el feed oscuro de Instagram
4. **Sharpening en la cara** — Para compensar cualquier suavizado de la IA

---

## Verificación de Calidad

Antes de usar la imagen generada, verificar:

- [ ] La cara es reconocible y fiel a la foto original
- [ ] El smoking se ve natural y bien ajustado
- [ ] El fondo es negro puro y uniforme
- [ ] La iluminación es dramática y editorial
- [ ] No hay artefactos visuales ni distorsiones
- [ ] Los cascos (si los tiene) se ven realistas
- [ ] La imagen no parece un "recorte pegado"
- [ ] Encaja con la estética del feed de Instagram (`05-ESTETICA-POSTS.md`)
- [ ] Cumple con la guía de estilo (`02-GUIA-ESTILO.md`)

---

## Referencia Cruzada

- **Guía de estilo y tono:** `02-GUIA-ESTILO.md`
- **Estética de posts Instagram:** `05-ESTETICA-POSTS.md`
- **Fotos originales de DJs:** `/Users/christianpujol/Desktop/ELEVN DJS/foto djs/`
