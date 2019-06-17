FROM microsoft/dotnet:2.1.0-runtime

COPY build/app .
COPY appsettings.Production.json .

EXPOSE 5000/tcp
ENV ASPNETCORE_URLS http://*:5000


RUN apt-get -qq update && apt-get -qqy --no-install-recommends install wget gnupg git unzip

RUN curl -sL https://deb.nodesource.com/setup_6.x |  bash -
RUN apt-get install -y nodejs


ENTRYPOINT ["dotnet", "Pobs.Web.dll"]
