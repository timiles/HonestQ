# Set build number
buildNumber=`cat build/next-build-number.txt`
if [ $? -ne 0 ]; then read -p "Enter next build number: " buildNumber; fi

rm -rf build/app
dotnet publish "../Web" -c Release -r linux-x64 -o "$(pwd)/build/app"

# Login
$(aws ecr get-login --no-include-email --region eu-west-2)

# Build & push
docker build -t pobsweb .
imageUri="627618477028.dkr.ecr.eu-west-2.amazonaws.com/pobsweb:$((buildNumber))"
docker tag pobsweb:latest $imageUri
docker push $imageUri

# Increment next already in case anything fails after here
echo $((buildNumber+1)) > build/next-build-number.txt

# Upload new task definition
sed 's/<build_number>/'"$buildNumber"'/g' <task-definition-template.json >build/task-definition.json
aws ecs register-task-definition --cli-input-json file://build/task-definition.json

# Update service to new task definition
aws ecs update-service --cluster pobsweb --service pobsweb --task-definition "pobsweb:$((buildNumber))"

start chrome https://eu-west-2.console.aws.amazon.com/ecs/home?region=eu-west-2#/clusters/pobsweb/services/pobsweb/tasks

echo "Pushed to $imageUri"
