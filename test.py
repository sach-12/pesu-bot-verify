import requests

# url = "https://pesu-bot-verify.vercel.app/api/get-user-access-token"
# data = {
#     "code": "0FsoIlPvcJu1jZREMUkLQa3i76r6c9"
# }

# res = requests.post(url, json=data)
# print(res.status_code)
# print(res.text)

url = "https://discord.com/api/oauth2/token"
data = {
    "grant_type": "authorization_code",
    "code": "0FsoIlPvcJu1jZREMUkLQa3i76r6c9",
    "redirect_uri": "https://pesu-bot-verify.vercel.app/"
}
headers = {
    "Content-Type": "application/x-www-form-urlencoded"
}
res = requests.post(url, data=data, headers=headers, auth=("980529206276526100", "EepmPoblyEHm0-TYvxE8UKrYvgajKgdm"))
print(res.status_code)
print(res.text)
