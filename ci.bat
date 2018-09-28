pushd Web
call npm run lint
popd
if %errorlevel% neq 0 exit /b %errorlevel%

pushd Web
call npm test
popd
if %errorlevel% neq 0 exit /b %errorlevel%

dotnet test .\Tests\Unit\Pobs.Tests.Unit.csproj
if %errorlevel% neq 0 exit /b %errorlevel%

dotnet test .\Tests\Integration\Pobs.Tests.Integration.csproj
