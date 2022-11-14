"use strict";
exports.__esModule = true;
exports.EremApi = void 0;
var PROTO_PATH = '../protobuff/EremApi.proto';
var grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');
// Suggested options for similarity to existing grpc.load behavior
var packageDefinition = protoLoader.loadSync(PROTO_PATH, { keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
});
var protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
var api = protoDescriptor.EremApi;
exports.EremApi = api;
