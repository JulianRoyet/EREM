// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var EremApi_pb = require('./EremApi_pb.js');

function serialize_CandidateUpdate(arg) {
  if (!(arg instanceof EremApi_pb.CandidateUpdate)) {
    throw new Error('Expected argument of type CandidateUpdate');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_CandidateUpdate(buffer_arg) {
  return EremApi_pb.CandidateUpdate.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_Sentence(arg) {
  if (!(arg instanceof EremApi_pb.Sentence)) {
    throw new Error('Expected argument of type Sentence');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_Sentence(buffer_arg) {
  return EremApi_pb.Sentence.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_Suggestions(arg) {
  if (!(arg instanceof EremApi_pb.Suggestions)) {
    throw new Error('Expected argument of type Suggestions');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_Suggestions(buffer_arg) {
  return EremApi_pb.Suggestions.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_Void(arg) {
  if (!(arg instanceof EremApi_pb.Void)) {
    throw new Error('Expected argument of type Void');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_Void(buffer_arg) {
  return EremApi_pb.Void.deserializeBinary(new Uint8Array(buffer_arg));
}


var EremApiService = exports.EremApiService = {
  getSuggestions: {
    path: '/EremApi/getSuggestions',
    requestStream: false,
    responseStream: false,
    requestType: EremApi_pb.CandidateUpdate,
    responseType: EremApi_pb.Suggestions,
    requestSerialize: serialize_CandidateUpdate,
    requestDeserialize: deserialize_CandidateUpdate,
    responseSerialize: serialize_Suggestions,
    responseDeserialize: deserialize_Suggestions,
  },
  setSentence: {
    path: '/EremApi/setSentence',
    requestStream: false,
    responseStream: false,
    requestType: EremApi_pb.Sentence,
    responseType: EremApi_pb.Void,
    requestSerialize: serialize_Sentence,
    requestDeserialize: deserialize_Sentence,
    responseSerialize: serialize_Void,
    responseDeserialize: deserialize_Void,
  },
};

exports.EremApiClient = grpc.makeGenericClientConstructor(EremApiService);
