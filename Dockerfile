FROM python:3.9.18-alpine3.18

RUN apk add --no-cache build-base postgresql-dev gcc python3-dev musl-dev npm

WORKDIR /var/www

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir psycopg2

COPY . .
RUN cd react-vite && npm ci --no-audit --no-fund && npm run build

# Flask CLI needs the application module at runtime for migrations. Render
# injects DATABASE_URL, SCHEMA, SECRET_KEY, PORT, and other secrets only when
# the container starts; none of them are required or baked into image layers.
ENV FLASK_APP=app

# Database migrations belong to runtime/deploy, where Render's private
# Postgres hostname is resolvable. Production seeding is deliberately not
# automatic because `flask seed all` truncates production user data first.
CMD ["/bin/sh", "-c", "flask db upgrade && exec gunicorn app:app --bind 0.0.0.0:${PORT:-8000}"]
