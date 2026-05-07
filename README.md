# GitHub Projects Dashboard

Una web pública y estática para mostrar, ordenar y explorar todos los repositorios públicos de un perfil de GitHub desde un único lugar.

## Idea general

Este proyecto nace como un índice personal de proyectos públicos en GitHub. La idea es tener una sola web que funcione como dashboard, portfolio técnico y panel de mantenimiento para todos los repositorios creados por un usuario.

En lugar de revisar manualmente cada repo, entrar uno por uno, buscar cuál tiene demo pública, cuál está actualizado o cuál tiene descripción, esta web centraliza esa información y la presenta de forma más clara.

La primera versión se enfocará en algo simple, útil y fácil de mantener: una página estática que consume un archivo JSON con los repositorios públicos y los muestra en formato dashboard.

Más adelante, el proyecto podrá crecer con procesadores automáticos, estadísticas, agrupaciones, reportes y generación de datos mediante GitHub Actions.

## Objetivo

Crear una web pública que permita ver todos los repositorios públicos de un usuario de GitHub en un único lugar, con una interfaz más cómoda, legible y útil que el listado estándar de GitHub.

El dashboard deberá ayudar a responder preguntas como:

* ¿Qué proyectos tengo publicados?
* ¿Cuáles tienen web o demo pública?
* ¿Cuáles no tienen web pública todavía?
* ¿Qué repos fueron actualizados recientemente?
* ¿Qué tecnologías uso más?
* ¿Qué proyectos podrían destacarse como portfolio?
* ¿Qué repos necesitan mantenimiento?
* ¿Cuáles tienen descripción, topics o homepage incompletos?

## Beneficios

* Ver todos los proyectos juntos.
* Leer la información de forma más clara.
* Mantener el portfolio más fácilmente.
* Detectar repos incompletos o desactualizados.
* Actualizar datos desde una sola fuente.
* Separar la presentación visual de los datos.
* Preparar el camino para automatizaciones futuras.

## Enfoque técnico

La estrategia será construir una web estática que lea datos desde archivos JSON.

En la fase inicial, el JSON puede generarse manualmente o a partir de una llamada a la API pública de GitHub. Más adelante, GitHub Actions podrá encargarse de actualizar esos JSON automáticamente usando Node.js.

Flujo general esperado:

```txt
GitHub API -> JSON local -> JavaScript en el navegador -> dashboard web
```

Flujo futuro automatizado:

```txt
GitHub API -> GitHub Actions -> procesadores Node.js -> JSON optimizado -> dashboard web
```

## Fuente de datos

La fuente principal serán los repositorios públicos del usuario en GitHub.

Para obtenerlos, se puede usar la API de GitHub. Por ejemplo:

```txt
https://api.github.com/users/USUARIO/repos?type=owner&sort=updated&direction=desc&per_page=100
```

También podría usarse una búsqueda como:

```txt
https://api.github.com/search/repositories?q=user:USUARIO&sort=updated&order=desc
```

Sin embargo, para este proyecto conviene empezar con el endpoint de repositorios del usuario, porque es más directo para listar repos públicos propios.

## Fase 1: MVP

La primera fase busca crear una versión mínima pero funcional.

El objetivo no es automatizar todo desde el primer día, sino tener una base sólida para mostrar los repositorios en una web simple, clara y extensible.

### Alcance de la fase 1

La fase 1 incluirá:

* Una página `index.html`.
* Estilos propios en CSS.
* JavaScript para cargar y renderizar datos.
* Un archivo JSON con repositorios.
* Tarjetas de proyectos.
* Buscador por nombre o descripción.
* Filtros básicos.
* Ordenamiento básico.
* Diferenciación entre repos con web pública y sin web pública.
* Links al repo y, cuando exista, a la demo o web pública.

### No incluido todavía en fase 1

Por ahora no se incluirá:

* GitHub Actions.
* Procesadores automáticos en Node.js.
* Estadísticas avanzadas.
* Gráficos.
* Lectura de README o package.json.
* Detección automática compleja de demos.
* Sistema de scoring de proyectos.
* Dashboard de mantenimiento avanzado.

Esas funcionalidades quedan preparadas para fases futuras.

## Estructura inicial del proyecto

```txt
/
├── index.html
├── README.md
├── data/
│   └── repos.json
└── assets/
    ├── css/
    │   └── styles.css
    └── js/
        └── app.js
```

## Descripción de archivos

### `index.html`

Será la página principal del dashboard.

Contendrá la estructura base de la interfaz:

* Encabezado del proyecto.
* Resumen de cantidad de repos.
* Controles de búsqueda y filtros.
* Contenedor donde se renderizan las tarjetas.
* Referencias a CSS y JavaScript.

### `assets/css/styles.css`

Contendrá los estilos visuales del dashboard.

La idea es lograr una estética simple, legible y moderna, sin depender todavía de frameworks externos.

### `assets/js/app.js`

Será el archivo encargado de:

* Leer `data/repos.json`.
* Guardar el estado de búsqueda, filtros y orden.
* Renderizar las tarjetas de repositorios.
* Calcular datos simples para la interfaz.
* Mostrar mensajes de error si el JSON no carga.

### `data/repos.json`

Será el archivo de datos inicial.

En fase 1 puede ser generado manualmente, copiado desde la API de GitHub o armado con una pequeña selección de repos.

Más adelante, este archivo será generado automáticamente.

## Modelo inicial de datos

Cada repositorio puede representarse con una estructura como esta:

```json
{
  "name": "nombre-del-repo",
  "description": "Descripción breve del proyecto",
  "html_url": "https://github.com/usuario/nombre-del-repo",
  "homepage": "https://usuario.github.io/nombre-del-repo/",
  "language": "JavaScript",
  "topics": ["frontend", "portfolio"],
  "stargazers_count": 0,
  "forks_count": 0,
  "created_at": "2024-01-01T00:00:00Z",
  "updated_at": "2024-01-10T00:00:00Z",
  "pushed_at": "2024-01-10T00:00:00Z",
  "archived": false,
  "fork": false
}
```

En fase 1 podemos usar los nombres originales que devuelve GitHub para evitar transformar demasiado los datos.

## Criterio para detectar una web pública

En fase 1, se considerará que un repo tiene web pública si el campo `homepage` existe y no está vacío.

Ejemplo:

```js
const hasPublicWeb = repo.homepage && repo.homepage.trim() !== "";
```

Más adelante se podrá mejorar esta detección usando:

* GitHub Pages.
* Archivos `index.html`.
* Configuración de frameworks.
* Topics como `github-pages`, `website`, `demo` o `portfolio`.
* Overrides manuales.

## Interfaz deseada para fase 1

La interfaz inicial debería tener:

### Encabezado

Un título claro, por ejemplo:

```txt
Mis proyectos públicos en GitHub
```

Y una descripción breve:

```txt
Un dashboard para explorar mis repositorios, demos públicas y proyectos en desarrollo.
```

### Resumen

Pequeños indicadores con datos básicos:

* Total de repositorios.
* Repos con web pública.
* Repos sin web pública.
* Última actualización detectada.

### Controles

Controles simples:

* Buscador de texto.
* Filtro por todos / con web / sin web.
* Filtro por lenguaje.
* Orden por actualizado, nombre o fecha de creación.

### Tarjetas

Cada repo debería mostrarse como una tarjeta con:

* Nombre.
* Descripción.
* Lenguaje principal.
* Topics.
* Fecha de última actualización.
* Link al repositorio.
* Link a la web pública si existe.
* Indicador visual de si tiene demo o no.

## Filosofía del proyecto

Este proyecto debe mantenerse simple y útil.

La prioridad es que sea fácil de entender, fácil de modificar y fácil de extender.

No se busca crear una aplicación compleja desde el principio. Se busca crear una base limpia sobre la cual puedan agregarse automatizaciones y estadísticas sin romper lo anterior.

Principios:

* Primero datos claros.
* Después visualización.
* Después automatización.
* Después estadísticas.
* Después inteligencia de mantenimiento.

## Fases futuras

### Fase 2: Automatización de datos

Agregar scripts en Node.js para consultar la API de GitHub y generar archivos JSON.

Posibles scripts:

```txt
processors/fetch-repos.js
processors/enrich-repos.js
processors/build-stats.js
```

### Fase 3: GitHub Actions

Configurar un workflow para actualizar los datos automáticamente.

El workflow podría correr:

* Manualmente.
* Una vez por día.
* Cada vez que se haga push al repo.

### Fase 4: Estadísticas

Generar archivos como:

```txt
data/stats.json
data/languages.json
data/featured.json
```

Y mostrar:

* Lenguajes más usados.
* Repos más activos.
* Repos con más estrellas.
* Repos con demo pública.
* Timeline de actividad.

### Fase 5: Panel de mantenimiento

Agregar indicadores para detectar:

* Repos sin descripción.
* Repos sin homepage.
* Repos sin topics.
* Repos archivados.
* Repos abandonados.
* Repos candidatos a destacar.

## Posible evolución del proyecto

El dashboard puede convertirse en una herramienta personal de curaduría de proyectos.

No solo mostraría qué existe, sino también qué falta mejorar.

Ejemplos:

* “Estos repos tienen web pública pero no tienen descripción”.
* “Estos repos parecen proyectos web pero no tienen homepage configurada”.
* “Estos proyectos fueron actualizados recientemente”.
* “Estos repos podrían destacarse en el portfolio”.
* “Estos repos están inactivos hace mucho tiempo”.

## Primeros pasos de implementación

1. Crear la estructura de carpetas.
2. Crear `index.html`.
3. Crear `assets/css/styles.css`.
4. Crear `assets/js/app.js`.
5. Crear `data/repos.json` con datos de prueba.
6. Renderizar tarjetas desde el JSON.
7. Agregar buscador.
8. Agregar filtros básicos.
9. Agregar ordenamiento.
10. Probar la web en local.
11. Publicar en GitHub Pages.

## Estado actual

Proyecto en fase inicial.

Estamos comenzando por la fase 1: una web estática simple que muestre repositorios públicos desde un archivo JSON.

## Licencia

Pendiente de definir.

## Autor

Proyecto creado para organizar y visualizar repositorios públicos de GitHub desde una única interfaz web.
