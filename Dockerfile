# ====================================================================
# Frontend Aula Virtual UNITEPC — Vue 3 + Quasar 2 + Vite
# Multi-stage con 2 targets:
#   dev  -> npm run dev (Vite HMR, puerto 9000)
#   prod -> build + nginx (estaticos + proxy /api, puerto 80)
# ====================================================================

# -------- Stage: base (instala deps una sola vez) --------
# --ignore-scripts: el postinstall (quasar prepare) necesita archivos del proyecto
# que solo existen en los stages dev/builder. Ahi se corre manualmente.
FROM node:22-alpine AS base
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install --ignore-scripts

# -------- Stage: dev --------
FROM base AS dev
WORKDIR /app
COPY . .
RUN npx quasar prepare
EXPOSE 9000
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0", "--port", "9000"]

# -------- Stage: builder (compila para produccion) --------
FROM base AS builder
WORKDIR /app
COPY . .
RUN npx quasar prepare
# En produccion el front llama a /api (relativa) y el nginx del front lo proxyea al back
ENV VITE_API_BASE_URL=/api
RUN npm run build

# -------- Stage: prod (nginx sirve estaticos + proxy /api) --------
FROM nginx:1.27-alpine AS prod
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist/spa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
