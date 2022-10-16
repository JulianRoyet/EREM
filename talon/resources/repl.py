import argparse
import atexit
import json
import os
import socket
import sys
import time
import traceback
from pathlib import Path

class UnixPipe:
    def __init__(self, s):
        self.s = s
        self.writer = s.makefile('w', buffering=1, encoding='utf8')
        self.reader = s.makefile('r', buffering=1, encoding='utf8')

    @classmethod
    def connect(cls, path):
        s = socket.socket(socket.AF_UNIX, socket.SOCK_STREAM)
        s.connect(path)
        return cls(s)

    def write(self, data):
        self.writer.write(data)
        self.writer.flush()

    def readline(self):
        return self.reader.readline()

    def close(self):
        try: self.s.shutdown(socket.SHUT_RDWR)
        except Exception: pass

if sys.platform == 'win32':
    import win32file
    import win32pipe

    class WindowsPipe:
        def __init__(self, pipe, bufsize=0x100000):
            self.pipe = pipe
            self.bufsize = bufsize

        @classmethod
        def connect(cls, path):
            pipe = win32file.CreateFile(path, win32file.GENERIC_READ|win32file.GENERIC_WRITE,
                                        0, None, win32file.OPEN_EXISTING, 0, None)
            win32pipe.SetNamedPipeHandleState(pipe, win32pipe.PIPE_READMODE_MESSAGE, None, None)
            return cls(pipe)

        def write(self, data):
            win32file.WriteFile(self.pipe, data.encode('utf8'))

        def read(self):
            _, data = win32file.ReadFile(self.pipe, self.bufsize)
            return data.decode('utf8')

        readline = read

        def close(self):
            self.pipe.close()
            self.pipe = None

def get_home():
    home = Path.home()
    if sys.platform == 'win32':
        home = Path(os.getenv('APPDATA', home))
        return home / 'talon'
    else:
        return home / '.talon'
TALON_HOME = get_home()

def remove_history_item(idx):
    pass
try:
    import readline
    is_libedit = 'libedit' in (getattr(readline, '__doc__') or '')
    if is_libedit:
        histfile = str(TALON_HOME / '.sys' / '.repl_history-editline')
    else:
        histfile = str(TALON_HOME / '.sys' / '.repl_history')

    if os.path.exists(histfile):
        try:
            readline.read_history_file(histfile)
        except Exception:
            os.unlink(histfile)
    readline.set_history_length(1000)
    atexit.register(readline.write_history_file, histfile)

    if is_libedit:
        # readline.parse_and_bind('bind ^R em-inc-search-prev')
        readline.parse_and_bind('bind ^I rl_complete')
    else:
        readline.parse_and_bind('tab: complete')

    try:
        readline.read_init_file()
    except OSError:
        pass
    except Exception:
        traceback.print_exc()

    def complete(text, state):
        if not text:
            if state == 0:
                readline.insert_text('    ')
                if hasattr(readline, 'redisplay'):
                    readline.redisplay()
                return ''
        repl.send('complete', text=text, state=state)
        m = repl.recv()
        return m['text']
    readline.set_completer(complete)

    def remove_history_item(idx):
        readline.remove_history_item(readline.get_current_history_length()-idx)
except Exception:
    traceback.print_exc()
    # should still work if readline is absent
    readline = None

class Repl:
    def __init__(self):
        self.s = None

    def connect(self, wait=False):
        while True:
            try:
                if sys.platform == 'win32':
                    self.s = WindowsPipe.connect(r'\\.\pipe\talon_repl')
                else:
                    self.s = UnixPipe.connect(os.path.expanduser('~/.talon/.sys/repl.sock'))
                break
            except Exception:
                if not wait:
                    traceback.print_exc()
                    sys.stderr.write('Could not open repl. Is Talon running?\n')
                    sys.exit(1)
            time.sleep(0.1)
            continue

    def send(self, cmd, **m):
        m['cmd'] = cmd
        self.s.write((json.dumps(m) + '\n'))

    def recv(self):
        data = self.s.readline()
        return json.loads(data)

    def loop(self):
        need_newline = False
        while True:
            m = self.recv()
            cmd = m['cmd']
            if cmd == 'prompt':
                prompt = m['prompt']
                if not sys.stdin.isatty():
                    if need_newline:
                        sys.stdout.write('\n')
                        need_newline = False
                    prompt = ''
                try:
                    line = input(prompt)
                    if 'keychain.add(' in line:
                        remove_history_item(1)
                    self.send('input', text=line)
                except KeyboardInterrupt:
                    sys.stdout.write('\n')
                    self.send('reset')
                except EOFError:
                    self.s.close()
                    break
            elif cmd == 'stdout':
                text = m['text']
                if text.endswith('\n'):
                    text = text.rstrip('\n') + '\n'
                else:
                    need_newline = True
                sys.stdout.write(text)
                sys.stdout.flush()
            elif cmd == 'stdin':
                mode = m['mode']
                if mode == 'read':
                    text = sys.stdin.read(m['n'])
                    self.send('stdin', text=text)
                elif mode == 'readline':
                    text = sys.stdin.readline(m['n'])
                    self.send('stdin', text=text)
            elif cmd == 'exit':
                break
        if sys.stdin.isatty():
            sys.stdout.write('\n')

if __name__ == '__main__':
    if sys.platform == 'win32':
        import ctypes
        ctypes.windll.kernel32.SetConsoleTitleW('Talon - REPL')

    parser = argparse.ArgumentParser()
    parser.add_argument('--wait',      '-w', help='wait for Talon to start', action='store_true')
    parser.add_argument('--reconnect', '-r', help='automatically reconnect if Talon restarts', action='store_true')
    parser.add_argument('--imports',   '-i', help='more imports (may be slower)', action='store_true')
    args = parser.parse_args()

    repl = Repl()
    while True:
        try:
            repl.connect(wait=args.wait or args.reconnect)
        except KeyboardInterrupt:
            break
        if args.imports:
            repl.send('imports')
        try:
            repl.loop()
        except (BrokenPipeError, json.JSONDecodeError):
            sys.stdout.write('\n')
            if args.reconnect:
                sys.stderr.write('[Talon quit, reconnecting]\n')
                continue
            sys.stderr.write('[Talon quit]\n')
            sys.exit(2)
        break
