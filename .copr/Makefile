NPM := $(shell if which npm 2>/dev/null; then true; else echo npm; fi)

$(NPM):
	dnf install -y npm
	dnf install -y nodejs-packaging

srpm: $(NPM)
	npm i --silent
	npm run postversion > "/dev/null" 2>&1
	npm pack --silent
	mkdir -p /tmp/_topdir/SOURCES
	cp -r ./* /tmp/_topdir/SOURCES
	rpmbuild -bs --define "_topdir /tmp/_topdir" /tmp/_topdir/SOURCES/iml-socket-worker.spec
	cp -r /tmp/_topdir/SRPMS/* $(outdir)
