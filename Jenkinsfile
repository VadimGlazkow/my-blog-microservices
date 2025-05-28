pipeline {
    agent any

    stages {
        stage('Clean up') {
            steps {
                dir("${env.WORKSPACE}") {
                    sh 'docker-compose down -v || true'
                }
            }
        }

        stage('Build') {
            steps {
                dir("${env.WORKSPACE}") {
                    sh 'docker-compose build'
                }
            }
        }

        stage('Test') {
            steps {
                dir("${env.WORKSPACE}") {
                    sh 'docker-compose run --rm blog_service pytest'
                }
            }
        }

        stage('Deploy') {
            steps {
                dir("${env.WORKSPACE}") {
                    sh 'docker-compose up -d'
                }
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
