/* ============================================
 * 文游平台 · 规则引擎生成器
 * 功能：把老师粘贴的小说文本，自动切成段落、自动出题、
 *       自动生成五档结局的互动游戏剧本（story.json 格式）
 * 纯前端 JS，零依赖、零密钥。
 * ============================================ */
window.NGGen = (function(){

  /* ---------- 工具 ---------- */
  function escId(s){
    // 生成安全的作品 id：g + 时间戳（纯字母数字，URL友好）
    return "g" + Date.now().toString(36);
  }

  function splitSentences(text){
    // 按中文标点切句
    return text.split(/[。！？；\n]+/).map(s=>s.trim()).filter(s=>s.length >= 6);
  }

  function splitParagraphs(text){
    // 按空行/换行切段，过滤过短段落
    return text.split(/\n\s*\n|\n+/).map(s=>s.trim()).filter(s=>s.length >= 15);
  }

  /* ---------- 生成剧本 ---------- */
  function generate(opts){
    const { title, chapters, book, text, author, minSeconds } = opts;
    const paras = splitParagraphs(text).slice(0, 25);  // 最多25段
    if(paras.length < 3) throw new Error("文本太短，至少需要3个段落（建议粘贴完整章节）");

    // 全局句子池（用于生成干扰项）
    const allSents = [];
    paras.forEach(p=>{ splitSentences(p).forEach(s=>allSents.push(s)); });

    const nodes = {};
    const storyId = escId(title);

    // 每段生成一个"阅读+出题"节点
    paras.forEach((p, i)=>{
      const nid = "n" + (i+1);
      // 段落文本按句子切成显示段（最多3屏）
      const sents = splitSentences(p);
      const textArr = [];
      let buf = "";
      for(const s of sents){
        if((buf + s).length > 90){ textArr.push(buf); buf = s; }
        else { buf = buf ? buf + s : s; }
      }
      if(buf) textArr.push(buf);
      if(!textArr.length) textArr.push(p.slice(0, 80));

      // 题目：正确选项 = 段落第一句（关键信息）；干扰项 = 其他段落句子
      const correctSent = sents[0] || p.slice(0, 20);
      const others = allSents.filter(s=> s !== correctSent && !p.includes(s));
      // 打乱取2个干扰项
      const shuffled = others.sort(()=>Math.random()-0.5);
      const distract1 = shuffled[0] || "这段内容我好像没读到过";
      const distract2 = shuffled[1] || "这跟故事情节对不上啊";
      const opts2 = [
        { text: truncate(correctSent, 26), next: nextId(i, paras.length), depth: 2 },
        { text: truncate(distract1, 26), next: "d" + (i+1) + "a", depth: 0 },
        { text: truncate(distract2, 26), next: "d" + (i+1) + "b", depth: 0 }
      ];
      // 打乱选项顺序（正确项位置随机）
      shuffle(opts2);

      nodes[nid] = {
        scene: "阅读 · 第" + (i+1) + "段",
        title: "第" + (i+1) + "段 · " + truncate(p, 14),
        text: textArr,
        choices: opts2
      };

      // 走偏节点：选了干扰项后的过渡（简短，随即回到主线下一段）
      nodes["d" + (i+1) + "a"] = {
        scene: "阅读 · 第" + (i+1) + "段",
        title: "再想想",
        text: ["这个答案不太对——书里好像不是这样写的。", "你重新回想了一下刚才读到的内容。"],
        next: nextId(i, paras.length)
      };
      nodes["d" + (i+1) + "b"] = {
        scene: "阅读 · 第" + (i+1) + "段",
        title: "好像不对",
        text: ["这和你读到的情节对不上。", "带着疑问，你继续往下读。"],
        next: nextId(i, paras.length)
      };
    });

    // 最后一题后进入结局判定
    const lastNid = "n" + paras.length;
    nodes[lastNid].choices.forEach(c=>{
      if(c.next === nextId(paras.length-1, paras.length)){
        c.next = "route1";
      }
    });
    nodes["d" + paras.length + "a"].next = "route1";
    nodes["d" + paras.length + "b"].next = "route1";

    // 结局判定节点：按答对比例分五档
    const totalQ = paras.length;
    const p90 = Math.ceil(totalQ * 1.8);   // 90% 对 → 天光
    const p70 = Math.ceil(totalQ * 1.4);   // 70% → 星火
    const p50 = Math.ceil(totalQ * 1.0);   // 50% → 回响
    const p30 = Math.ceil(totalQ * 0.6);   // 30% → 尘路
    nodes["route1"] = {
      scene: "终章",
      title: "结局",
      text: ["你合上了书，故事在心里留下了回响。"],
      route: {
        map: [
          { min: p90, next: "e1" },
          { min: p70, next: "e2" },
          { min: p50, next: "e3" },
          { min: p30, next: "e4" },
          { next: "e5" }
        ]
      }
    };

    // 五档结局（中性名，隐藏分数）
    const endings = {
      e1: { name: "天光", tier: "hidden", score: 100,
        text: "你读得细致，记得牢靠，每个关键之处都了然于心。这道光，是你认真阅读挣来的。" },
      e2: { name: "星火", tier: "insight", score: 85,
        text: "大部分内容你都读懂了，只有个别细节记得模糊。星星之火，已足以照亮这本书。" },
      e3: { name: "回响", tier: "understand", score: 60,
        text: "故事的大致脉络你抓住了，但一些关键细节还需要再读一遍。书页翻过，余音仍在。" },
      e4: { name: "尘路", tier: "surface", score: 35,
        text: "你读得有些匆忙，不少内容只剩模糊的影子。再翻一遍，会看到更多风景。" },
      e5: { name: "浮云", tier: "absurd", score: 10,
        text: "书页在眼前飘过，像云一样散开了。建议你静下心来，从头再读一次。" }
    };
    for(const k in endings){
      nodes[k] = { scene:"终章", title: endings[k].name, text:[endings[k].text], ending: k };
    }

    const meta = {
      title: title || "未命名作品",
      book: book || title || "",
      chapters: chapters || "",
      version: "1.0",
      playMinutes: Math.max(8, Math.round(totalQ * 0.9)),
      welcome: "认真读过的文字，会在选择中闪闪发光。故事开始了——",
      footer: "本游戏由文本自动生成，仅供课堂阅读检测使用"
    };

    return {
      id: storyId,
      title: meta.title,
      book: meta.book,
      chapters: meta.chapters,
      desc: "自动生成 · " + totalQ + "段 · " + author,
      author: author || "",
      story: {
        meta, startNodeId: "n1", endings, nodes
      }
    };
  }

  /* ---------- 小工具 ---------- */
  function nextId(i, total){ return i+1 < total ? "n" + (i+2) : "route1"; }
  function truncate(s, n){ s = String(s||""); return s.length > n ? s.slice(0,n) + "…" : s; }
  function shuffle(a){ for(let i=a.length-1;i>0;i--){ const j=Math.floor(Math.random()*(i+1)); [a[i],a[j]]=[a[j],a[i]]; } return a; }

  return { generate, escId };
})();
