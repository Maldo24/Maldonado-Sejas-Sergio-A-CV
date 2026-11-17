# Sergio Maldonado · CV

Sitio estático en español (`index.html`) e inglés (`en/index.html`). No usa frameworks ni dependencias; se puede abrir directamente desde el disco.

## Agregar o editar proyectos

Los proyectos viven en [`data/projects.json`](data/projects.json). Las dos páginas se generan a partir de ese archivo, así que **no hace falta tocar el HTML**.

### Desde el navegador (Pages CMS)

1. Entra a <https://app.pagescms.org> e inicia sesión con GitHub.
2. Instala la app de Pages CMS en tu cuenta y dale acceso a este repositorio.
3. Abre el repo → **Proyectos**. Agrega, edita, reordena o borra proyectos con el formulario y guarda.
4. Al guardar, Pages CMS hace un commit. La GitHub Action **Actualizar proyectos** regenera el HTML y hace otro commit; en un par de minutos GitHub Pages publica el cambio.

### A mano

```bash
# 1. Edita data/projects.json
# 2. Regenera el HTML
node scripts/build.mjs
```

### Campos

| Campo | Para qué sirve |
| --- | --- |
| `name` | Nombre del proyecto (obligatorio). |
| `id` | Opcional. Ancla del enlace (`#id`); si falta, se genera desde el nombre. |
| `year` | Año. |
| `featured` | `true` → sale arriba con lámina y ficha. `false` → va a la tabla «Otros proyectos». |
| `live` | `true` → marcado como «En línea» (●). `false` → «Sin despliegue público» (○). |
| `url`, `repo` | Enlaces al sitio y al código (opcionales). |
| `image` | Lámina 8:5 (opcional). Sin imagen se dibuja una de curvas de nivel. |
| `stack` | Lista de tecnologías. |
| `es`, `en` | Textos por idioma: `summary`, `context`, `roleTitle`, `role`, `caption`, `alt`. En `en` también `name` y `stack` si cambian. Lo que falte en inglés se muestra en español. |

El orden del archivo es el orden en la página. El título de la sección («Cuatro proyectos en línea») se ajusta solo según cuántos destacados haya.

> El script solo reescribe lo que está entre los comentarios `<!-- proyectos:… -->` del HTML. No borres esos comentarios.

## Ver en local

Abre `index.html` en el navegador, o sirve la carpeta (`python3 -m http.server`).
