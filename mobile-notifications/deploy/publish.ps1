del build -Recurse
dotnet publish "../NotificationsApp" -c Release -r rhel.7.2-x64 -o "$(pwd)/build/app"
Add-Type -A System.IO.Compression.FileSystem
[IO.Compression.ZipFile]::CreateFromDirectory('deploy/build/app', 'deploy/build/NotificationsApp.zip')
