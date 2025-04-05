# sensitive-word-filter-lite

智能敏感词过滤工具，支持上下文识别和白名单机制

## 安装

```bash
npm install sensitive-word-filter-lite
```

## 使用示例

```javascript
const SensitiveFilter = require('sensitive-word-filter-lite');

const filter = new SensitiveFilter({
  keywords: ['3p', 'xxx', '敏感词'],  // 必填：敏感词列表
  replacement: '*',                   // 可选：替换字符，默认为'*'
  strategy: 'strict',                 // 可选：'strict'（严格）或'normal'（普通）
  whitelist: {                        // 可选：白名单配置
    '3p': ['pristine', '3phase']      // 键为敏感词，值为白名单短语数组
  }
});


// 基本过滤
console.log(filter.filter('3p视频'));  // 输出: "**视频"

// 白名单场景
console.log(filter.filter('123pristine'));  // 输出: "123pristine"（不替换）
console.log(filter.filter('3phase电机'));   // 输出: "3phase电机"（不替换）

// 严格模式 vs 普通模式
console.log(filter.filter('3player'));      // 严格模式输出: "3player" // 普通模式输出: "***layer"
// 返回检测到的敏感词数组
console.log(filter.detect('3p视频和xxx内容')); // 输出: ["3p", "xxx"]
// 白名单词不会被检测
console.log(filter.detect('3phase系统'));  // 输出: []
```

## API

### `new SensitiveFilter(options)`
- `options.keywords`: 敏感词数组
- `options.replacement`: 替换字符(默认*)
- `options.strategy`: 匹配策略(strict|normal)
- `options.whitelist`: 白名单对象

### `filter.filter(text)`
过滤文本并返回处理后的结果

### `filter.detect(text)`
过滤文本并返回检测的敏感词数组
