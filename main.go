package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync" // 同時にアクセスが来ても壊れないようにするための道具
)

// 保存するデータの構造
type VisitorLog struct {
	CurrentVisitor string   `json:"current_visitor"`
	AllVisitors    []string `json:"all_visitors"`
	Count          int      `json:"count"`
}

// 擬似的なデータベース（メモリ上に保存）
var (
	visitors []string
	mu       sync.Mutex // 「一度に一人しか書き込めない」ようにする鍵
)

func main() {
	http.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		name := r.URL.Query().Get("user")
		if name == "" {
			name = "ゲスト"
		}

		// --- データの保存処理 ---
		mu.Lock()         // 鍵をかける（他のアクセスを待たせる）
		visitors = append(visitors, name) // リストに追加
		currentCount := len(visitors)
		mu.Unlock()       // 鍵をあける
		// ----------------------

		data := VisitorLog{
			CurrentVisitor: name,
			AllVisitors:    visitors,
			Count:          currentCount,
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(data)
	})

	fmt.Println("Server starting on http://localhost:8080...")
	http.ListenAndServe(":8080", nil)
}