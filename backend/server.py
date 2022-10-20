from concurrent import futures

import grpc
import EremApi_pb2_grpc as api
import EremApi_pb2 as pro

class Servicer(api.EremApiServicer):
    def getHelloMsg(self, request, context):
        print("SENDING HELLO")
        return pro.HelloText(hello="Hello World!")

    def getArray(self, request, context):
        return pro.StringArray(data=["a", "b", "c"])

port = 8765

server = grpc.server(futures.ThreadPoolExecutor(max_workers=1))
api.add_EremApiServicer_to_server(Servicer(), server)

print("START")
server.add_insecure_port('localhost:' + str(port))
server.start()
server.wait_for_termination()
print("OVER")