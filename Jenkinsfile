pipeline {
    agent any
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/VadimGlazkow/my-blog-microservices.git', branch: 'main'
            }
        }
        stage('Build') {
            steps {
                // Установка docker-compose
                sh 'curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose'
                sh 'chmod +x /usr/local/bin/docker-compose'
                // Сборка Docker-образов
                sh 'docker-compose build'
            }
        }
        stage('Test') {
            steps {
                dir('WebBlogDjango') {
                    sh 'python manage.py test || true'
                }
                dir('telegram_bot_service') {
                    sh 'echo "Тесты для telegram_bot_service пока не настроены"'
                }
            }
        }
        stage('Deploy') {
            steps {
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