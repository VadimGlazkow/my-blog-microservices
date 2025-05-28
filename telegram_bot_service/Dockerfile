# Используем официальный легкий образ Python
FROM python:3.11-slim

# Рабочая директория в контейнере
WORKDIR /app

# Сначала копируем ТОЛЬКО requirements.txt (для кэширования)
COPY requirements.txt .

# Устанавливаем зависимости
RUN pip install --no-cache-dir -r requirements.txt

# Копируем ВЕСЬ проект (кроме указанного в .dockerignore)
COPY . .

# Запускаем сервер
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]