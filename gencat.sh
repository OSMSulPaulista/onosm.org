#!/bin/bash

cp categories.json categories.json-backup
sort -u categories.json-backup -o categories.json
sed -i 2d categories.json
echo ']' >> categories.json

# JSON validator like jsonlint.com

cat categories.json | python -m json.tool 1>/dev/null
jsonlint -v categories.json
