#!/usr/bin/env bash
set -eEuo pipefail
mv LICENSE.txt _LICENSE.txt
trap "mv _LICENSE.txt LICENSE.txt" EXIT
yarn licenses generate-disclaimer --recursive --production > DEPENDENCIES.txt
trap - EXIT
mv _LICENSE.txt LICENSE.txt
cd src-tauri
cargo about generate about.hbs -o DEPENDENCIES.html
