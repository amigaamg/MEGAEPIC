# ============================================================================
# AMEXAN Backend Multi-Stage Dockerfile
# Builds all Go microservices from the monorepo
# ============================================================================

FROM golang:1.22-alpine AS base
RUN apk add --no-cache git ca-certificates
WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./
RUN go mod download

# Copy all source
COPY . .

# ============================================================================
# Gateway
# ============================================================================
FROM base AS gateway-build
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/gateway ./services/gateway

FROM alpine:3.19 AS gateway
COPY --from=gateway-build /bin/gateway /bin/gateway
EXPOSE 8080
CMD ["/bin/gateway"]

# ============================================================================
# Encounter Service
# ============================================================================
FROM base AS encounter-build
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/encounter ./services/encounter

FROM alpine:3.19 AS encounter
COPY --from=encounter-build /bin/encounter /bin/encounter
EXPOSE 8081
CMD ["/bin/encounter"]

# ============================================================================
# Patient Service
# ============================================================================
FROM base AS patient-build
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/patient ./services/patient

FROM alpine:3.19 AS patient
COPY --from=patient-build /bin/patient /bin/patient
EXPOSE 8082
CMD ["/bin/patient"]

# ============================================================================
# History Service
# ============================================================================
FROM base AS history-build
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/history ./services/history

FROM alpine:3.19 AS history
COPY --from=history-build /bin/history /bin/history
EXPOSE 8083
CMD ["/bin/history"]

# ============================================================================
# Examination Service
# ============================================================================
FROM base AS examination-build
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/examination ./services/examination

FROM alpine:3.19 AS examination
COPY --from=examination-build /bin/examination /bin/examination
EXPOSE 8084
CMD ["/bin/examination"]

# ============================================================================
# Diagnosis Service
# ============================================================================
FROM base AS diagnosis-build
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/diagnosis ./services/diagnosis

FROM alpine:3.19 AS diagnosis
COPY --from=diagnosis-build /bin/diagnosis /bin/diagnosis
EXPOSE 8085
CMD ["/bin/diagnosis"]

# ============================================================================
# Management Service
# ============================================================================
FROM base AS management-build
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/management ./services/management

FROM alpine:3.19 AS management
COPY --from=management-build /bin/management /bin/management
EXPOSE 8086
CMD ["/bin/management"]

# ============================================================================
# Documentation Service
# ============================================================================
FROM base AS documentation-build
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/documentation ./services/documentation

FROM alpine:3.19 AS documentation
COPY --from=documentation-build /bin/documentation /bin/documentation
EXPOSE 8087
CMD ["/bin/documentation"]

# ============================================================================
# Chief Complaint Service
# ============================================================================
FROM base AS chief-complaint-build
RUN CGO_ENABLED=0 GOOS=linux go build -o /bin/chief-complaint ./services/chief-complaint

FROM alpine:3.19 AS chief-complaint
COPY --from=chief-complaint-build /bin/chief-complaint /bin/chief-complaint
EXPOSE 8088
CMD ["/bin/chief-complaint"]
