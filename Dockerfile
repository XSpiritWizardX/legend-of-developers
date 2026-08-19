FROM python:3.9.18-alpine3.18

RUN apk add --quiet build-base

RUN apk add --quiet postgresql-dev gcc python3-dev musl-dev npm

ARG FLASK_APP
ARG FLASK_ENV
ARG DATABASE_URL
ARG SCHEMA
ARG SECRET_KEY

WORKDIR /var/www

COPY requirements.txt .

RUN pip install -r requirements.txt
RUN pip install psycopg2

COPY . .

RUN cd react-vite && npm ci --no-audit --no-fund && npm run build

RUN flask db upgrade
RUN flask seed all
CMD gunicorn app:app
