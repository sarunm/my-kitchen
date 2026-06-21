pipeline {
  agent any

  environment {
    DOCKER_REGISTRY = 'docker.io'
    DOCKER_USERNAME = credentials('docker-username')
    DOCKER_PASSWORD = credentials('docker-password')
    HOME_SERVER = '192.168.1.131'
    PI_SERVER = credentials('pi-server-ip')
  }

  stages {
    stage('Clone') {
      steps {
        checkout scm
      }
    }

    stage('Build Docker Images') {
      steps {
        script {
          sh '''
            docker build -t kitchen-backend:latest ./backend
            docker build -t kitchen-frontend:latest ./frontend
            docker build -t kitchen-pi-dashboard:latest ./pi-dashboard
          '''
        }
      }
    }

    stage('Push to Registry') {
      when {
        branch 'main'
      }
      steps {
        script {
          sh '''
            echo $DOCKER_PASSWORD | docker login -u $DOCKER_USERNAME --password-stdin
            docker tag kitchen-backend:latest ${DOCKER_USERNAME}/kitchen-backend:latest
            docker tag kitchen-frontend:latest ${DOCKER_USERNAME}/kitchen-frontend:latest
            docker tag kitchen-pi-dashboard:latest ${DOCKER_USERNAME}/kitchen-pi-dashboard:latest
            docker push ${DOCKER_USERNAME}/kitchen-backend:latest
            docker push ${DOCKER_USERNAME}/kitchen-frontend:latest
            docker push ${DOCKER_USERNAME}/kitchen-pi-dashboard:latest
          '''
        }
      }
    }

    stage('Deploy Home Server') {
      when {
        branch 'main'
      }
      steps {
        script {
          sh '''
            ssh -i /home/jenkins/.ssh/home-server root@${HOME_SERVER} '
              cd /opt/kitchen && \
              git pull origin main && \
              docker-compose down && \
              docker-compose up -d && \
              docker-compose logs
            '
          '''
        }
      }
    }

    stage('Deploy Raspberry Pi') {
      when {
        branch 'main'
      }
      steps {
        script {
          sh '''
            ssh -i /home/jenkins/.ssh/pi pi@${PI_SERVER} '
              cd /home/pi/kitchen && \
              git pull origin main && \
              npm --prefix pi-dashboard install && \
              npm --prefix pi-dashboard run build && \
              systemctl restart kitchen-pi-dashboard
            '
          '''
        }
      }
    }
  }

  post {
    always {
      cleanWs()
    }
    success {
      echo 'Deployment successful!'
    }
    failure {
      echo 'Deployment failed!'
    }
  }
}
