# Étape 1 : builder l'application Angular
FROM node:22 AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build --prod

# Étape 2 : servir l'application avec Nginx
FROM nginx:alpine
COPY --from=build /app/dist/kpi-energy-frontend /usr/share/nginx/html

# Copier la config Nginx personnalisée si nécessaire
# COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 4200
CMD ["nginx", "-g", "daemon off;"]
