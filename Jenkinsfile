pipeline {
    agent any

    environment {
        TELEGRAM_BOT_TOKEN = credentials('telegram-token')
        TELEGRAM_CHAT_ID = credentials('telegram-chat-id')
    }

    stages {
        stage('Build') {
            steps {
                checkout scm // вот это важный момент!
                sh 'docker-compose build'
            }
        }

        stage('Test') {
            steps {
                sh 'docker-compose run --rm blog_service pytest'
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
        failure {
            echo 'Pipeline завершился с ошибкой'
        }
    }
}
