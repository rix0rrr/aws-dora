#!/bin/bash
set -eu
scriptdir=$(cd $(dirname $0) && pwd)

# Create temp directory and clean up on exit
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

# Clone the AWS SDK repo
git clone https://github.com/aws/aws-sdk-js-v3.git "$TEMP_DIR"

# Copy models directory
cp -r "$TEMP_DIR/codegen/sdk-codegen/aws-models/"* "$scriptdir/../vendor/aws-sdk-js-v3/aws-models/"