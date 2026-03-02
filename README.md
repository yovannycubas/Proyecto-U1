# ✦ TaskFlow – Gestión de Tareas

<p align="center">
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white"/>
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white"/>
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black"/>
  <img src="https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white"/>
</p>

<p align="center">
  Aplicación web de gestión de tareas con autenticación de usuarios, sincronización en la nube y actualizaciones en tiempo real.
</p>

---

## 📋 Características

- ✅ **Agregar tareas** – título y descripción obligatorios con validación
- ✏️ **Editar tareas** – modifica título y descripción en cualquier momento
- 🗑️ **Eliminar tareas** – con diálogo de confirmación
- ☑️ **Completar / reabrir** – alterna el estado con un checkbox visual
- 🎨 **Indicadores visuales** – colores y badges para pendiente vs. completada
- 🔍 **Búsqueda en tiempo real** – filtra por texto en título o descripción
- 🔽 **Filtros por estado** – Todas / Pendientes / Completadas
- ☁️ **Sincronización en la nube** – datos almacenados en Supabase (PostgreSQL)
- ⚡ **Tiempo real** – cambios reflejados instantáneamente vía Supabase Realtime
- 🔐 **Autenticación** – registro/login con email y contraseña
- 🌐 **OAuth** – inicio de sesión con Google y GitHub
- 🛡️ **Privacidad** – cada usuario solo accede a sus propias tareas (RLS)

---

## 🚀 Demo

> Abre `index.html` directamente en tu navegador o despliega en cualquier hosting estático (Vercel, Netlify, GitHub Pages).

---

## 🛠️ Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | HTML5, CSS3, JavaScript (Vanilla) |
| Base de datos | Supabase (PostgreSQL) |
| Autenticación | Supabase Auth (email + OAuth) |
| Tiempo real | Supabase Realtime |
| Seguridad | Row Level Security (RLS) |
| Fuente tipográfica | Google Fonts – Inter |

---

## 📂 Estructura del proyecto

```
Proyecto U1/
├── index.html       # Estructura de la interfaz (auth + tasks)
├── style.css        # Diseño premium oscuro con animaciones
├── app.js           # Lógica de la app + integración Supabase
└── README.md        # Este archivo
```

---

## ⚙️ Configuración de Supabase

### 1. Crear un proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Crea un nuevo proyecto
3. Copia tu **Project URL** y tu **Anon Key** desde *Settings → API*

### 2. Crear la tabla de tareas

Ejecuta el siguiente SQL en el **SQL Editor** de Supabase:

```sql
-- Tabla de tareas
CREATE TABLE tasks (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title       TEXT NOT NULL,
  description TEXT NOT NULL,
  completed   BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Habilitar Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Política: cada usuario solo ve y modifica sus propias tareas
CREATE POLICY "Users manage their own tasks"
  ON tasks FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Habilitar Realtime para la tabla tasks
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
```

### 3. Configurar proveedores OAuth

#### Google
1. Ve a *Authentication → Providers → Google* en tu dashboard de Supabase
2. Habilita el proveedor
3. Crea un proyecto en [Google Cloud Console](https://console.cloud.google.com/)
4. Obtén tu **Client ID** y **Client Secret**
5. Agrega la URL de callback de Supabase en Google: `https://<tu-proyecto>.supabase.co/auth/v1/callback`

#### GitHub
1. Ve a *Authentication → Providers → GitHub* en tu dashboard de Supabase
2. Habilita el proveedor
3. Regístrate una OAuth App en [GitHub Developer Settings](https://github.com/settings/developers)
4. URL de callback: `https://<tu-proyecto>.supabase.co/auth/v1/callback`
5. Copia el **Client ID** y **Client Secret** a Supabase

### 4. Configurar las credenciales en la app

Abre `app.js` y reemplaza las variables de configuración:

```javascript
const SUPABASE_URL  = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON = 'tu-anon-key-aqui';
```

---

## 🏃 Cómo usar la app

1. **Clona el repositorio:**
   ```bash
   git clone https://github.com/tu-usuario/Proyecto-U1.git
   cd Proyecto-U1
   ```

2. **Configura Supabase** siguiendo los pasos anteriores.

3. **Abre `index.html`** en tu navegador (no requiere servidor).

4. **Regístrate o inicia sesión** con email/contraseña, Google o GitHub.

5. **¡Gestiona tus tareas!** Todos los cambios se sincronizan automáticamente.

---

## 🔐 Seguridad

- **Row Level Security (RLS)**: los usuarios solo pueden leer/escribir sus propias tareas a nivel de base de datos, no solo a nivel de aplicación.
- **Sin acceso anónimo**: cualquier intento de acceder sin autenticación redirige al login.
- **OAuth seguro**: delegado completamente a Supabase Auth + proveedores externos (Google/GitHub).

---

## 📸 Capturas

> *Pantalla principal con lista de tareas, filtros y buscador*

---

## 📄 Licencia

MIT © 2026 – [Yovis Cubas](https://github.com/yovannycubas)
