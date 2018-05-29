pushd Web
call tslint.bat
popd
dotnet test .\Tests\Unit\Pobs.Tests.Unit.csproj 1> nul
dotnet test .\Tests\Integration\Pobs.Tests.Integration.csproj 1> nul
