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

type Post struct {
	Name      string `json:"name"`
	Body      string `json:"body"` // ここを追加！
	CreatedAt string `json:"created_at"`
}

func main() {
	// 1. データベースファイルを開く（なければ作成される）
	var err error
	//なければ新規作成、既に存在すればそれを使う
	db, err = sql.Open("sqlite3", "./visitors.db") //SQLiteドライバを指定しその設定を持つDB管理オブジェクトを作りそれをdbに代入している
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	// 2. テーブル（データの表）を作成する
	//visitorsという名前の表を(存在しなければ)作る
	//テーブルの中身：主キーで数値の「id」、文字列の値「name」、日付の値「created_at」
	//sqlStmt := `CREATE TABLE IF NOT EXISTS visitors (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT);`
	// テーブル作成のSQLを更新
	sqlStmt := `CREATE TABLE IF NOT EXISTS visitors (
		id INTEGER PRIMARY KEY AUTOINCREMENT, 
		name TEXT,
		body TEXT, -- ここを追加！
		created_at DATETIME DEFAULT CURRENT_TIMESTAMP
	);`
	_, err = db.Exec(sqlStmt)
	if err != nil {
		log.Fatal(err)
	}

	http.Handle("/", http.FileServer(http.Dir(".")))

	// --- /add エンドポイント ---
	http.HandleFunc("/add", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		name := r.URL.Query().Get("user")
		body := r.URL.Query().Get("message") // 本文を取得

		if name == "" || body == "" {
			http.Error(w, "userとmessageが必要です", 400)
			return
		}

		// INSERT文に body を追加
		_, err := db.Exec("INSERT INTO visitors(name, body) VALUES(?, ?)", name, body)
		if err != nil {
			http.Error(w, "保存に失敗しました", 500)
			return
		}

		fmt.Fprintf(w, "投稿を保存しました")
	})

	// --- /list エンドポイント ---
	http.HandleFunc("/list", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		// SQLでデータを全件取得 (SELECT)
		rows, err := db.Query("SELECT name, body, created_at FROM visitors ORDER BY created_at DESC")
		if err != nil {
			http.Error(w, "取得に失敗しました", 500)
			return
		}
		defer rows.Close()

		posts := []Post{}
		for rows.Next() {
			var p Post
			rows.Scan(&p.Name, &p.Body, &p.CreatedAt)
			posts = append(posts, p)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(posts)
	})
	// --- /delete エンドポイント ---
	http.HandleFunc("/delete", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		// 1. URLから削除したい名前を取得 (?user=名前)
		name := r.URL.Query().Get("user")
		if name == "" {
			http.Error(w, "userパラメータが必要です", http.StatusBadRequest)
			return
		}

		// 2. SQLのDELETE文を実行
		// visitorsテーブルから、nameが一致する行を削除する
		result, err := db.Exec("DELETE FROM visitors WHERE name = ?", name)
		if err != nil {
			http.Error(w, "削除に失敗しました", http.StatusInternalServerError)
			return
		}

		// 3. 実際に何件削除されたか確認
		rowsAffected, _ := result.RowsAffected()

		w.Header().Set("Content-Type", "application/json")
		if rowsAffected == 0 {
			fmt.Fprintf(w, `{"message": "%s さんは見つかりませんでした"}`, name)
		} else {
			fmt.Fprintf(w, `{"message": "%s さんを削除しました"}`, name)
		}
	})

	// --- /search エンドポイント ---
	http.HandleFunc("/search", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		// 1. クエリパラメータ "q" から検索ワードを取得
		query := r.URL.Query().Get("q")
		if query == "" {
			http.Error(w, "検索ワード(q)が必要です", 400)
			return
		}

		// 2. SQLの LIKE 句を使って検索
		// % を付けることで「その文字が含まれるもの」をすべて探します（部分一致）
		searchWord := "%" + query + "%"
		rows, err := db.Query("SELECT name, body, created_at FROM visitors WHERE body LIKE ? ORDER BY created_at DESC", searchWord)
		if err != nil {
			http.Error(w, "検索に失敗しました", 500)
			return
		}
		defer rows.Close()

		posts := []Post{}
		for rows.Next() {
			var p Post
			rows.Scan(&p.Name, &p.Body, &p.CreatedAt)
			posts = append(posts, p)
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(posts)
	})

	fmt.Println("DB版サーバー起動: http://localhost:8080")
	http.ListenAndServe(":8080", nil)
}
