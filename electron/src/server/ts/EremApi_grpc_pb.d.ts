// package: 
// file: EremApi.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from "grpc";
import * as EremApi_pb from "./EremApi_pb";

interface IEremApiService extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
    getSuggestions: IEremApiService_IgetSuggestions;
    setSentence: IEremApiService_IsetSentence;
    isReady: IEremApiService_IisReady;
}

interface IEremApiService_IgetSuggestions extends grpc.MethodDefinition<EremApi_pb.CandidateUpdate, EremApi_pb.Suggestions> {
    path: "/EremApi/getSuggestions";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<EremApi_pb.CandidateUpdate>;
    requestDeserialize: grpc.deserialize<EremApi_pb.CandidateUpdate>;
    responseSerialize: grpc.serialize<EremApi_pb.Suggestions>;
    responseDeserialize: grpc.deserialize<EremApi_pb.Suggestions>;
}
interface IEremApiService_IsetSentence extends grpc.MethodDefinition<EremApi_pb.Sentence, EremApi_pb.Void> {
    path: "/EremApi/setSentence";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<EremApi_pb.Sentence>;
    requestDeserialize: grpc.deserialize<EremApi_pb.Sentence>;
    responseSerialize: grpc.serialize<EremApi_pb.Void>;
    responseDeserialize: grpc.deserialize<EremApi_pb.Void>;
}
interface IEremApiService_IisReady extends grpc.MethodDefinition<EremApi_pb.Void, EremApi_pb.Ready> {
    path: "/EremApi/isReady";
    requestStream: false;
    responseStream: false;
    requestSerialize: grpc.serialize<EremApi_pb.Void>;
    requestDeserialize: grpc.deserialize<EremApi_pb.Void>;
    responseSerialize: grpc.serialize<EremApi_pb.Ready>;
    responseDeserialize: grpc.deserialize<EremApi_pb.Ready>;
}

export const EremApiService: IEremApiService;

export interface IEremApiServer {
    getSuggestions: grpc.handleUnaryCall<EremApi_pb.CandidateUpdate, EremApi_pb.Suggestions>;
    setSentence: grpc.handleUnaryCall<EremApi_pb.Sentence, EremApi_pb.Void>;
    isReady: grpc.handleUnaryCall<EremApi_pb.Void, EremApi_pb.Ready>;
}

export interface IEremApiClient {
    getSuggestions(request: EremApi_pb.CandidateUpdate, callback: (error: grpc.ServiceError | null, response: EremApi_pb.Suggestions) => void): grpc.ClientUnaryCall;
    getSuggestions(request: EremApi_pb.CandidateUpdate, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: EremApi_pb.Suggestions) => void): grpc.ClientUnaryCall;
    getSuggestions(request: EremApi_pb.CandidateUpdate, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: EremApi_pb.Suggestions) => void): grpc.ClientUnaryCall;
    setSentence(request: EremApi_pb.Sentence, callback: (error: grpc.ServiceError | null, response: EremApi_pb.Void) => void): grpc.ClientUnaryCall;
    setSentence(request: EremApi_pb.Sentence, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: EremApi_pb.Void) => void): grpc.ClientUnaryCall;
    setSentence(request: EremApi_pb.Sentence, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: EremApi_pb.Void) => void): grpc.ClientUnaryCall;
    isReady(request: EremApi_pb.Void, callback: (error: grpc.ServiceError | null, response: EremApi_pb.Ready) => void): grpc.ClientUnaryCall;
    isReady(request: EremApi_pb.Void, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: EremApi_pb.Ready) => void): grpc.ClientUnaryCall;
    isReady(request: EremApi_pb.Void, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: EremApi_pb.Ready) => void): grpc.ClientUnaryCall;
}

export class EremApiClient extends grpc.Client implements IEremApiClient {
    constructor(address: string, credentials: grpc.ChannelCredentials, options?: object);
    public getSuggestions(request: EremApi_pb.CandidateUpdate, callback: (error: grpc.ServiceError | null, response: EremApi_pb.Suggestions) => void): grpc.ClientUnaryCall;
    public getSuggestions(request: EremApi_pb.CandidateUpdate, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: EremApi_pb.Suggestions) => void): grpc.ClientUnaryCall;
    public getSuggestions(request: EremApi_pb.CandidateUpdate, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: EremApi_pb.Suggestions) => void): grpc.ClientUnaryCall;
    public setSentence(request: EremApi_pb.Sentence, callback: (error: grpc.ServiceError | null, response: EremApi_pb.Void) => void): grpc.ClientUnaryCall;
    public setSentence(request: EremApi_pb.Sentence, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: EremApi_pb.Void) => void): grpc.ClientUnaryCall;
    public setSentence(request: EremApi_pb.Sentence, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: EremApi_pb.Void) => void): grpc.ClientUnaryCall;
    public isReady(request: EremApi_pb.Void, callback: (error: grpc.ServiceError | null, response: EremApi_pb.Ready) => void): grpc.ClientUnaryCall;
    public isReady(request: EremApi_pb.Void, metadata: grpc.Metadata, callback: (error: grpc.ServiceError | null, response: EremApi_pb.Ready) => void): grpc.ClientUnaryCall;
    public isReady(request: EremApi_pb.Void, metadata: grpc.Metadata, options: Partial<grpc.CallOptions>, callback: (error: grpc.ServiceError | null, response: EremApi_pb.Ready) => void): grpc.ClientUnaryCall;
}
