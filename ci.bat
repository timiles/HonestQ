pushd Web
call tslint.bat
popd
if %errorlevel% neq 0 exit /b %errorlevel%

dotnet test .\Tests\Unit\Pobs.Tests.Unit.csproj
if %errorlevel% neq 0 exit /b %errorlevel%

dotnet test .\Tests\Integration\Pobs.Tests.Integration.csproj
