#!/bin/bash
echo "🧹 Deteniendo TODOS los procesos de Node y Prisma..."
pkill -f "next-server" || true
pkill -f "next-dev" || true
pkill -f "prisma" || true
pkill -f "node" || true

echo "🗑️  Limpiando caché de Next.js..."
rm -rf .next
rm -rf node_modules/.cache

echo "🔄 Regenerando Cliente de Prisma..."
npx prisma generate

echo "✅ Iniciando servidor..."
npm run dev
