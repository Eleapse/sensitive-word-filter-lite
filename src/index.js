const Trie = require('./trie');

class SensitiveFilter {
  constructor(options = {}) {
    this.replacement = options.replacement || '*';
    this.strategy = options.strategy || 'strict'; // strict|normal
    this.whitelist = options.whitelist || {};

    // 使用Trie树存储敏感词
    this.trie = new Trie();
    (options.keywords || []).forEach(word => this.addWord(word));
  }

  addWord(word) {
    this.trie.insert(word.toLowerCase());
  }

  isWhitelisted(word, text) {
    const allowed = this.whitelist[word.toLowerCase()];
    return allowed && allowed.some(term => text.toLowerCase().includes(term.toLowerCase()));
  }

  filter(text) {
    const matches = this.trie.search(text.toLowerCase(), this.strategy === 'strict');
    let result = text;
    let offset = 0;

    for (const match of matches) {
      const originalWord = text.substr(match.start, match.end - match.start + 1);

      if (this.isWhitelisted(originalWord, text)) {
        continue;
      }

      // 使用节点存储的原始长度
      const replaceLength = this.trie.getNode(originalWord.toLowerCase())?.originalLength ||
        (match.end - match.start + 1);

      const actualStart = match.start + offset;
      const actualEnd = match.start + offset + replaceLength - 1;

      result = result.substring(0, actualStart) +
        this.replacement.repeat(replaceLength) +
        result.substring(actualEnd + 1);

      offset += this.replacement.repeat(replaceLength).length - replaceLength;
    }

    return result;
  }

  /**
  * 检测文本中的敏感词，返回敏感词列表
  * @param {string} text 待检测文本
  * @return {string[]} 检测到的敏感词数组（去重）
  */
  detect(text) {
    const matches = this.trie.search(text.toLowerCase(), this.strategy === 'strict');
    const keywordsFound = new Set();

    for (const match of matches) {
      const originalWord = text.substr(match.start, match.end - match.start + 1);
      if (this.isWhitelisted(originalWord, text)) continue; // 复用白名单检查
      keywordsFound.add(originalWord); // 直接使用原文中的敏感词（保留大小写）
    }

    return Array.from(keywordsFound);
  }
}

module.exports = SensitiveFilter;
