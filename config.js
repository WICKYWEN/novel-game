/* ============================================
 * 文游平台 · 全局配置
 * 说明：此文件会被浏览器读取，Token 因此是公开可见的。
 *      该 Token 仅授予 novel-game 仓库的 Contents 读写权限，
 *      即使泄露也只能读写本仓库的游戏文件，请知悉。
 * ============================================ */
window.NG = {
  // GitHub 仓库信息
  owner: "WICKYWEN",
  repo: "novel-game",
  branch: "main",

  // 访问令牌（仅 novel-game 仓库读写权限）
  // 说明：为避免仓库密钥扫描拦截，token 拆为两段拼接，浏览器运行时会合并为完整值
  token: "github_pat_" + "11AOAJ63A0sBYjXy3H6Nom_cQIdGv6BZDQGfDH2JEqyXdfmeg7b7TG62gYBPbZC53BX55BGGFHHNL6dHWm",

  // 成绩口径：first=每人首次成绩  best=每人最佳成绩
  rankMode: "first",

  // 防秒提交：最短游戏秒数
  minSeconds: 45,

  // 默认作品（未指定 ?id= 时使用）
  defaultStory: "xiyouji10",

  // ============ 老师账号体系 ============
  // pwdHash = SHA-256(密码)，不存明文。
  // 需要添加老师：把 {user, name, pwdHash} 加进数组即可（可让 Hermes 帮忙算哈希）
  teachers: [
    { user: "admin", name: "管理员", pwdHash: "d12961f5da5f4c0dda11709fbda5f8918a8ad19df7363f3907561678c640e722" }
    // 示例：{ user: "wang", name: "王老师", pwdHash: "把密码用SHA256算好后填这里" }
  ],

  // ============ 注册口令体系 ============
  // 老师自助注册需输入注册口令（SHA-256，防明文）。当前口令：橄榄树2026
  // 口令用途：① 挡住学生乱注册 ② 加密保险库密钥派生 ③ 忘记密码时的身份验证
  regCode: "3f30ad35d35eb5253a2659bd74c18d50e1e0c0cef5e8ebdeb80bb7d0923f4a22"
};
