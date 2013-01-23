describe('basic test', function () {
  it('attaches', function () {
    assert.equal(typeof amino.publish, 'function');
    assert.equal(typeof amino.subscribe, 'function');
  });
  it('does pub/sub', function (done) {
    var triggered = {};
    amino.subscribe('eat', function (food, yummy, tags) {
      assert.equal(triggered[food], undefined);
      triggered[food] = true;
      if (food === 'apple') {
        assert.equal(yummy, true);
        assert.deepEqual(tags, ['delicious', 'red', 'orchard']);
        triggered.apple = true;
      }
      else if (food === 'banana') {
        assert.equal(yummy, true);
        assert.deepEqual(tags, ['monkey', 'yellow', 'jungle']);
      }
      else if (food === 'porridge') {
        assert.equal(yummy, false);
        assert.deepEqual(tags, ['three little bears', 'cold', 'sagar']);
      }
      else {
        assert.fail(food, ['apple', 'banana', 'porridge']);
      }
      if (Object.keys(triggered).length === 3) {
        done();
      }
    });

    setTimeout(function () {
      amino.publish('eat', 'porridge', false, ['three little bears', 'cold', 'sagar']);
      amino.publish('eat', 'apple', true, ['delicious', 'red', 'orchard']);
      amino.publish('eat', 'banana', true, ['monkey', 'yellow', 'jungle']);
    }, 100);
  });
});