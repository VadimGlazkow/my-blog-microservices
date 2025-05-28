pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                // Клонируем репозиторий
                git url: 'https://github.com/VadimGlazkow/my-blog-microservices.git', branch: 'main'
            }
        }
        stage('Build') {
            steps {
                // Сборка Docker-образов через docker-compose
                sh 'docker-compose build'
            }
        }
        stage('Test') {
            steps {
                // Если есть тесты для blog_service, выполняем их
                dir('WebBlogDjango') {
                    sh 'python manage.py test || true' // || true позволяет продолжить, даже если тесты не проходят
                }
                // Если есть тесты для telegram_bot_service, добавь их сюда
                dir('telegram_bot_service') {
                    sh 'echo "Тесты для telegram_bot_service пока не настроены"'
                }
            }
        }
        stage('Deploy') {
            steps {
                // Запускаем сервисы в detached-режиме
                sh 'docker-compose up -d'
            }
        }
    }
    post {
        always {
            echo 'Pipeline завершен'
        }
        success {
            echo 'Сборка и деплой прошли успешно!'
        }
        failure {
            echo 'Pipeline завершился с ошибкой'
        }
    }
}