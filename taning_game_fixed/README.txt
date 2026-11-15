项目文件结构

index.html
data.js
audio/
  Night_Video_1.mp3
  Night_Video_2.mp3
  Night_Video_3.mp3
  Night_Video_4.mp3
  Night_Video_5.mp3
  Night_Video_6.mp3
characters/
  taning.js
  taning_fight_load.js

电话录音说明
- 将每晚的录音放进 audio 文件夹。
- 文件名固定为 Night_Video_夜晚编号.mp3，例如 Night_Video_1.mp3、Night_Video_6.mp3。
- 当前统一使用 MP3 格式。
- 对应夜晚没有录音文件时，游戏会自动只显示 data.js 中的字幕，不会报错，也不会阻止游戏开始。
- 有录音文件时会播放录音，同时显示字幕。
- 若浏览器不支持该文件或播放失败，也会自动退回字幕模式。

运行方式：将整个文件夹放在同一目录结构下，用浏览器打开 index.html。建议通过本地静态服务器运行，避免浏览器对本地文件脚本/音频的限制。


【塔宁监控显示与移动修正】
- 修正右侧墙面控制板：恢复锚定在右侧，不再错误定位到左侧。
- 塔宁监控角色节点在显示时显式启用 visibility/display，隐藏时同步关闭，避免像素画布存在但节点不可见。
- 3、4号走廊摄像头继续使用 MOVE_HALL 状态和 taning-moving 动画；AI 路线、计时与攻击规则未更改。
- 已使用 Node.js 检查 taning.js、tannin_pixel.js、taning_fight_load.js 及主 HTML 内联脚本语法。
