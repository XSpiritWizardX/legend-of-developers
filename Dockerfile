FROM python:3.9.18-alpine3.18

RUN apk add --quiet build-base
RUN apk add --quiet postgresql-dev gcc python3-dev musl-dev npm

ARG FLASK_APP
ARG FLASK_ENV

WORKDIR /var/www

COPY requirements.txt .

RUN pip install -r requirements.txt
RUN pip install psycopg2

COPY . .

RUN cd react-vite && npm ci --no-audit --no-fund && npm run build

# Database migrations and seed commands must not run while the Docker image is
# being built. Build environments do not have reliable access to the runtime
# database, and image creation should remain independent of external services.
# Run migrations intentionally as a release/admin operation when needed.
CMD gunicorn app:app
