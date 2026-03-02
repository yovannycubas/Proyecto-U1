# ✦ TaskFlow – Gestión de Tareas en la Nube (React + Supabase)

<div align="center">
  <img src="https://img.shields.io/badge/React-18-blue?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Vite-6-purple?style=for-the-badge&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Supabase-Auth%20%26%20DB-green?style=for-the-badge&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/User%20Privacy-RLS%20Active-brightgreen?style=for-the-badge&logo=postgresql" alt="Security" />
</div>

---

## 🚀 Características Principales

- **Sincronización Total**: Tus tareas se guardan en la nube y se sincronizan en tiempo real entre todos tus dispositivos.
- **Autenticación Completa**: Registro/Login con email y soporte para **Google** y **GitHub**.
- **Privacidad de Datos**: Gracias a *Row Level Security* (RLS), solo tú puedes ver y gestionar tus tareas.
- **Buscador & Filtros**: Encuentra cualquier tarea al instante con resaltado de texto y filtrado por estado.
- **Diseño Premium**: Interfaz oscura con estética *glassmorphism* y micro-animaciones.
- **Totalmente Responsivo**: Experiencia fluida tanto en computadoras como en dispositivos móviles.

---

## 🛠️ Requisitos previos

- Node.js v18 o superior.
- Una cuenta en [Supabase](https://supabase.com).

---

## ⚙️ Instalación y Configuración

### 1. Clonar e Instalar
```bash
npm install
```

### 2. Configurar Supabase (.env)
1. Crea un proyecto en Supabase.
2. Copia el archivo `.env.example` y renómbralo a `.env`.
3. Pega tus credenciales del panel de Supabase:
```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-anon-key-aqui
```

### 3. Configurar Base de Datos (SQL Editor)
Ejecuta esto en el SQL Editor de Supabase para crear la tabla con políticas de seguridad:

```sql
-- Crear tabla
CREATE TABLE tasks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  completed   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Habilitar RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Políticas de Usuario
CREATE POLICY "Users manage their own tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Activar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
```

---

## 🏃 Cómo Ejecutar

```bash
npm run dev
```
La aplicación se abrirá en [http://localhost:5173](http://localhost:5173).

> **Nota:** Para que OAuth (Google/GitHub) funcione correctamente, la aplicación debe estar corriendo en un servidor HTTP (como el de Vite) y no abriendo el archivo `index.html` directamente.

---

## 📁 Estructura del Proyecto

```
Proyecto U1/
├── src/
│   ├── components/     ← Componentes React (Auth, Cards, Modals, etc.)
│   ├── lib/            ← Cliente Supabase (supabase.js)
│   ├── App.jsx         ← Lógica principal y estado global
│   ├── main.jsx        ← Punto de entrada React
│   └── index.css       ← Estilos premium y responsive
├── .env                ← Credenciales (no subir a Git)
├── index.html          ← Plantilla base de Vite
└── package.json        ← Scripts y dependencias
```
