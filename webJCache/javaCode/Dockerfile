#################################################
# Imagen base para el contenedor de compilación
#################################################
FROM maven:3.8.3-openjdk-17 as builder

# Define el directorio de trabajo donde ejecutar comandos
WORKDIR /project

# Copia las dependencias del proyecto
COPY pom.xml /project/

# Descarga las dependencias del proyecto
RUN mvn -B verify clean --fail-never

# Copia el código del proyecto
COPY /src /project/src
COPY /target/board-k8s-0.0.1-SNAPSHOT.jar /project/target/board-k8s-0.0.1-SNAPSHOT.jar

# Compila proyecto
RUN mvn -B package

#################################################
# Imagen base para el contenedor de la aplicación
#################################################
FROM openjdk:17-alpine

# Define el directorio de trabajo donde se encuentra el JAR
WORKDIR /usr/src/app/

# Copia el JAR del contenedor de compilación
COPY --from=builder /project/target/board-k8s-0.0.1-SNAPSHOT.jar /usr/src/app/

# Indica el puerto que expone el contenedor
EXPOSE 8080

# Comando que se ejecuta al hacer docker run
CMD ["java", "-jar", "board-k8s-0.0.1-SNAPSHOT.jar"]