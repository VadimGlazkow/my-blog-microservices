# Используем официальный легкий образ Python
FROM python:3.11-slim

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем только requirements.txt для кэширования зависимостей
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь проект
COPY . .

# Выполняем миграции и собираем статические файлы
RUN python manage.py migrate
RUN python manage.py collectstatic --noinput

# Запускаем сервер с Daphne
# CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "WebBlogDjango.asgi:application"]

# CMD ["daphne", "WebBlogDjango.asgi:application"]

CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "WebBlogDjango.asgi:application"]