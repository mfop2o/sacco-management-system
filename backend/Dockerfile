# Stage 1: Build
FROM eclipse-temurin:21-jdk-alpine AS build
WORKDIR /app

# Copy Gradle wrapper and build files first (for caching)
COPY gradlew settings.gradle build.gradle ./
COPY gradle/ gradle/
RUN chmod +x gradlew && ./gradlew --no-daemon dependencies || true

# Copy source code and build
COPY src/ src/
RUN ./gradlew --no-daemon bootJar -x test

# Stage 2: Run
FROM eclipse-temurin:21-jre-alpine
WORKDIR /app

COPY --from=build /app/build/libs/*.jar app.jar

RUN mkdir -p /app/logs

EXPOSE 8082

HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8082/api/actuator/health || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
