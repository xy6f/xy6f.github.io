---
title: 三次 commit，九个 TODO：我终于摸到 Agent 的骨架了
tags:
  - Agent
  - LLM
  - Function Calling
  - ReAct
  - 学习笔记
createTime: 2026/11/10 21:30:00
permalink: /posts/a1g3nt0x/
---

> 2026 年 11 月 10 日，周二晚上。`finish ex3_all` 刚推上去，提交信息短得像随手打的。

翻了下提交记录，这三天就干了这么点事：

```
0dbb22a  11-08 21:00  finish ex1_1
c2e9fa6  11-09 17:14  finish ex1-ex2
21aa30c  11-10 20:37  finish ex3_all
```

九个文件，全是 `exercises/` 里的代码填空。一开始我真以为就是"把 `...` 换成几行能跑的代码"，做完收工。结果三晚下来，被改掉的不是那九个文件，是我脑子里"AI 在帮我干活"这句话的意思。

顺手记一笔吧。不按知识点的顺序写，按我卡住的顺序写。

---

## 第一晚：一个机器人表情，把我拽进了字节里

`ex_1_1.py` 只要补一个 `count_tokens`。讲义第 3 节说得很清楚：token 不是字、不是词，是介于两者之间的**子词**；BPE 从 UTF-8 字节开始合并，所以中文一个字大约 1～1.5 token，英文一个词大概 1 token，emoji 也常常不止一个。

道理我读的时候点头如捣蒜，翻到脚本底部那段断言才真有实感——那里就摆着 `count_tokens("🤖") >= 1`，还有"同义中文通常 token 数 ≥ 英文"。原来"中文比英文贵"不是一句经验之谈，是能被 `assert` 钉死的。

我写的时候多绕了一圈，没直接 `return len(enc.encode(text))`，而是挨个把 token 解回字节看了一眼：

```python
ids = ENC.encode(text)
for i in ids:
    b = ENC.decode_single_token_bytes(i)
    try:
        pieces.append(repr(b.decode("utf-8")))
    except UnicodeDecodeError:
        pieces.append(f"<bytes {b.hex()}>")
```

那个 `except` 是我自己加的：单个 token 可能只是"半个汉字""半个 emoji"的字节碎片，硬 decode 就会吐乱码。注释里我写了句"显式标成字节"——现在回头看，这大概是三天里第一次**为了让东西看得见**而写代码，而不是为了让它过。

讲义后面那页更吓人：API 按 token 计费，输出通常比输入贵 4～6 倍；上下文窗口也按 token 算，塞满了不是"忘了事"就是 `context_length_exceeded`，再不济还有 Lost in the Middle。所以我数的那一堆小碎片，其实是钱和记忆的单位。

## 第二晚：原来我一直在跟一个没有记忆的人说话

`ex_1_2.py` 的题目叫 System Prompt 切换器，标准答案就是两条消息：

```python
message = [
    {"role": "system", "content": system_prompt},
    {"role": "user", "content": user_message},
]
```

讲义第 2 节把三种角色类比成"岗位说明书 / 客户提问 / 过往回答记录"，还顺手戳破一个我隐约知道、但没认真想过的事实：**LLM 是无状态的**。所谓"它记得我们刚聊过什么"，只是程序把整个 `messages` 又原封不动传了一遍。测试里那句 `"你只能用一个字回答任何问题"` 之所以管用，不是模型听话，是训练阶段就学过"system 里说什么我就照做"。

那题我写跑偏了。明明只要求返回文本，我顺手加了 `stream=True`，逐 chunk 往终端里蹦字，还在第一个 chunk 到来时清行、打一个 `AI: `：

```python
if chunk.choices and chunk.choices[0].delta.content:
    if first:
        print("\r\033[K" + "AI: ", end="", flush=True)
        first = False
    parts.append(chunk.choices[0].delta.content)
```

这段其实属于下一题的活。但看着字一个一个冒出来，"next-token prediction" 突然就不是 PPT 上的名词了——它是一个真的、慢吞吞的、能被 `for chunk in resp` 观察到的过程。跑偏得很值。

`ex_1_3` 就正式接手这件事：`stream_options={"include_usage": True}`，一边拼 `delta.content`，一边等最后一个 chunk 的 `usage.total_tokens`。讲义那句"让模型少说废话，往往比压缩输入更省钱"，配着自己打印出来的 token 数看，比看表格扎心多了。

不过这题我得老实交代两处随性：函数签名写着 `tuple[str, int]`，我 `return` 的是个 list；`if chunk.usage` 也被我写在循环外面，靠"循环结束后变量还在"蒙混过去。测试只查了类型是不是 `str` / `int`，没抓到。**能跑但不够干净**的这个地方，比任何一个报错都值得我记一笔——报错会逼你改，这种不会。

## 让我"啊"出声的，是模型根本不会算 123×456

第 2 章第一题（`ex_2_1.py`）要手搓一遍完整的 Function Calling 消息流：把 `tools=TOOLS` 交给模型 → 它回一串 `tool_calls` → 我用 `execute_calculator(args["expression"])` 真的算 → 把结果用 `role="tool"` + `tool_call_id` 塞回历史 → 再问一次，才拿到最终回答。

讲义第 6 节有句话我抄进了脑子：**"LLM 看不到你函数体里的代码，它只看 schema。"** 所以它从来没算过 123×456，它只是举手说"我想用一下计算器"，真正按下等号的是我的 Python。这个认知一翻转，后面所有东西都顺了：模型负责**决定**，代码负责**发生**。

讲义还列了三个坑，全是新手会踩的：调工具时 `assistant.content` 经常是 `None`（别以为模型死了）；带 `tool_calls` 的那条 assistant 消息必须原样追加回去（漏了模型就原地踏步重新决策）；`tool_call_id` 必须和调用严格一对一。我填那行 `messages.append({"role": "tool", "content": result, "tool_call_id": tool_call.id})` 的时候，第一次觉得 messages 不是聊天记录，是一份**状态**。

`ex_2_2` 的 `MiniToolRegistry` 则把这件事变轻了：

```python
self._tools[func.__name__] = func
return func                      # 装饰器只是登记，原函数照还
...
return self._tools[name](**args) # 一行分发
```

`inspect.signature` 读参数名和类型注解，查一张 `str→"string"`、`int→"integer"` 的映射表，没默认值就进 `required`——那 30 行手写 schema JSON 就这么被省掉了。

有意思的是个**小分歧**：练习里把 `func.__doc__` 直接拿去当 schema 的 `description`，可讲义第 7 节专门写了段取舍，说工业版故意不读 docstring，要显式写一份给 LLM 看的说明——因为 docstring 是写给人看的，而模型需要知道的是"什么时候该用我"。我在这道题上停得最久，不是因为难，是第一次意识到：**注释也可能是接口**。教学版为了少一个填空可以偷懒，真做 Agent 时这句偷懒会变成模型乱调工具。

到 `ex_2_3`，核心就两行：

```python
if not msg.tool_calls:
    return msg.content
for tc in msg.tool_calls:
    ...
```

讲义第 8 节特意强调：退出条件**只看 `tool_calls` 是不是空**，别去 content 里找有没有"完成"两个字，那是协议保证的。还有那个 `max_iterations=5` 的兜底——"永远要有刹车"，否则模型卡在「调工具→失败→再调一遍」里，能把 API 额度烧干净。

`Agent = LLM + Tools + Loop`。这句话我第一天就看见了，当时当口号；把这三十行敲完才敢点头。讲义说 Cursor、Claude Code 每次干活跑的都是同一个循环，复杂的不是循环，是循环里要协调的东西——这句我现在信了。

## 第三晚：给同一个模型换了三顶帽子

第 3 章有点"坏"：刚学会结构化的 `tool_calls`，`ex_3_1` 又让我回去手写正则，从 `Thought: / Action: / Action Input:` 的自由文本里抠字段。

```python
m = re.search(r"Action:\s*(.*?)(?=\n\s*(?:Thought:|Action:|Action Input:)|\Z)", text, re.DOTALL)
m = re.search(r"Action Input:\s*(.*)\Z", text, re.DOTALL)
```

测试二故意让模型在 `Thought` 前面多说一句"好的，让我想想"，就为了看解析会不会崩。讲义第 10 节揭了底：ReAct 是 2022 年的范式，早于 Function Calling，那时候全靠 prompt 约定 + 正则，讲义还列了四类崩法（多说一句、参数里带引号、Action 换行、流式截断）。**先让你亲手体会一次"模型不规矩就崩"，才明白第 2 章那个字段有多香。** 我确实吃这套教学顺序。

`ex_3_2` 的 Planner 更像在跟模型谈判。system prompt 里我一条条写：拆成 3-6 步、按执行顺序、只输出一个 JSON 数组、不要解释也不要 Markdown 代码块，还附了个示例。而题目里已经替我写好了剥掉 json 代码块外壳的那串 `removeprefix` 清洗——老师显然也知道模型会不老实。讲义第 11 节说得直白：Planner 最容易翻车的就是输出不结构化，工业版得上 structured output / pydantic，执行中发现计划跟现实对不上还得 Replan。我补的那句 `json.loads(clean)` 只有一行，前提却是前面整段 prompt 的约束都成立。

最上头的是 `ex_3_3`。同一个模型，换个 system prompt 就换成三个人：作者、评审员、修订者。评审员那条我写得最啰嗦，因为格式不是给人看的：

> 第一行只写 PASS 或 FAIL；从第二行开始再写意见；不要在第一行添加任何其他文字或标点。

不为好看，是为了底下 `text.split("\n")[0]` 能解出一个 bool——**格式约定就是闭环的地基**。修订者那条也特意加了"保留原稿中合理的部分""不要另起炉灶重写"，不然一轮下来等于重新生成，前面的评审白跑。

讲义第 12 节管 Reflection 叫"包装层"：它不换底层 Agent，套在任何 loop 外面都能升级一次质量。里面还有个挺损的 trick——"假设你是一个挑剔的高级工程师，你必须找出至少 3 个可以改进的地方"，因为模型对自己刚写的东西太宽容，第一次评审常常直接 PASS。我看到这儿笑了一下，这不就是我改自己文章时的样子吗。

三种范式怎么记，讲义给了个我挺喜欢的比方：第 2 章那个 loop 是**底盘**，ReAct 是走一步看一步的巡航，Plan-and-Solve 是先开导航，Reflection 是到终点前再绕一圈复核。底盘没变，变的只是 prompt 怎么写、循环怎么组织。

---

## 先存个档：我目前的理解

- 模型不执行任何东西，它只**请求**；`tool` 消息把现实塞回给它，它才继续想。
- prompt 不是"话术"，是接口；`第一行只写 PASS`、`只输出 JSON 数组` 这种看着矫情的约束，其实是程序能解析的前提。
- 循环不难，难的是**刹车**和**退出判据**。上限、异常兜底、`tool_calls` 为空，三样少一样都能跑飞。
- 还有一条讲义里的因果链，我到现在才串起来：messages 每轮全量传 → 迟早撑爆窗口 → 所以第 4 章要做上下文压缩和记忆。原来后面几章不是新功能，是这个循环自己长出来的需求。

顺带一个小发现：练习文件头还标着"知识点：第 12 节《ReAct 范式》""第 14 节《Reflection》"，讲义现在排到第 10、12 节了。按编号找会扑空，按标题找才靠谱（估摸着是练习沿用旧编号）。这种小错位，也算自己一行行对照过的证据。

## 还没动的部分，留个坑

`ex_1_3` 那个 list / tuple 和 usage 的位置，下次顺手收拾掉。第 4 章的三道题（上下文压缩、向量记忆、压缩决策器）一行没碰，`my-agent/` 里的 `llm.py`、`tools.py`、`agent.py` 我还没动过——这次补的只是 `exercises/` 的填空，把零件搬进一个真正能跑的 Agent 里，是下一件事。

另外挺想试一下讲义那个"必须挑出 3 个问题"的 trick：给 `review` 加上，看看 PASS 率会不会塌下来，以及塌下来之后改出来的稿子是不是真的更好。`max_rounds=3` 值不值那大约翻倍的 token，也得自己跑一次才有发言权。

等把 `context.py`、`memory.py` 补完，再回来写第二篇。

---

## 我这几天翻的东西

我改过的九个文件，和它们对应的讲义（练习仓库：[xy6f/vibe-agent-exercise](https://cnb.cool/xy6f/vibe-agent-exercise)，讲义总入口：[vibe-agent-course](https://cnb.cool/opencamp/learning-agent/vibe-agent-course)）：

| 我补的文件 | 对应讲义 | 卡住我的那个点 |
| --- | --- | --- |
| `ex_1_1.py` | 第 3 节 [Token、上下文窗口与成本](https://cnb.cool/opencamp/learning-agent/vibe-agent-course/-/blob/main/01-meet-your-ai/lecture/03-tokens-and-context.md) | token 是字节合并出来的子词，不是字 |
| `ex_1_2.py` | 第 2 节 [提示词与角色](https://cnb.cool/opencamp/learning-agent/vibe-agent-course/-/blob/main/01-meet-your-ai/lecture/02-prompts-and-roles.md) | 模型无状态，`system` 是岗位说明书 |
| `ex_1_3.py` | 第 1 节逐 token 生成 + 第 3 节计费 | `include_usage` 的最后一个 chunk |
| `ex_2_1.py` | 第 6 节 [Function Calling 协议](https://cnb.cool/opencamp/learning-agent/vibe-agent-course/-/blob/main/02-tools-and-agent-loop/lecture/06-function-calling.md) | 四条消息 + `tool_call_id` 一对一 |
| `ex_2_2.py` | 第 7 节 [ToolRegistry](https://cnb.cool/opencamp/learning-agent/vibe-agent-course/-/blob/main/02-tools-and-agent-loop/lecture/07-tool-registry.md) | docstring 能不能当 description |
| `ex_2_3.py` | 第 8 节 [最小 Agent Loop](https://cnb.cool/opencamp/learning-agent/vibe-agent-course/-/blob/main/02-tools-and-agent-loop/lecture/08-agent-loop.md) | 只看 `tool_calls`，永远要有刹车 |
| `ex_3_1.py` | 第 10 节 [ReAct](https://cnb.cool/opencamp/learning-agent/vibe-agent-course/-/blob/main/03-agent-patterns/lecture/10-react.md) | 模型多说一句，正则就崩 |
| `ex_3_2.py` | 第 11 节 [Plan-and-Solve](https://cnb.cool/opencamp/learning-agent/vibe-agent-course/-/blob/main/03-agent-patterns/lecture/11-plan-and-solve.md) | 规划必须结构化才拿得到 |
| `ex_3_3.py` | 第 12 节 [Reflection](https://cnb.cool/opencamp/learning-agent/vibe-agent-course/-/blob/main/03-agent-patterns/lecture/12-reflection.md) | 第一行只写 PASS 或 FAIL |

章节页也顺手留一下：[第 1 章](https://cnb.cool/opencamp/learning-agent/vibe-agent-course/-/tree/main/01-meet-your-ai) · [第 2 章](https://cnb.cool/opencamp/learning-agent/vibe-agent-course/-/tree/main/02-tools-and-agent-loop) · [第 3 章](https://cnb.cool/opencamp/learning-agent/vibe-agent-course/-/tree/main/03-agent-patterns)。

> 这几天翻别人的学习笔记，发现把"我哪儿卡住了"写在前面，比"注意事项：……"好读太多，知识点反倒更容易记住。所以这篇就按卡住的顺序来了。

三次 commit 的 message 一个比一个敷衍，但 11 月 8 日晚上那个 🤖，和 11 月 10 日晚上那行 `PASS`，是我这三天最实的两个收获。
