release:
	rm -rf dist
	mkdir -p dist/assets
	cp -r assets/* dist/assets/
	cp background.js \
	   LICENSE \
	   manifest.json \
	   options.html \
	   options.js \
	   README.md \
	   dist/
	cd dist && zip -r thunder_org_protocol.xpi ./ && \
	   mv thunder_org_protocol.xpi .. && cd .. && rm -rf dist