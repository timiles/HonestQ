pushd Web
call npm run lint
popd
if %errorlevel% neq 0 exit /b %errorlevel%

REM pushd Web
REM call npm test
REM popd
REM if %errorlevel% neq 0 exit /b %errorlevel%

dotnet test .\Tests\Unit\Pobs.Tests.Unit.csproj
if %errorlevel% neq 0 exit /b %errorlevel%

dotnet test .\Tests\Integration\Pobs.Tests.Integration.csproj
