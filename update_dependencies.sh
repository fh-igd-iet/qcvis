#!/usr/bin/env bash
set -eEuo pipefail
mv LICENSE.txt _LICENSE.txt
trap "mv _LICENSE.txt LICENSE.txt" EXIT
yarn licenses generate-disclaimer --recursive --production > DEPENDENCIES.txt
(
	cd src-tauri
	cargo about generate about.hbs -o DEPENDENCIES.txt
	sed -i 's/&quot;/\"/g' DEPENDENCIES.txt # some texts are pre-quoted
)
