pipeline {
    agent any
    options {
        skipDefaultCheckout() // Отключаем автоматический checkout
    }
    environment {
        TELEGRAM_BOT_TOKEN = credentials('telegram-token')
        TELEGRAM_CHAT_ID = credentials('telegram-chat-id')
    }
    stages {
        stage('Clean Workspace') {
            steps {
                cleanWs()
            }
        }
        stage('Checkout SCM') {
            steps {
                sh 'whoami'
                sh 'ls -la /var/jenkins_home/workspace/blog-ci-cd'
                sh 'git status || echo "Not a git repository"'
                sh 'rm -rf *'
                sh 'git clone https://github.com/VadimGlazkow/my-blog-microservices.git .'
                sh 'git checkout main'
            }
        }
        stage('Build') {
            steps {
                sh 'docker-compose build'
            }
        }
        stage('Prepare Network') {
            steps {
                // Останавливаем и удаляем все контейнеры, чтобы освободить сеть
                sh 'docker-compose down || true'
                // Удаляем старую сеть, игнорируя ошибки, если она уже удалена
                sh 'docker network rm blog-ci-cd_default || true'
                // Перестраиваем и запускаем сервисы в фоновом режиме для создания новой сети
                sh 'docker-compose up -d'
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
            echo 'Pipeline завершён'
        }
        failure {
            echo 'Pipeline завершился с ошибкой'
        }
    }
}