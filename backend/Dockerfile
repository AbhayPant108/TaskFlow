# Use official Python runtime as base image
FROM python:3.12-slim

# Set working directory inside the container
WORKDIR /app/backend

# Prevent Python from writing .pyc files and enable unbuffered output for logs
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all project files into the container
COPY . .

# DO NOT use EXPOSE 8000. Render completely ignores EXPOSE 
# and automatically handles its own private container port mapping.

# Run migrations, collect static files, and start Gunicorn at runtime.
# IMPORTANT: Replace "your_project_name" with the exact name of the folder 
# containing your wsgi.py and settings.py files.
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && gunicorn apis.wsgi:application --bind 0.0.0.0:$PORT"]
