"use client"; // ブラウザで動くコードであることを宣言

import { useState, useEffect } from "react";

// データの型を定義（Goの構造体と同じにする）
type Post = {
  name: string;
  body: string;
  created_at: string;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]); // 投稿データを保存する「状態」
  const [loading, setLoading] = useState(true);   // 読み込み中かどうか

  // APIからデータを取得する関数
  const fetchPosts = async () => {
    try {
      // APIのURLは、自分のCodespacesのURLに置き換えてください
      // 末尾に /list をつけるのを忘れずに！
      const res = await fetch("https://stunning-fortnight-jj46xq76xj763px5g-8080.app.github.dev/list");
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("データの取得に失敗しました", error);
    } finally {
      setLoading(false);
    }
  };

  // 画面が開いたときに一回だけ実行
  useEffect(() => {
    fetchPosts();
  }, []);
  // frontend/src/app/page.tsx の return 部分を以下のように改造

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">すごいSNS</h1>

      {/* 投稿フォーム */}
      <div className="mb-10 p-6 bg-gray-50 rounded-xl border border-gray-200">
        <div className="flex flex-col gap-4">
          <input 
            type="text" 
            id="name-input"
            placeholder="名前" 
            className="p-2 border rounded text-black"
          />
          <textarea 
            id="body-input"
            placeholder="今なにしてる？" 
            className="p-2 border rounded text-black"
          />
          <button 
            onClick={async () => {
              const name = (document.getElementById('name-input') as HTMLInputElement).value;
              const body = (document.getElementById('body-input') as HTMLTextAreaElement).value;
              
              // GoのAPIを叩く
              await fetch(`https://stunning-fortnight-jj46xq76xj763px5g-8080.app.github.dev/add?user=${name}&message=${body}`);
              
              // 投稿後に再読み込み
              fetchPosts();
              
              // 入力欄をクリア
              (document.getElementById('name-input') as HTMLInputElement).value = "";
              (document.getElementById('body-input') as HTMLTextAreaElement).value = "";
            }}
            className="bg-blue-500 text-white font-bold py-2 rounded hover:bg-blue-600 transition"
          >
            投稿する
          </button>
        </div>
      </div>

      {/* 投稿一覧表示（ここはさっきと同じ） */}
      {loading ? (
        <p>読み込み中...</p>
      ) : (
        <div className="space-y-4">
          {posts.map((post, index) => (
            <div key={index} className="border p-4 rounded-lg shadow-sm bg-white text-black">
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">{post.name}</span>
                <span className="text-sm text-gray-500">{post.created_at}</span>
              </div>
              <p className="text-gray-800">{post.body}</p>
            </div>
          ))}
          {posts.length === 0 && <p>投稿がありません。</p>}
        </div>
      )}
    </main>
  );
}