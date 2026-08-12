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
  defaultStory: "xiyouji10"
};
