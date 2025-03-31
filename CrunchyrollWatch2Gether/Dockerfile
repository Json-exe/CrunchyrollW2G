FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["CrunchyrollWatch2Gether/CrunchyrollWatch2Gether.csproj", "CrunchyrollWatch2Gether/"]
RUN dotnet restore "CrunchyrollWatch2Gether/CrunchyrollWatch2Gether.csproj"
COPY . .
WORKDIR "/src/CrunchyrollWatch2Gether"
RUN dotnet build "./CrunchyrollWatch2Gether.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./CrunchyrollWatch2Gether.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "CrunchyrollWatch2Gether.dll"]
