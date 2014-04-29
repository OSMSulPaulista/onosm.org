#!/bin/bash
#
# JSON validator like jsonlint.com

function regenerate() {

    JSON_FILE="$1"

    cp "$JSON_FILE" "$JSON_FILE-backup"
    sort -u "$JSON_FILE-backup" -o "$JSON_FILE"
    sed -i 2d "$JSON_FILE"
    echo ']' >> "$JSON_FILE"

}

function validate() {

    JSON_FILE="$1"

    cat "$JSON_FILE" | python -m json.tool 1>/dev/null
    jsonlint -v "$JSON_FILE"

}

function makeTo() {

    JSON_FILE="$1"

    regenerate "$JSON_FILE"
    validate "$JSON_FILE"

}

makeTo "categories.json"
makeTo "payment.json"
