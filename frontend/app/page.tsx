"use client";

import { useState, useEffect } from "react";

type Post = {
  name: string;
  body: string;
  created_at: string;
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]); // 投稿データを保存する「状態」
  const [loading, setLoading] = useState(true);   // 読み込み中かどうか

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  
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
  
  const handlePost = async () => {
    if (!name || !message) return alert("名前とメッセージを入力してください");

    await fetch(`https://stunning-fortnight-jj46xq76xj763px5g-8080.app.github.dev/add?user=${name}&message=${message}`);
    
    // 投稿後にStateを空にする（これで入力欄が勝手に清掃される！）
    setName("");
    setMessage("");
    fetchPosts();
  };

  return (
    <main className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8 text-blue-600">すごいSNS</h1>

      <div className="mb-10 p-6 bg-gray-50 rounded-xl border border-gray-200 shadow-md">
        <div className="flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="名前" 
            className="p-3 border rounded-lg text-black focus:ring-2 focus:ring-blue-400 outline-none"
            value={name} // Stateを紐付け
            onChange={(e) => setName(e.target.value)} // 入力されたらStateを更新
          />
          <textarea 
            placeholder="今なにしてる？" 
            className="p-3 border rounded-lg text-black h-24 focus:ring-2 focus:ring-blue-400 outline-none"
            value={message} // Stateを紐付け
            onChange={(e) => setMessage(e.target.value)} // 入力されたらStateを更新
          />
          <button 
            onClick={handlePost}
            className="bg-blue-500 text-white font-bold py-3 rounded-lg hover:bg-blue-600 transition-all disabled:bg-gray-300"
            disabled={!name || !message} // 入力がない時はボタンを無効化
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