# 1. ビルド用の環境（Goが入っているイメージ）
FROM golang:1.25

# 2. コンテナ内での作業ディレクトリ
WORKDIR /app

# 3. 必要なファイルをコピーしてライブラリをインストール
COPY go.mod go.sum ./
RUN go mod download

# 4. ソースコードをコピー
COPY . .

# 5. Goのアプリをビルド
RUN go build -o main .

# 6. サーバーを起動
CMD ["./main"]