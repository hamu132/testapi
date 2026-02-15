import requests

# 1. 名前を追加する (POSTのような操作)
print("--- ユーザーを追加します ---")
response_add = requests.get("http://localhost:8080/add", params={"user": "ハム太郎"})
print(response_add.json()["message"])

# 2. 一覧を取得する
print("\n--- 現在のリストを取得します ---")
response_list = requests.get("http://localhost:8080/list")
data = response_list.json()

print(f"メッセージ: {data['message']}")
for i, name in enumerate(data['data']):
    print(f"{i+1}人目: {name}")