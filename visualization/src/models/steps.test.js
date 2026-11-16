import test from 'node:test';
import assert from 'node:assert/strict';
import { CircularDeque, MinHeap, RedBlackTree, buildSteps } from './steps.js';

function validateTree(tree) {
  const snapshot = tree.snapshot();
  if (!snapshot.nodes.length) return;
  assert.equal(snapshot.nodes.find((node) => node.key === snapshot.root).color, 'black');
  const byKey = new Map(snapshot.nodes.map((node) => [node.key, node]));
  for (const node of snapshot.nodes) {
    if (node.left != null) assert.ok(node.left < node.key);
    if (node.right != null) assert.ok(node.right > node.key);
    if (node.color === 'red') {
      if (node.left != null) assert.equal(byKey.get(node.left).color, 'black');
      if (node.right != null) assert.equal(byKey.get(node.right).color, 'black');
    }
  }
}

test('MinHeap polls values in sorted order and preserves heap order', () => {
  const heap = new MinHeap([8, 2, 5, 1, 7, 3]);
  assert.deepEqual([...Array(6)].map(() => heap.poll()), [1, 2, 3, 5, 7, 8]);
});

test('CircularDeque preserves FIFO and LIFO operations through resize', () => {
  const queue = new CircularDeque(2); queue.addLast(1); queue.addLast(2); queue.addLast(3);
  assert.deepEqual([queue.removeFirst(), queue.removeFirst(), queue.removeFirst()], [1, 2, 3]);
  const stack = new CircularDeque(2); stack.addFirst(1); stack.addFirst(2); stack.addFirst(3);
  assert.deepEqual([stack.removeFirst(), stack.removeFirst(), stack.removeFirst()], [3, 2, 1]);
});

test('RedBlackTree keeps ordering and red-black rules after insertion and removal', () => {
  const tree = new RedBlackTree();
  [42, 7, 100, 18, 63, 3, 55, 80].forEach((value) => { tree.insert(value); validateTree(tree); });
  [18, 42, 3, 100, 7, 55, 63, 80].forEach((value) => { assert.equal(tree.remove(value), true); validateTree(tree); });
  assert.equal(tree.snapshot().nodes.length, 0);
});

test('lesson builders expose all requested visualization modules', () => {
  assert.ok(buildSteps('lists', [1, 2, 3], 'get').length > 1);
  assert.ok(buildSteps('search', [8, 15, 22], 'first').some((item) => item.view.bucketActive != null));
  assert.ok(buildSteps('sets', [42, 7, 100], 'insert').some((item) => item.methods.includes('compareTo()')));
  const removal = buildSteps('sets', [42, 7, 100], 'remove');
  assert.ok(!removal.at(-1).view.buckets.flat().includes(7));
  assert.ok(buildSteps('queues', [8, 2, 5, 1, 7], 'resize').some((item) => item.view.resize));
});
