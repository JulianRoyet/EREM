python -m grpc_tools.protoc -I=protobuff --python_out=backend --grpc_python_out=backend protobuff/*.proto

cd electron\src\js
rmdir . /s /q
cd ..
CMD /C tsc --rootDir ts --outDir js
cd ..\..

CMD /C npx --prefix electron grpc_tools_node_protoc --js_out=import_style=commonjs,binary:electron/src/js/server --grpc_out=electron/src/js/server -I protobuff protobuff/*.proto
CMD /C npx --prefix electron grpc_tools_node_protoc --ts_out=electron/src/ts/server -I protobuff protobuff/*.proto
