import threading
uprint = print

class SafePrint:
    _instance = None
    _lock = threading.Lock()

    plock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        if not cls._instance:
            with cls._lock:
                # another thread could have created the instance
                # before we acquired the lock. So check that the
                # instance is still nonexistent.
                if not cls._instance:
                    cls._instance = super(SafePrint, cls).__new__(cls)
        return cls._instance

    def sprint(self, *argv):
        with self.plock:
            uprint(*argv)

def print(*argv):
    SafePrint().sprint(*argv)
