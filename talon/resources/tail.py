import argparse
import os
import sys
import time

def follow(path, last=20, query=None, reopen=True):
    while True:
        parts = []
        try:
            last_st = os.stat(path)
        except FileNotFoundError:
            time.sleep(0.5)
            continue

        with open(path, 'r', encoding='utf8') as f:
            query_matched = False
            query_lines = []
            window = []
            for line in f:
                window.append(line)
                window = window[-last:]
                if query is not None:
                    if query in line:
                        query_lines = []
                        query_matched = True
                    if query_matched:
                        query_lines.append(line)

            if query_lines:
                yield from query_lines
            else:
                yield from window

            del window
            del query_lines

            while True:
                if reopen:
                    try:
                        st = os.stat(path)
                    except FileNotFoundError:
                        break
                    pos = f.tell()
                    if st.st_ino != last_st.st_ino:
                        break
                    if last_st.st_mtime < st.st_mtime:
                        if st.st_size <= pos:
                            break
                        else:
                            f.seek(pos - 1, os.SEEK_SET)
                            if f.read(1) != '\n':
                                break
                    last_st = st

                line = f.readline()
                if line:
                    parts.append(line)
                    if line.endswith('\n'):
                        yield ''.join(parts)
                        parts = []
                        continue
                time.sleep(0.100)

def tail(args):
    print()
    print('==== Log: {} ===='.format(os.path.realpath(args.path)))
    print()
    try:
        for line in follow(args.path, query=args.query):
            sys.stdout.write(line)
            sys.stdout.flush()
    except KeyboardInterrupt:
        sys.stdout.write('\n')
        sys.stdout.flush()

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('-q', '--query', help='search for text to mark tail history start')
    parser.add_argument('path', help='path to tail')
    args = parser.parse_args()

    if sys.platform == 'win32':
        import ctypes
        ctypes.windll.kernel32.SetConsoleTitleW('Talon - Log Viewer')

    tail(args)
