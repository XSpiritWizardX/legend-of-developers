FROM python:3.9.18-alpine3.18

RUN apk add --no-cache build-base postgresql-dev gcc python3-dev musl-dev npm

WORKDIR /var/www

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt && pip install --no-cache-dir psycopg2

COPY . .
RUN cd react-vite && npm ci --no-audit --no-fund && npm run build

# Render supplies DATABASE_URL and the other production environment variables
# when the container starts, not while the Docker image is being built.
ENV FLASK_APP=app

# Run Alembic against the production database at runtime. Do not seed
# automatically here because production seed commands may overwrite user data.
CMD ["/bin/sh", "-c", "flask db upgrade && exec gunicorn app:app --bind 0.0.0.0:${PORT:-8000}"]
