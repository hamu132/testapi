package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	_ "github.com/mattn/go-sqlite3" // ドライバーを匿名インポート
)

var db *sql.DB

func main() {
	// 1. データベースファイルを開く（なければ作成される）
	var err error
	//なければ新規作成、既に存在すればそれを使う
	db, err = sql.Open("sqlite3", "./visitors.db")//SQLiteドライバを指定しその設定を持つDB管理オブジェクトを作りそれをdbに代入している
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// 2. テーブル（データの表）を作成する
	//visitorsという名前の表を(存在しなければ)作る
	//テーブルの中身：主キーで数値の「id」、文字列の値「name」
	sqlStmt := `CREATE TABLE IF NOT EXISTS visitors (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);`
	_, err = db.Exec(sqlStmt)
	if err != nil {
		log.Fatal(err)
	}

	// --- /add エンドポイント ---
	http.HandleFunc("/add", func(w http.ResponseWriter, r *http.Request) {
		name := r.URL.Query().Get("user")
		if name == "" {
			http.Error(w, "userが必要です", 400)
			return
		}

		// SQLでデータを挿入 (INSERT)
		_, err := db.Exec("INSERT INTO visitors(name) VALUES(?)", name)
		if err != nil {
			http.Error(w, "保存に失敗しました", 500)
			return
		}

		fmt.Fprintf(w, "%s をデータベースに保存しました", name)
	})

	// --- /list エンドポイント ---
	http.HandleFunc("/list", func(w http.ResponseWriter, r *http.Request) {
		// SQLでデータを全件取得 (SELECT)
		rows, err := db.Query("SELECT name FROM visitors")
		if err != nil {
			http.Error(w, "取得に失敗しました", 500)
			return
		}
		defer rows.Close()

		var names []string
		for rows.Next() {
			var name string
			rows.Scan(&name)
			names = append(names, name)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(names)
	})

	fmt.Println("DB版サーバー起動: http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
