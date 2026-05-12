# build stage
FROM node:18-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build -- --configuration production

# production stage
FROM nginx:stable-alpine
COPY --from=build /app/dist/client /usr/share/nginx/html
# optional: copy custom nginx config for SPA fallback
# COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
