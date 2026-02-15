package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
)

// メモリ上の擬似データベース
var (
	visitors []string
	mu       sync.Mutex
)

// レスポンス用の共通構造体
type MessageResponse struct {
	Message string   `json:"message"`
	Data    []string `json:"data,omitempty"` // 空の時はJSONに含めない
}

func main() {
	// --- 窓口1: 名前を追加する (/add) ---
	http.HandleFunc("/add", func(w http.ResponseWriter, r *http.Request) {
		name := r.URL.Query().Get("user")
		if name == "" {
			http.Error(w, "userパラメータが必要です", http.StatusBadRequest)
			return
		}

		mu.Lock()
		visitors = append(visitors, name)
		mu.Unlock()

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(MessageResponse{
			Message: fmt.Sprintf("%s さんを登録しました！", name),
		})
	})

	// --- 窓口2: 一覧を表示する (/list) ---
	http.HandleFunc("/list", func(w http.ResponseWriter, r *http.Request) {
		mu.Lock()
		// 内容をコピーして渡す（安全のため）
		list := make([]string, len(visitors))
		copy(list, visitors)
		mu.Unlock()

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(MessageResponse{
			Message: "来場者一覧です",
			Data:    list,
		})
	})

	fmt.Println("Server starting on http://localhost:8080...")
	fmt.Println("Endpoints: /add?user=xxx, /list")
	http.ListenAndServe(":8080", nil)
}
