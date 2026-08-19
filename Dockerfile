FROM python:3.9.18-alpine3.18

RUN apk add --quiet build-base
RUN apk add --quiet postgresql-dev gcc python3-dev musl-dev npm

ARG FLASK_APP
ARG FLASK_ENV
ARG DATABASE_URL
ARG BUILD_DATABASE_URL
ARG SCHEMA
ARG SECRET_KEY

WORKDIR /var/www

COPY requirements.txt .

RUN pip install -r requirements.txt
RUN pip install psycopg2

COPY . .

RUN cd react-vite && npm ci --no-audit --no-fund && npm run build

# Keep database setup inside the Docker build. Render exposes service env vars
# as Docker build args, but its internal Postgres hostname is not resolvable in
# the image builder. Point BUILD_DATABASE_URL at the database's External URL.
# DATABASE_URL remains the normal internal/runtime connection string. Plain CI
# builds fall back to local SQLite so the image remains buildable without Render.
RUN DATABASE_URL="${BUILD_DATABASE_URL:-${DATABASE_URL:-sqlite:///dev.db}}" flask db upgrade
RUN DATABASE_URL="${BUILD_DATABASE_URL:-${DATABASE_URL:-sqlite:///dev.db}}" flask seed all
CMD gunicorn app:app
