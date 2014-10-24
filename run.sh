#!/bin/sh
## is copied to deplay and starts server. optional arg is port (defaults to 7777)
cd webroot
java -cp ../classes:../lib/* com.reax.ReaXerve
cd ..
