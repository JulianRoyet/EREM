// package: 
// file: EremApi.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from "google-protobuf";

export class Candidate extends jspb.Message { 
    getIndex(): number;
    setIndex(value: number): Candidate;
    getScore(): number;
    setScore(value: number): Candidate;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Candidate.AsObject;
    static toObject(includeInstance: boolean, msg: Candidate): Candidate.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Candidate, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Candidate;
    static deserializeBinaryFromReader(message: Candidate, reader: jspb.BinaryReader): Candidate;
}

export namespace Candidate {
    export type AsObject = {
        index: number,
        score: number,
    }
}

export class CandidateUpdate extends jspb.Message { 
    clearDataList(): void;
    getDataList(): Array<Candidate>;
    setDataList(value: Array<Candidate>): CandidateUpdate;
    addData(value?: Candidate, index?: number): Candidate;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): CandidateUpdate.AsObject;
    static toObject(includeInstance: boolean, msg: CandidateUpdate): CandidateUpdate.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: CandidateUpdate, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): CandidateUpdate;
    static deserializeBinaryFromReader(message: CandidateUpdate, reader: jspb.BinaryReader): CandidateUpdate;
}

export namespace CandidateUpdate {
    export type AsObject = {
        dataList: Array<Candidate.AsObject>,
    }
}

export class Suggestions extends jspb.Message { 
    clearWordsList(): void;
    getWordsList(): Array<string>;
    setWordsList(value: Array<string>): Suggestions;
    addWords(value: string, index?: number): string;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Suggestions.AsObject;
    static toObject(includeInstance: boolean, msg: Suggestions): Suggestions.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Suggestions, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Suggestions;
    static deserializeBinaryFromReader(message: Suggestions, reader: jspb.BinaryReader): Suggestions;
}

export namespace Suggestions {
    export type AsObject = {
        wordsList: Array<string>,
    }
}

export class Sentence extends jspb.Message { 
    getWord(): string;
    setWord(value: string): Sentence;

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Sentence.AsObject;
    static toObject(includeInstance: boolean, msg: Sentence): Sentence.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Sentence, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Sentence;
    static deserializeBinaryFromReader(message: Sentence, reader: jspb.BinaryReader): Sentence;
}

export namespace Sentence {
    export type AsObject = {
        word: string,
    }
}

export class Void extends jspb.Message { 

    serializeBinary(): Uint8Array;
    toObject(includeInstance?: boolean): Void.AsObject;
    static toObject(includeInstance: boolean, msg: Void): Void.AsObject;
    static extensions: {[key: number]: jspb.ExtensionFieldInfo<jspb.Message>};
    static extensionsBinary: {[key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>};
    static serializeBinaryToWriter(message: Void, writer: jspb.BinaryWriter): void;
    static deserializeBinary(bytes: Uint8Array): Void;
    static deserializeBinaryFromReader(message: Void, reader: jspb.BinaryReader): Void;
}

export namespace Void {
    export type AsObject = {
    }
}
