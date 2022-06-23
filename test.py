import requests

url = 'http://localhost:3000/api/report-error'
data = {
    "userToken": "gBNxLjs259qgv5TJACfqpcOE0w2xIs",
    "errorType": "test",
    "errorMessage": "test message",
}

res = requests.post(url, json=data)
print(res.status_code)
print(res.text)