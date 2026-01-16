# Varylo SaaS 🚀

![Varylo Banner](https://via.placeholder.com/1200x300?text=Varylo+SaaS+Platform)

> **Plataforma omnicanal para gestión de clientes y automatización con IA.**
> Centraliza WhatsApp, Instagram y más en un solo lugar.

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-teal?style=for-the-badge&logo=prisma)](https://www.prisma.io/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green?style=for-the-badge&logo=supabase)](https://supabase.com/)

---

## 🌟 Características Principales

### 🤖 Gestión de Agentes con IA
- **Creación y Edición**: Administra perfiles de agentes con roles personalizados.
- **Estado en Tiempo Real**: Activa o desactiva agentes con un solo clic.
- **Asignación Inteligente**: Distribución automática de conversaciones.

### 💬 Bandeja de Entrada Unificada
- **Multi-canal**: Conexión nativa con WhatsApp Business API.
- **Chat en Vivo**: Interfaz reactiva para respuestas inmediatas.
- **Historial Completo**: Almacenamiento seguro de todas las interacciones.

### 🌐 Internacionalización (i18n)
- **Soporte Nativo**: Disponible totalmente en Español (ES) e Inglés (EN).
- **Detección Automática**: Redirección basada en la preferencia del navegador.

### 📊 Dashboard Analítico
- **Métricas Clave**: Visualización de conversaciones totales, agentes activos y canales conectados.
- **Datos Reales**: Integración directa con base de datos PostgreSQL.

---

## 🛠️ Stack Tecnológico

Este proyecto utiliza las tecnologías más modernas para garantizar rendimiento y escalabilidad:

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router, Server Components)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Base de Datos**: [PostgreSQL](https://www.postgresql.org/) (vía Supabase)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/) y [Shadcn/ui](https://ui.shadcn.com/)
- **Autenticación**: [NextAuth.js v5](https://authjs.dev/)

---

## 🚀 Instalación y Despliegue

Sigue estos pasos para levantar el proyecto en tu entorno local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/VictorSandovalDev/Varylo.git
cd Varylo
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
AUTH_SECRET="tu_secreto_super_seguro"
```

### 4. Sincronizar base de datos
```bash
npx prisma db push
```

### 5. Iniciar servidor de desarrollo
```bash
npm run dev
```

Visita `http://localhost:3000` para ver la aplicación.

---

## 📂 Estructura del Proyecto

```
src/
├── app/                  # Rutas y páginas (App Router)
│   ├── [lang]/           # Rutas internacionalizadas
│   │   ├── (auth)/       # Login y Registro
│   │   └── (company)/    # Panel de administración
├── components/           # Componentes reutilizables (UI)
├── lib/                  # Utilidades y configuración (Prisma, Auth)
├── dictionaries/         # Archivos de traducción (ES/EN)
└── styles/               # Estilos globales
```

---

## 🤝 Contribución

¡Las contribuciones son bienvenidas! Por favor, abre un *issue* o envía un *pull request* para mejoras.

1. Haz un Fork del proyecto
2. Crea tu rama de funcionalidad (`git checkout -b feature/AmazingFeature`)
3. Haz Commit de tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

---

<p align="center">
  Hecho con ❤️ por Víctor Sandoval
</p>
