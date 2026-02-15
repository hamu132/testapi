package main

import (
	"fmt"
	"net/http"
)

func main() {
	// 1. ルーティングの設定（どのURLで、どの処理を呼ぶか）
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, "ハム、GoのAPIサーバーが立ち上がったよ！")
	})

	// 2. サーバーの起動
	fmt.Println("Server starting on http://localhost:8080...")
	http.ListenAndServe(":8080", nil)
}
