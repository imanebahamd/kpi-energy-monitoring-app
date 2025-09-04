FROM openjdk:23-jdk-slim

COPY target/kpi-energy-backend-0.0.1-SNAPSHOT.jar /app/kpi-energy-backend.jar

EXPOSE 8081

ENTRYPOINT ["java", "-jar", "/app/kpi-energy-backend.jar"]
