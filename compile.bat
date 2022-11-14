python -m grpc_tools.protoc -I=protobuff --python_out=backend --grpc_python_out=backend protobuff/*.proto

CMD /C tsc -p electron\src\server\tsconfig.json --outDir electron/src/server/js
CMD /C tsc -p electron\src\client\tsconfig.json --outDir electron/src/client/js

CMD /C npx --prefix electron grpc_tools_node_protoc --js_out=import_style=commonjs,binary:electron/src/server/js --grpc_out=electron/src/server/js -I protobuff protobuff/*.proto
CMD /C npx --prefix electron grpc_tools_node_protoc --ts_out=electron/src/server/ts -I protobuff protobuff/*.proto
