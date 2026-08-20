FROM python:3.9.18-alpine3.18

RUN apk add --quiet build-base postgresql-dev gcc python3-dev musl-dev npm

WORKDIR /var/www

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir psycopg2

COPY . .
RUN cd react-vite \
    && npm ci --no-audit --no-fund \
    && npm run build \
    && rm -rf node_modules

# Image creation must never mutate a live database. Apply schema migrations
# only when the service starts with its real runtime environment, and never
# seed shared demo credentials in production.
CMD ["sh", "-c", "python -m flask --app app db upgrade && exec gunicorn --bind 0.0.0.0:${PORT:-8000} app:app"]
