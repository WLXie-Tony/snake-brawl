# 蛇蛇乱斗 App（iOS 和 Android）

这个文件夹把网页版游戏（上一层的 index.html）用 Capacitor 8 打包成 iOS 和 Android 原生 App。游戏文件装在 App 里面，离线也能玩单机；联机和网页版互通，只要版本一样。

在 GitHub 上，它是仓库 WLXie-Tony/snake-brawl 里的 app 文件夹；仓库最上层是网页版（GitHub Pages 发布的就是那几个文件），跟你电脑上 snake 文件夹的结构一样。

上架的完整步骤见 [上架指南.md](上架指南.md)。

## 文件夹里有什么

- `app.config.json`：App 的设置，改这里就行，不用碰代码：
  - `api`：服务器网址（和网页版 index.html 里的 snake-api 一样）
  - `admob`：AdMob 的应用 ID 和两个广告单元（激励、插屏），iOS 和安卓各一套；`test` 为 true 时只显示 Google 的测试广告（不赚钱），上架的正式版要改成 false
  - `revenuecat`：RevenueCat 的公开 SDK 密钥（`appl_` 和 `goog_` 开头，不是秘密）
  - `trackingText`：iPhone 问「是否允许跟踪」时的说明文字，六种语言
- `www/`：装进 App 的游戏文件，由 `npm run game` 从上一层复制过来。`app-config.js`（由 app.config.json 生成）和 `native.js`（原生插件打包）是自动生成的，不进 GitHub
- `native/entry.js`：游戏要用的原生插件：广告（AdMob）、内购（RevenueCat）、本地提醒、分享、文件、返回键
- `android/`：Android 工程（目标 API 36，最低 Android 7.0）
- `ios/`：Xcode 工程（iOS 15 以上，只支持 iPhone）。界面语言：简体中文、英语、西班牙语、葡萄牙语（巴西）、日语、韩语
- `assets/`：图标和启动画面的原图，改了以后运行 `npm run icons` 重新生成各尺寸
- 打包流程在上一层的 `.github/workflows/`（android.yml、ios.yml），因为 GitHub 只认仓库最上层的这个文件夹。在 GitHub 的服务器上打包，不需要自己的 Mac。app 文件夹有改动推上去，安卓包会自动重新打，iOS 会自动检查能不能编译
- 安卓上传密钥不在这个文件夹里，在旁边的 app-signing 文件夹（故意分开放，免得跟着 app 传上 GitHub）
- `scripts/`：复制游戏、套用设置、打包插件、改名、iOS 工程设置的小脚本
- `store/`：上架材料。listing.md 是商店文案（中、英、西、葡、日、韩）和内购商品表，privacy.html 是隐私政策网页，app-ads.txt 是 AdMob 要的授权文件模板，还有商店图标、Google Play 置顶大图，screenshots 里是六种语言的截图（iPhone 1320×2868，安卓 1080×1920，每种语言 6 张；截图不进 GitHub 仓库）
- `capacitor.config.json`：App ID（com.wenlanxie.snakebrawl）、名字、背景色等

## 常用命令（需要先装 Node.js 22，然后在这个文件夹运行 npm install）

- `npm run game`：把上一层的 index.html 复制进 www，并套用 app.config.json
- `npm run sync`：复制游戏、套用设置、打包插件，再同步到 iOS 和 Android 工程
- `npm run rename -- "新名字"`：改 App 在手机桌面上显示的英文名（其他语言也一起改；中文名在 android/app/src/main/res/values-zh/strings.xml 和 ios/App/App/zh-Hans.lproj/InfoPlist.strings）
- `npm run icons`：从 assets 里的原图重新生成全部图标和启动画面

GitHub 上的打包流程每次都会自己运行套用设置和打包插件这两步，所以改了 app.config.json 只要推上去就行，安卓包会自动重新打。

## App 版和网页版的区别

同一个 index.html，游戏检测到自己在 App 里时会：

- 显示广告：看广告领奖励（结算翻倍、免费金币宝箱、复活、每日礼物翻倍）和局后的插屏，次数和间隔由服务器的远程设置控制。网页版没有广告
- 有商店：用苹果和 Google 的内购买金币包、新手礼包、去广告和高级通行证。网页版没有用钱买的东西，所有物品都用金币解锁
- 可以打开每日提醒（本地通知，不经过服务器）
- 邀请链接指向网页版，没装 App 的朋友点开就能进房间
- 安卓返回键：先关掉打开的面板；对局中按两次才退出；大厅里按返回键是切到后台，不会直接关掉 App

所有玩家看到的昵称都会过滤常见的脏话（网页版也一样）。
