# -*- coding: utf-8 -*-
# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: EremApi.proto
"""Generated protocol buffer code."""
from google.protobuf.internal import builder as _builder
from google.protobuf import descriptor as _descriptor
from google.protobuf import descriptor_pool as _descriptor_pool
from google.protobuf import symbol_database as _symbol_database
# @@protoc_insertion_point(imports)

_sym_db = _symbol_database.Default()




DESCRIPTOR = _descriptor_pool.Default().AddSerializedFile(b'\n\rEremApi.proto\")\n\tCandidate\x12\r\n\x05index\x18\x01 \x01(\x05\x12\r\n\x05score\x18\x02 \x01(\x02\"+\n\x0f\x43\x61ndidateUpdate\x12\x18\n\x04\x64\x61ta\x18\x01 \x03(\x0b\x32\n.Candidate\"\x1c\n\x0bSuggestions\x12\r\n\x05words\x18\x01 \x03(\t\"\x18\n\x08Sentence\x12\x0c\n\x04word\x18\x01 \x01(\t\"\x16\n\x05Ready\x12\r\n\x05ready\x18\x01 \x01(\x08\"\x06\n\x04Void2|\n\x07\x45remApi\x12\x32\n\x0egetSuggestions\x12\x10.CandidateUpdate\x1a\x0c.Suggestions\"\x00\x12!\n\x0bsetSentence\x12\t.Sentence\x1a\x05.Void\"\x00\x12\x1a\n\x07isReady\x12\x05.Void\x1a\x06.Ready\"\x00\x62\x06proto3')

_builder.BuildMessageAndEnumDescriptors(DESCRIPTOR, globals())
_builder.BuildTopDescriptorsAndMessages(DESCRIPTOR, 'EremApi_pb2', globals())
if _descriptor._USE_C_DESCRIPTORS == False:

  DESCRIPTOR._options = None
  _CANDIDATE._serialized_start=17
  _CANDIDATE._serialized_end=58
  _CANDIDATEUPDATE._serialized_start=60
  _CANDIDATEUPDATE._serialized_end=103
  _SUGGESTIONS._serialized_start=105
  _SUGGESTIONS._serialized_end=133
  _SENTENCE._serialized_start=135
  _SENTENCE._serialized_end=159
  _READY._serialized_start=161
  _READY._serialized_end=183
  _VOID._serialized_start=185
  _VOID._serialized_end=191
  _EREMAPI._serialized_start=193
  _EREMAPI._serialized_end=317
# @@protoc_insertion_point(module_scope)
