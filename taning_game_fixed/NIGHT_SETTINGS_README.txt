裂隙余烬 - 夜晚设定与名称说明

文件分工
- night-settings.js：实际游戏使用的夜晚设置。每一夜的角色 AI 数值和该夜特殊时间事件统一放在同一个夜晚对象中。
- NIGHT_SETTINGS_README.txt：只负责说明角色 ID、角色中文名、AI 规则，以及特殊事件 ID / type 的含义。

一、角色 ID 与人物名字

gildedEleven = 十一
flux          = 闪流
noka          = 诺卡
tannin        = 塔宁
lobe          = 耳机
gu            = 孤
chillo        = 寒零
cosmo         = 小宇宙
transfer      = 移交
deadin        = 死入
split         = 沦陷
yu            = 煜
guard         = 午安（玩家角色）

二、每夜角色 AI 数值规则
- 每个夜晚都必须列出上面全部 13 个角色 ID，不能省略。
- 每个角色 ID 后面都必须有一个数字。
- 0 = 这个夜晚不出动。
- 1-20 = 这个夜晚出动，数字越大，行动判定成功率越高；20 是最高等级。
- AI=0 时不出场、不行动。
- AI 数值不直接决定移动速度；角色多久检查一次行动，由角色自己的行动间隔机制决定。
- 本项目采用自定义概率曲线：AI 1-11 每级增加 5%；AI 12=90%、13=92%、14=94%、15=95%、16=96%、17=97%、18=98%、19=99%、20=100%。
- 被划掉、不执行的角色：gildedEleven、noka、lobe、split、yu、guard；每夜均保留 ID 并填写 0。
- 死入是电话 / 磁带角色，不作为普通移动敌人；每夜填写 0。
- 死入是电话 / 磁带角色，不作为普通移动敌人；他的数值仍按夜晚名单格式填写，当前配置为 0。
- 午安是玩家角色，不作为敌方 AI；他的数值仍按夜晚名单格式填写，当前配置为 0。

三、特殊时间事件名称说明
特殊时间事件与角色 AI 设置放在 night-settings.js 对应夜晚的同一个对象内。每个事件包含 id、at、type。

id = 事件的唯一标识；at = 游戏内触发时间（00:00-08:00）；type = 事件类型 / 程序识别名称。

目前第六夜事件：
all-return
  时间：05:30
  type：all_except_eleven_return_to_start
  含义：除十一以外的其他人偶回到原位。

eleven-awakens
  时间：05:40
  type：eleven_activates
  含义：十一开始行动。

eleven-turns
  时间：07:30
  type：eleven_changes_direction_toward_deadin
  含义：十一改变方向，朝死入所在地点移动。

line-impact
  时间：07:45
  type：nearby_line_impact
  含义：十一撞击死入附近线路，引发线路 / 设备故障。

call-cut
  时间：07:56
  type：deadin_call_disconnects
  含义：死入的电话通讯中断。

四、如何修改
在 night-settings.js 中找到对应夜晚，例如：

3: makeNight({
  gildedEleven: 0,
  flux: 5,
  noka: 0,
  tannin: 20,
  lobe: 0,
  gu: 0,
  chillo: 0,
  cosmo: 0,
  transfer: 3,
  deadin: 0,
  split: 0,
  yu: 0,
  guard: 0
})

上例表示第三夜：闪流 AI 5、塔宁 AI 20、移交 AI 3；其余角色为 0。

注意：当前项目中实际接入的角色 AI 行动逻辑仍以游戏代码已有实现为准。夜晚配置表负责保存每夜数值和派发夜晚 / 特殊事件，不会自动创造尚未实现的角色 AI 或角色模型。
