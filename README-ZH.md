# Fiora-App

语言: [English](https://github.com/yinxin630/fiora-app/blob/master/README.md) | [简体中文](https://github.com/yinxin630/fiora-app/blob/master/README-ZH.md)

这是 Fiora(https://fiora.suisuijiang.com/) 的 APP 客户端, 基于 react-native 和 expo, 支持安卓和iOS

## Android

点击链接或者扫码下载APK

[https://cdn.suisuijiang.com/fiora.apk](https://cdn.suisuijiang.com/fiora.apk)

![](https://cdn.suisuijiang.com/fiora/img/android-apk.21accdc3.png)

## iOS

1. Apple Store 搜索 expo 并下载 Expo Client
2. 打开 expo, 并使用碎碎酱的 expo 账号登录(suisuijiang / fiora123456)
3. 登录成功后点击 fiora 启动应用

![](https://cdn.suisuijiang.com/ImageMessage/5adad39555703565e7903f78_1528384800528.png?width=850&height=644)

## 连接个人搭建的服务端

编辑这处代码 https://github.com/yinxin630/fiora-app/blob/master/src/socket.js#L6 , 修改为你的服务端地址   

安卓直接编译成 apk 即可, 参考: https://docs.expo.io/versions/latest/distribution/building-standalone-apps/   
ios有开发者证书的话可以编译成 ipa, 参考安卓编译文档. 没证书的话就像我一样发到 expo 上, 然后共享 expo 账号来访问
