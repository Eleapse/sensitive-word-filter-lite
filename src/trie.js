class TrieNode {
  constructor() {
    this.children = {};      // 子节点
    this.isEnd = false;      // 是否是敏感词结尾
    // this.length = 0;         // 敏感词长度（用于快速替换）
    this.originalLength = 0; // 改为存储原始长度
  }
}

class Trie {
  constructor() {
    this.root = new TrieNode();
  }

  // 插入一个敏感词
  insert(word) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      if (!node.children[char]) {
        node.children[char] = new TrieNode();
      }
      node = node.children[char];
    }
    node.isEnd = true;
    node.originalLength = word.length; // 存储原始长度
  }

  // 在文本中查找敏感词
  search(text, strictMode = false) {
    const results = [];
    let i = 0;

    while (i < text.length) {
      let node = this.root;
      let j = i;
      let lastMatch = null;

      while (j < text.length && node.children[text[j]]) {
        node = node.children[text[j]];
        if (node.isEnd) {
          lastMatch = {
            start: i,
            end: j,
            length: node.originalLength
          };

          // 严格模式需要检查边界
          if (!strictMode || this._checkBoundary(text, i, j)) {
            results.push(lastMatch);
          }
        }
        j++;
      }

      // 如果有匹配但被严格模式过滤了，i只前进1
      i = (lastMatch && results[results.length - 1] !== lastMatch)
        ? i + 1
        : (lastMatch ? j + 1 : i + 1);
    }

    return results;
  }

  getNode(word) {
    let node = this.root;
    for (const char of word.toLowerCase()) {
      node = node.children[char];
      if (!node) return null;
    }
    return node.isEnd ? node : null;
  }

  // 检查是否是正确的单词边界（用于严格模式）
  _checkBoundary(text, start, end) {
    const prevChar = text[start - 1];
    const nextChar = text[end + 1];
    const isPrevBoundary = !prevChar || !this._isAlphanumeric(prevChar);
    const isNextBoundary = !nextChar || !this._isAlphanumeric(nextChar);
    return isPrevBoundary && isNextBoundary;
  }

  _isAlphanumeric(char) {
    return /[a-zA-Z0-9]/.test(char);
  }
}

module.exports = Trie;
