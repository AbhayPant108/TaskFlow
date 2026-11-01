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


# 2. DO NOT use EXPOSE 8000. Render completely ignores EXPOSE 
# and automatically maps its dynamic port system.

# 3. Run Gunicorn instead of runserver, binding dynamically to Render's $PORT
# IMPORTANT: Replace "your_project_name" with the exact name of the folder 
# containing your wsgi.py file (usually the folder with settings.py).


# 2. REPLACE your final CMD line at the very bottom with this combined line:
CMD ["sh", "-c", "python manage.py migrate --noinput && python manage.py collectstatic --noinput && gunicorn apis.wsgi:application --bind 0.0.0.0:$PORT"]

