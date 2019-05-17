ARG IMAGE=nginx:alpine
FROM $IMAGE

MAINTAINER Scale Developers "https://github.com/ngageoint/scale-ui"

LABEL \
    RUN="docker run -d geoint/scale-ui" \
    SOURCE="https://github.com/ngageoint/scale-ui" \
    DESCRIPTION="UI for Scale processing framework for containerized algorithms"

RUN apk -U --no-cache add jq && chmod 777 /usr/share/nginx/html

ENV CONFIG_JSON=/usr/share/nginx/html/assets/appConfig.json
ENV NGINX_CONF=/etc/nginx/conf.d/default.conf
ENV API_BACKEND=http://scale-webserver.marathon.l4lb.thisdcos.directory:80/

COPY dist/developer /usr/share/nginx/html
COPY docker/nginx.conf ${NGINX_CONF}
COPY docker/nginx-template.conf /
COPY docker/docker-entrypoint.sh /
RUN chmod +x /docker-entrypoint.sh && chmod 777 ${CONFIG_JSON} 

ENTRYPOINT ["/docker-entrypoint.sh"]
CMD ["nginx", "-g", "daemon off;"]
