// 判断字符是否是字母或数字
function isAlphanumeric(char) {
  return /[a-zA-Z0-9]/.test(char);
}

// 创建敏感词的正则表达式
function createWordRegExp(word, strict = false) {
  return strict
    ? new RegExp(`(^|\\W)${word}(\\W|$)`, 'gi')  // 严格模式，作为独立单词
    : new RegExp(word, 'gi');                    // 普通模式，简单包含
}

module.exports = {
  isAlphanumeric,
  createWordRegExp
};
