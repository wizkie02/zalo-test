##Build Docker Image:

###Mở terminal tại thư mục chứa Dockerfile và chạy lệnh:

docker build -t zalo-server .
Chạy Docker Container:

###Sau khi build xong, bạn có thể chạy container bằng lệnh:

docker run -p 3000:3000 zalo-server


## Push to docker hub

docker build -t zalo-server .
docker tag zalo-server cangphamdocker/zalo-server:latest
docker push cangphamdocker/zalo-server:latest