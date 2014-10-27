#!/bin/sh

# assumes all necessary classes+ressources in ./out and/or ./lib and copies them to deploy
rm -Rf deploy
mkdir deploy
#cd out
#jar -cf ../deploy/mach2.jar *
#cd ..

mkdir deploy/lib

cp -Rf src/main/webroot deploy
cp -Rf lib/* deploy/lib
cp -Rf out deploy/classes
cp run.sh deploy/
#cp ../RealLive/src/js/reallive.css deploy
#cp ../RealLive/src/js/*.js deploy