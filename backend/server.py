from concurrent import futures

import grpc
import EremApi_pb2_grpc as api
import EremApi_pb2 as pro
import prophet

def generateSuggestions(suggestions):
    print(str(suggestions))
    return ["a", "b", "c"]
class Servicer(api.EremApiServicer):
    def getSuggestions(self, request, context):
        print("get suggestions")
        return pro.Suggestions(words=generateSuggestions(request))

    def selectWord(self, request, context):
        print("word selected: " + str(request))

port = 8765

server = grpc.server(futures.ThreadPoolExecutor(max_workers=1))
api.add_EremApiServicer_to_server(Servicer(), server)

print("START")
prophet.init()
pred = prophet.predict("")

server.add_insecure_port('localhost:' + str(port))
server.start()
server.wait_for_termination()
print("OVER")