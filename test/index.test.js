const assert = require('assert');
const SensitiveFilter = require('../src/index');

describe('Trie优化后的敏感词过滤测试', () => {
  it('应该正确过滤简单敏感词', () => {
    const filter = new SensitiveFilter({
      keywords: ['bad', 'word'],
      strategy: 'strict'
    });
    // 确保这里没有特殊字符
    assert.equal(filter.filter('bad word'), '*** ****');
    assert.deepStrictEqual(filter.detect('bad word'), ['bad', 'word'])
  });


  it('应该处理嵌入敏感词', () => {
    const filter = new SensitiveFilter({
      keywords: ['bad'],
      strategy: 'normal'
    });
    assert.equal(filter.filter('badly'), '***ly');
    assert.deepStrictEqual(filter.detect('badly'), ['bad']);
  });

  it('严格模式应该避免误判', () => {
    const filter = new SensitiveFilter({
      keywords: ['bad'],
      strategy: 'strict'
    });
    assert.equal(filter.filter('badly'), 'badly');
    assert.equal(filter.filter('this is bad!'), 'this is ***!');

    assert.deepStrictEqual(filter.detect('badly'), []);
    assert.deepStrictEqual(filter.detect('this is bad!'), ['bad']);
  });

  it('应该处理中文敏感词', () => {
    const filter = new SensitiveFilter({
      keywords: ['敏感词'],
      strategy: 'normal'
    });
    assert.equal(filter.filter('这是一个敏感词测试'), '这是一个***测试');
    assert.deepStrictEqual(filter.detect('这是一个敏感词测试'), ['敏感词']);
  });

  it('应该正确处理白名单', () => {
    const filter = new SensitiveFilter({
      keywords: ['3p', 'xxx'],
      replacement: '*',
      strategy: 'strict', // strict|normal
      whitelist: {
        '3p': ['pristine', '3phase']
      }
    });
    assert.equal(filter.filter('3p视频'), '**视频');
    assert.equal(filter.filter('123pristine'), '123pristine'); // 3p是2字符但显示3个*
    assert.deepStrictEqual(filter.detect('3p视频'), ['3p']);
    assert.deepStrictEqual(filter.detect('123pristine'), []);
    assert.deepStrictEqual(filter.detect('3phase是安全的'), []);
  });

  it('性能测试: 大量敏感词', () => {
    const keywords = Array.from({ length: 10000 }, (_, i) => `word${i}`);
    keywords.push('target');
    const filter = new SensitiveFilter({ keywords });

    const start = Date.now();
    filter.filter('this is a target string with many words');
    const duration = Date.now() - start;

    console.log(`10000个敏感词过滤耗时: ${duration}ms`);
    assert(duration < 100, '过滤耗时应小于100ms');

    // 新增 detect() 性能测试
    const detectStart = Date.now();
    filter.detect('this is a target string with many words');
    const detectDuration = Date.now() - detectStart;
    console.log(`10000个敏感词检测耗时: ${detectDuration}ms`);
    assert(detectDuration < 100, '检测耗时应小于100ms');
  });

  // 新增测试：检测混合敏感词
  it('应该检测混合敏感词', () => {
    const filter = new SensitiveFilter({
      keywords: ['bad', 'word', '敏感词'],
      strategy: 'normal'
    });
    const text = 'bad word和敏感词都出现了';
    assert.deepStrictEqual(
      filter.detect(text),
      ['bad', 'word', '敏感词']
    );
    assert.equal(
      filter.filter(text),
      '*** ****和***都出现了'
    );
  });

  // 新增测试：空输入
  it('应该处理空输入', () => {
    const filter = new SensitiveFilter({
      keywords: ['test']
    });
    assert.deepStrictEqual(filter.detect(''), []);
    assert.equal(filter.filter(''), '');
  });
});
