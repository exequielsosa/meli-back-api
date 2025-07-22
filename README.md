# Backend API - Challenge Mercado Libre

Este proyecto es el backend mockeado para alimentar el buscador de productos estilo Mercado Libre.

## 🚀 Tecnologías utilizadas

- [Node.js](https://nodejs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Express](https://expressjs.com/)
- Lectura de archivos locales (`fs`)
- Tipado y lógica de filtrado

## 📁 Estructura del proyecto

```
MELI-BACK-API/
├── mocks/                      # Archivos mockeados (items, descriptions, categories, search)
├── src/
│   ├── controllers/
│   │   └── itemsController.ts  # Controlador con lógica de respuesta para endpoints
│   ├── routes/
│   │   └── items.ts            # Definición de rutas: /api/items y /api/items/:id
│   ├── services/
│   │   └── itemsService.ts     # Lógica principal de negocio: filtrado, parsing, etc.
│   ├── types/
│   │   └── itemsServiceTypes.ts # Tipos TypeScript para los datos y respuestas
│   ├── utils/
│   │   ├── file.ts             # Funciones para leer JSON y chequear existencia
│   │   ├── normalize.ts        # Función para normalizar strings (acentos, mayúsculas, etc.)
│   │   └── price.ts            # Función para parsear precio en amount + decimals
│   ├── app.ts                  # Configuración principal de Express y middlewares
│   └── index.ts               # Entry point para levantar el servidor
├── .gitignore
├── package.json
├── tsconfig.json
```


## 📌 Endpoints

### 🔍 `/api/items?search=camisa`

- Devuelve una lista de productos coincidentes con el query.
- Usa lógica de normalización y tokenización para filtrar por título, marca, modelo o atributos.

### 📦 `/api/items/:id`

- Devuelve el detalle completo de un producto por su ID.
- Incluye imágenes, descripción, vendedor, atributos y garantía.

## ▶️ Cómo ejecutarlo

1. Cloná el proyecto:

```bash
git clone https://github.com/exequielsosa/meli-back-api.git
cd meli-back-api
```

2. Instalá dependencias:
```
npm install
```

3. Ejecutá el servidor:
```
npm run dev
```

Por defecto, corre en http://localhost:3001.

🧠 Buenas prácticas aplicadas
- Separación por responsabilidad: lógica, tipos y utilidades.
- Lectura de archivos optimizada y validaciones de existencia.
- Tipado completo con TypeScript.
- Reutilización de helpers (normalize, formatPrice, etc.)

📌 Nota
Este backend está pensado como mock local y no realiza consultas externas reales a la API de Mercado Libre.

