from concurrent import futures
import sys

import grpc
import EremApi_pb2_grpc as api
import EremApi_pb2 as pro
import prophet as ai

suggestions = []
def generateSuggestions():
    print(str(suggestions))
    return suggestions

class Servicer(api.EremApiServicer):
    def getSuggestions(self, request, context):
        print("get suggestions")
        
        return pro.Suggestions(words=generateSuggestions(request))

    def setSentence(self, request, context):
        sentence = str(request)
        print("sentence: \"" + sentence + "\"")
        prophet.predict(sentence)

        return pro.Void()

port = 8765
prophet = ai.Prophet()
prophet.predict("")
suggestions = []#prophet.get_suggestions()

server = grpc.server(futures.ThreadPoolExecutor(max_workers=1))
api.add_EremApiServicer_to_server(Servicer(), server)

print("START")
print("<READY>")
server.add_insecure_port('localhost:' + str(port))

server.start()

server.wait_for_termination()
print("OVER")