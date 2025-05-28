pipeline {
    agent any

    environment {
    TELEGRAM_BOT_TOKEN = 'your-real-token'
    TELEGRAM_CHAT_ID   = 'your-chat-id'
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }

        stage('Build') {
            steps {
                script {
                    sh 'docker-compose build'
                }
            }
        }

        stage('Prepare Network') {
            steps {
                echo 'Preparing network...'
                // Добавьте действия при необходимости
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
                // Добавьте тестовые команды, если есть
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application...'
                // Добавьте команды деплоя
            }
        }
    }

    post {
        success {
            echo '✅ Pipeline успешно завершён'
        }
        failure {
            echo '❌ Pipeline завершился с ошибкой'
        }
    }
}
