FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy website assets to nginx root
COPY . /usr/share/nginx/html

# Expose Cloud Run port
EXPOSE 8080

CMD ["nginx", "-g", "daemon off;"]
