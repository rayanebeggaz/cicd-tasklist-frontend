pipeline {
    agent any

    environment {
        // Docker Hub image (namespace = Docker Hub account)
        IMAGE_NAME        = 'rayanebeggaz/tasklist-frontend'
        IMAGE_TAG         = "${env.BUILD_NUMBER}"
        SONAR_PROJECT_KEY = 'tasklist-frontend'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
        buildDiscarder(logRotator(numToKeepStr: '10'))
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Tests & Coverage') {
            steps {
                sh 'npm run test:coverage'
            }
            post {
                always {
                    // Publish the JUnit test report produced by Vitest
                    junit 'reports/junit.xml'
                }
            }
        }

        stage('SonarQube Analysis') {
            steps {
                script {
                    def scannerHome = tool 'SonarScanner'
                    withSonarQubeEnv('SonarQube') {
                        sh "${scannerHome}/bin/sonar-scanner"
                    }
                }
            }
        }

        stage('Quality Gate') {
            steps {
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: false
                }
            }
        }

        stage('Build') {
            steps {
                sh 'npm run build'
            }
        }

        stage('Docker Build') {
            steps {
                sh 'docker build -t $IMAGE_NAME:$IMAGE_TAG -t $IMAGE_NAME:latest .'
            }
        }

        stage('Security - Trivy scan') {
            steps {
                sh 'trivy image --no-progress --timeout 15m --severity HIGH,CRITICAL --exit-code 0 $IMAGE_NAME:$IMAGE_TAG | tee trivy-report.txt'
            }
        }

        stage('SBOM (SPDX)') {
            steps {
                sh 'trivy image --format spdx-json --output sbom-spdx.json $IMAGE_NAME:$IMAGE_TAG'
            }
            post {
                always {
                    archiveArtifacts artifacts: 'sbom-spdx.json,trivy-report.txt', fingerprint: true, allowEmptyArchive: true
                }
            }
        }

        stage('Push to Docker Hub') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-credentials',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS')]) {
                    sh '''
                        echo "$DOCKER_PASS" | docker login -u "$DOCKER_USER" --password-stdin
                        docker push $IMAGE_NAME:$IMAGE_TAG
                        docker push $IMAGE_NAME:latest
                        docker logout
                    '''
                }
            }
        }
    }

    post {
        always {
            sh 'docker image prune -f || true'
            cleanWs()
        }
    }
}
