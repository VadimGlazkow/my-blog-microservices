pipeline {
    agent any

    environment {
        TELEGRAM_BOT_TOKEN = 'your-token-here'
        TELEGRAM_CHAT_ID   = 'your-chat-id-here'
    }

    stages {
        stage('Checkout SCM') {
            steps {
                checkout scm
            }
        }

        // ❌ Удалили Clean Workspace, т.к. он всё ломает
        // Если нужна ручная очистка — делаем выборочно, не удаляя .yml и .git

        stage('Build') {
            steps {
                script {
                    sh 'ls -la' // для отладки: убедимся, что .yml на месте
                    sh 'docker-compose build'
                }
            }
        }

        stage('Prepare Network') {
            steps {
                echo 'Preparing network...'
            }
        }

        stage('Test') {
            steps {
                echo 'Running tests...'
            }
        }

        stage('Deploy') {
            steps {
                echo 'Deploying application...'
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
