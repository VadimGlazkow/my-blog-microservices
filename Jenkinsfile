pipeline {
    agent any

    options {
        skipDefaultCheckout(true)
    }

    stages {
        stage('Build') {
            steps {
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
}
