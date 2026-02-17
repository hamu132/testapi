"use client";

import { useState, useEffect } from "react";

type Post = {
  id: number;
  name: string;
  body: string;
  created_at: string;
  heart: number; // いいね数を追加
};

export default function Home() {
  const [posts, setPosts] = useState<Post[]>([]); // 投稿データを保存する「状態」
  const [loading, setLoading] = useState(true);   // 読み込み中かどうか

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const [query, setQuery] = useState("");// 検索クエリの状態

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
  const deletePost = async (id: number) => {
    try {
      await fetch(`https://stunning-fortnight-jj46xq76xj763px5g-8080.app.github.dev/delete?id=${id}`);
      fetchPosts(); // 投稿を削除した後、最新の投稿一覧を取得
    } catch (error) {
      console.error("投稿の削除に失敗しました", error);
    }
  };

  // 2. 検索用の関数（Goの /search エンドポイントを叩く）
  const searchPosts = async (q: string) => {
    setLoading(true);
    try {
      // クエリが空なら全件取得、あれば検索
      const url = q 
        ? `https://stunning-fortnight-jj46xq76xj763px5g-8080.app.github.dev/search?q=${q}`
        : `https://stunning-fortnight-jj46xq76xj763px5g-8080.app.github.dev/list`;
        
      const res = await fetch(url);
      const data = await res.json();
      setPosts(data);
    } catch (error) {
      console.error("検索に失敗しました", error);
    } finally {
      setLoading(false);
    }
  };

  const handleHeart = async (id: number) => {
    const res = await fetch(`https://stunning-fortnight-jj46xq76xj763px5g-8080.app.github.dev/heart?id=${id}`);
    const data = await res.json();
    
    // 1つだけ投稿を更新するか、全体を再読み込み
    fetchPosts(); 
  };


  // 画面が開いたときに一回だけ実行（単にfetchPosts()だと無限に再レンダリングする）
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
      {/* 検索窓 */}
      <div className="mb-6">
        <input 
          type="text"
          placeholder="投稿を検索..."
          className="w-full p-3 border rounded-full bg-white text-black shadow-sm focus:ring-2 focus:ring-blue-400 outline-none"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            searchPosts(e.target.value); // 入力されるたびに検索実行！
          }}
        />
      </div>
      {/* 投稿フォーム */}
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
              <div className="mt-4 flex gap-4">
                <button 
                  className="text-sm text-red-400 hover:text-red-600 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                  onClick={() => {
                    if (window.confirm("この投稿を削除してもよろしいですか？")) {
                      deletePost(post.id);
                    }
                  }}
                  title="投稿を削除"
                >
                  削除
                </button>
                <button 
                  className="text-sm text-blue-400 hover:text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                  onClick={() => handleHeart(post.id)}
                  title="いいね！"
                >
                  ❤️ {post.heart}
                </button>
              </div>
            </div>
          ))}
          {posts.length === 0 && <p>投稿がありません。</p>}
        </div>
      )}
    </main>
  );
}