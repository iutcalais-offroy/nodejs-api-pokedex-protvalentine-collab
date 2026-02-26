# 1. Étape de construction (Build)
FROM node:20-alpine AS builder

WORKDIR /app

# Copie des fichiers de configuration
COPY package*.json ./
COPY prisma ./prisma/

# Installation des dépendances
RUN npm install

# 2. Étape d'exécution (Production)
FROM node:20-alpine AS runner

WORKDIR /app

# Variables d'environnement par défaut
ENV NODE_ENV=production
ENV PORT=3001

ENV DATABASE_URL="postgresql://tcg_user:tcg_password@localhost:5433/tcg_database"
EXPOSE 3001
