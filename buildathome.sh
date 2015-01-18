!/bin/sh

cd ..
cd ./fast-serialization
mvn -Dmaven.test.skip=true clean install

cd ..
cd ./kontraktor
mvn -Dmaven.test.skip=true clean install

cd ..
cd ./RealLive
mvn -Dmaven.test.skip=true clean install

cd ..
cd ./4k
mvn -Dmaven.test.skip=true clean install

cd ..
cd ./reax2
mvn -Dmaven.test.skip=true clean package

cd ..
cd reax2
cd lib
rm -f 4k*.jar
rm -f fst*.jar
rm -f kontraktor*.jar
rm -f RealLive*.jar
rm -f reax2*.jar


cp ../../fast-serialization/target/fst-*[1-9T].jar .
cp ../../kontraktor/target/kontraktor-*[1-9T].jar .
cp ../../RealLive/target/RealLive-*[1-9T].jar .
cp ../../4k/target/4k-*[1-9T].jar .
cp ../target/reax2-*[1-9T].jar .

cd ..

rm -Rf install
mkdir install

mkdir install/lib
mkdir install/weblib
mkdir install/application
mkdir install/fileroot

cp -Rf lib install
cp -Rf src/weblib install
cp -Rf src/main/webroot/4k/* install/application
cp -Rf src/main/webroot/initialdata install/initialdata
cp -Rf src/main/webroot/fileroot install

cp src/main/webroot/conf_prod.kson install/conf.kson
cp src/main/webroot/mail_prod.kson install/mail.kson
cp src/main/webroot/model.kson install/
cp run_prod.sh install/run.sh

