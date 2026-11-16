const makeStep = (title, text, why, complexity, work, methods, view) => ({ title, text, why, complexity, work, methods, view });
const bucketIndex = (value, count = 7) => ((value % count) + count) % count;
const bucketsFor = (values) => { const buckets = Array.from({ length: 7 }, () => []); values.forEach((value) => buckets[bucketIndex(value)].push(value)); return buckets; };

function listSteps(values, operation) {
  const steps = [makeStep('Ready to compare', 'Both structures contain the same values, but their physical layout is different.', 'The layout decides how much work an operation needs.', 'start', '0 operations', [], { kind: 'lists', array: values, linked: values })];
  if (operation === 'get') {
    const target = Math.floor(values.length / 2);
    steps.push(makeStep('ArrayList jumps straight there', `Index ${target} becomes a direct array position.`, 'An index calculation does not grow with n.', 'constant', '1 lookup', ['get(index)'], { kind: 'lists', array: values, linked: values, arrayActive: target }));
    for (let i = 0; i <= target; i++) steps.push(makeStep(i === target ? 'LinkedList found the node' : 'Follow the next link', i === target ? `After ${i + 1} visits, value ${values[i]} is found.` : `Node ${i} points to the next node.`, 'LinkedList cannot jump to an index; it must walk there.', 'linear', `${i + 1} node visits`, ['get(index)'], { kind: 'lists', array: values, linked: values, linkedActive: i, linkedFound: i === target }));
  } else if (operation === 'add') {
    const added = Math.max(...values) + 1;
    for (let i = values.length - 1; i >= 0; i--) steps.push(makeStep('ArrayList shifts a value', `${values[i]} moves one cell right to make room.`, 'Adding at the front can move every existing value.', 'linear', `${values.length - i} shifts`, ['add(index)'], { kind: 'lists', array: values, linked: values, arrayMove: i }));
    steps.push(makeStep('LinkedList changes one link', `A new node ${added} becomes the first node.`, 'Only the first link changes at the front.', 'constant', '1 link update', ['add(index)'], { kind: 'lists', array: [added, ...values], linked: [added, ...values], linkedActive: 0 }));
  } else {
    const target = Math.floor(values.length / 2);
    for (let i = 0; i <= target; i++) steps.push(makeStep(i === target ? 'Unlink the middle node' : 'Walk toward the node', i === target ? `${values[target]} is removed by changing its neighbors.` : `Visit node ${i} on the way to index ${target}.`, 'The search to the middle is linear; the final unlink is constant.', 'linear', `${i + 1} node visits`, ['remove(index)'], { kind: 'lists', array: i === target ? values.filter((_, j) => j !== target) : values, linked: i === target ? values.filter((_, j) => j !== target) : values, linkedActive: i, linkedRemove: i === target }));
  }
  return steps;
}

function searchSteps(values, operation) {
  const target = operation === 'first' ? values[0] : operation === 'last' ? values.at(-1) : Math.max(...values) + 7;
  const buckets = bucketsFor(values);
  const steps = [makeStep('Choose a target', `Search for ${target} in both structures.`, 'ArrayList scans; HashSet computes a bucket.', 'start', '0 checks', [], { kind: 'search', values, buckets, target })];
  for (let i = 0; i < values.length; i++) { const found = values[i] === target; steps.push(makeStep(found ? 'ArrayList found it' : 'Check the next cell', found ? `${target} equals the value at index ${i}.` : `${values[i]} is not ${target}.`, 'A last or missing value may require n checks.', 'linear', `${i + 1} equality checks`, ['contains()'], { kind: 'search', values, buckets, target, listActive: i, listFound: found })); if (found) break; }
  const bucket = bucketIndex(target);
  steps.push(makeStep('HashSet calculates a bucket', `hashCode(${target}) points to bucket ${bucket}.`, 'Hashing and an array index are constant-time on average.', 'constant', '1 hash calculation', ['contains()', 'hashCode()'], { kind: 'search', values, buckets, target, bucketActive: bucket }));
  for (let i = 0; i < buckets[bucket].length; i++) { const value = buckets[bucket][i]; const found = value === target; steps.push(makeStep(found ? 'equals() confirms the value' : 'Handle a collision', found ? `${value} is the target.` : `${value} shares the bucket but is different.`, 'Many collisions can make HashSet approach O(n).', found ? 'constant' : 'linear', `${i + 1} bucket checks`, ['contains()', 'hashCode()', 'equals()'], { kind: 'search', values, buckets, target, bucketActive: bucket, bucketPosition: i, found })); if (found) break; }
  return steps;
}

class RBNode {
  constructor(key, nil) { this.key = key; this.color = 'red'; this.left = nil; this.right = nil; this.parent = nil; }
}

export class RedBlackTree {
  constructor(onEvent = () => {}) { this.nil = { key: null, color: 'black' }; this.nil.left = this.nil; this.nil.right = this.nil; this.nil.parent = this.nil; this.root = this.nil; this.onEvent = onEvent; }
  snapshot(active = null) {
    const nodes = [];
    const visit = (node, depth = 0) => { if (node === this.nil) return; nodes.push({ key: node.key, color: node.color, left: node.left === this.nil ? null : node.left.key, right: node.right === this.nil ? null : node.right.key, parent: node.parent === this.nil ? null : node.parent.key, depth }); visit(node.left, depth + 1); visit(node.right, depth + 1); };
    visit(this.root);
    return { root: this.root === this.nil ? null : this.root.key, nodes, active };
  }
  emit(title, text, active, complexity = 'logarithmic') { this.onEvent({ title, text, active, complexity, tree: this.snapshot(active) }); }
  leftRotate(x) { const y = x.right; x.right = y.left; if (y.left !== this.nil) y.left.parent = x; y.parent = x.parent; if (x.parent === this.nil) this.root = y; else if (x === x.parent.left) x.parent.left = y; else x.parent.right = y; y.left = x; x.parent = y; }
  rightRotate(y) { const x = y.left; y.left = x.right; if (x.right !== this.nil) x.right.parent = y; x.parent = y.parent; if (y.parent === this.nil) this.root = x; else if (y === y.parent.right) y.parent.right = x; else y.parent.left = x; x.right = y; y.parent = x; }
  insert(key, silent = false) {
    let parent = this.nil; let current = this.root;
    while (current !== this.nil) { parent = current; if (!silent) this.emit('TreeSet calls compareTo()', `${key} is compared with ${current.key}.`, current.key); if (key === current.key) return false; current = key < current.key ? current.left : current.right; }
    const node = new RBNode(key, this.nil); node.parent = parent; if (parent === this.nil) this.root = node; else if (key < parent.key) parent.left = node; else parent.right = node;
    if (!silent) this.emit('Attach a red node', `${key} is attached as a red leaf.`, key); this.fixInsert(node, silent); return true;
  }
  fixInsert(node, silent) {
    while (node.parent.color === 'red') {
      const parent = node.parent; const grand = parent.parent;
      if (parent === grand.left) { const uncle = grand.right; if (uncle.color === 'red') { parent.color = 'black'; uncle.color = 'black'; grand.color = 'red'; if (!silent) this.emit('Recolor the family', 'Parent and uncle become black; grandparent becomes red.', grand.key); node = grand; } else { if (node === parent.right) { node = parent; this.leftRotate(node); if (!silent) this.emit('Rotate left', 'Rotate to put the inner child on the outside.', node.parent.key); } node.parent.color = 'black'; node.parent.parent.color = 'red'; const pivot = node.parent.parent; this.rightRotate(pivot); if (!silent) this.emit('Rotate right and recolor', 'The local subtree is balanced again.', node.parent.key); } }
      else { const uncle = grand.left; if (uncle.color === 'red') { parent.color = 'black'; uncle.color = 'black'; grand.color = 'red'; if (!silent) this.emit('Recolor the family', 'Parent and uncle become black; grandparent becomes red.', grand.key); node = grand; } else { if (node === parent.left) { node = parent; this.rightRotate(node); if (!silent) this.emit('Rotate right', 'Rotate to put the inner child on the outside.', node.parent.key); } node.parent.color = 'black'; node.parent.parent.color = 'red'; const pivot = node.parent.parent; this.leftRotate(pivot); if (!silent) this.emit('Rotate left and recolor', 'The local subtree is balanced again.', node.parent.key); } }
    }
    this.root.color = 'black'; if (!silent) this.emit('Keep the root black', 'The root is black and the tree height stays logarithmic.', this.root.key);
  }
  find(key) { let node = this.root; while (node !== this.nil) { this.emit('TreeSet calls compareTo()', `${key} is compared with ${node.key}.`, node.key); if (key === node.key) return node; node = key < node.key ? node.left : node.right; } return this.nil; }
  minimum(node) { while (node.left !== this.nil) node = node.left; return node; }
  transplant(a, b) { if (a.parent === this.nil) this.root = b; else if (a === a.parent.left) a.parent.left = b; else a.parent.right = b; b.parent = a.parent; }
  remove(key) {
    const target = this.find(key); if (target === this.nil) return false;
    let moved = target; let original = moved.color; let fix;
    if (target.left === this.nil) { fix = target.right; this.transplant(target, target.right); }
    else if (target.right === this.nil) { fix = target.left; this.transplant(target, target.left); }
    else { moved = this.minimum(target.right); original = moved.color; fix = moved.right; if (moved.parent === target) fix.parent = moved; else { this.transplant(moved, moved.right); moved.right = target.right; moved.right.parent = moved; } this.transplant(target, moved); moved.left = target.left; moved.left.parent = moved; moved.color = target.color; }
    this.emit('Remove the matching node', `${key} is detached while sorted order is preserved.`, fix === this.nil ? null : fix.key); if (original === 'black') this.fixDelete(fix); this.root.color = 'black'; this.emit('TreeSet is balanced again', 'Rotations and recoloring restore the red-black rules.', this.root === this.nil ? null : this.root.key); return true;
  }
  fixDelete(node) {
    while (node !== this.root && node.color === 'black') {
      if (node === node.parent.left) { let sibling = node.parent.right; if (sibling.color === 'red') { sibling.color = 'black'; node.parent.color = 'red'; this.leftRotate(node.parent); sibling = node.parent.right; this.emit('Rotate away a red sibling', 'A rotation creates a black sibling for repair.', sibling.key); } if (sibling.left.color === 'black' && sibling.right.color === 'black') { sibling.color = 'red'; node = node.parent; this.emit('Move repair upward', 'A black sibling with black children becomes red.', node.key); } else { if (sibling.right.color === 'black') { sibling.left.color = 'black'; sibling.color = 'red'; this.rightRotate(sibling); sibling = node.parent.right; this.emit('Rotate the sibling', 'The far child is prepared for the final rotation.', sibling.key); } sibling.color = node.parent.color; node.parent.color = 'black'; sibling.right.color = 'black'; this.leftRotate(node.parent); node = this.root; this.emit('Final delete rotation', 'The black height is restored on both sides.', node.key); } }
      else { let sibling = node.parent.left; if (sibling.color === 'red') { sibling.color = 'black'; node.parent.color = 'red'; this.rightRotate(node.parent); sibling = node.parent.left; this.emit('Rotate away a red sibling', 'A rotation creates a black sibling for repair.', sibling.key); } if (sibling.right.color === 'black' && sibling.left.color === 'black') { sibling.color = 'red'; node = node.parent; this.emit('Move repair upward', 'A black sibling with black children becomes red.', node.key); } else { if (sibling.left.color === 'black') { sibling.right.color = 'black'; sibling.color = 'red'; this.leftRotate(sibling); sibling = node.parent.left; this.emit('Rotate the sibling', 'The far child is prepared for the final rotation.', sibling.key); } sibling.color = node.parent.color; node.parent.color = 'black'; sibling.left.color = 'black'; this.rightRotate(node.parent); node = this.root; this.emit('Final delete rotation', 'The black height is restored on both sides.', node.key); } }
    }
    node.color = 'black';
  }
}

function setSteps(values, operation) {
  const steps = [makeStep('Ready to compare', 'TreeSet keeps order. HashSet keeps buckets.', 'They answer “duplicate?” using different rules.', 'start', '0 operations', [], { kind: 'sets', tree: { nodes: [], root: null }, buckets: [] })];
  let tree; const buckets = [];
  const events = [];
  const record = (event) => events.push(event);
  tree = new RedBlackTree(record);
  if (operation === 'insert') { values.forEach((value) => { tree.insert(value); buckets.push(value); }); events.forEach((event) => steps.push(makeStep(event.title, event.text, 'A balanced TreeSet path is O(log n).', event.complexity, 'tree path', ['compareTo()'], { kind: 'sets', tree: event.tree, buckets: bucketsFor(buckets) }))); return steps; }
  values.forEach((value) => { tree.insert(value, true); buckets.push(value); }); const target = operation === 'find' ? values.at(-1) : values[Math.floor(values.length / 2)]; events.length = 0; if (operation === 'find') tree.find(target); else tree.remove(target);
  events.forEach((event) => steps.push(makeStep(event.title, event.text, 'A balanced TreeSet path is O(log n).', event.complexity, 'tree path', ['compareTo()'], { kind: 'sets', tree: event.tree, buckets: bucketsFor(buckets) })));
  const bucket = bucketIndex(target); const hashValues = operation === 'remove' ? buckets.filter((value) => value !== target) : buckets;
  steps.push(makeStep('HashSet uses hashCode() + equals()', `ID ${target} maps to bucket ${bucket}.`, 'HashSet is O(1) on average when buckets stay short.', 'constant', '1 hash + equality check', ['hashCode()', 'equals()'], { kind: 'sets', tree: tree.snapshot(), buckets: bucketsFor(hashValues), bucketActive: bucket })); return steps;
}

export class MinHeap {
  constructor(values = []) { this.items = []; values.forEach((value) => this.offer(value)); }
  offer(value) { this.items.push(value); let i = this.items.length - 1; while (i > 0) { const parent = Math.floor((i - 1) / 2); if (this.items[parent] <= this.items[i]) break; [this.items[parent], this.items[i]] = [this.items[i], this.items[parent]]; i = parent; } }
  poll() { if (!this.items.length) return null; const result = this.items[0]; const last = this.items.pop(); if (this.items.length) { this.items[0] = last; let i = 0; while (true) { const left = i * 2 + 1; const right = left + 1; let smallest = i; if (left < this.items.length && this.items[left] < this.items[smallest]) smallest = left; if (right < this.items.length && this.items[right] < this.items[smallest]) smallest = right; if (smallest === i) break; [this.items[i], this.items[smallest]] = [this.items[smallest], this.items[i]]; i = smallest; } } return result; }
}

export class CircularDeque {
  constructor(capacity = 4) { this.slots = Array(capacity).fill(null); this.head = 0; this.tail = 0; this.size = 0; }
  resize() { const next = Array(this.slots.length * 2).fill(null); for (let i = 0; i < this.size; i++) next[i] = this.slots[(this.head + i) % this.slots.length]; this.slots = next; this.head = 0; this.tail = this.size; }
  addLast(value) { if (this.size === this.slots.length) this.resize(); this.slots[this.tail] = value; this.tail = (this.tail + 1) % this.slots.length; this.size += 1; }
  addFirst(value) { if (this.size === this.slots.length) this.resize(); this.head = (this.head - 1 + this.slots.length) % this.slots.length; this.slots[this.head] = value; this.size += 1; }
  removeFirst() { if (!this.size) return null; const value = this.slots[this.head]; this.slots[this.head] = null; this.head = (this.head + 1) % this.slots.length; this.size -= 1; return value; }
  removeLast() { if (!this.size) return null; this.tail = (this.tail - 1 + this.slots.length) % this.slots.length; const value = this.slots[this.tail]; this.slots[this.tail] = null; this.size -= 1; return value; }
  snapshot() { return { slots: [...this.slots], head: this.head, tail: this.tail, size: this.size, values: Array.from({ length: this.size }, (_, i) => this.slots[(this.head + i) % this.slots.length]) }; }
}

function queueSteps(values, operation) {
  const stack = operation.toLowerCase().includes('stack'); const mode = stack ? 'stack' : 'queue'; const steps = [makeStep('Ready to compare', 'PriorityQueue cares about priority. ArrayDeque cares about arrival order—or the top.', 'The rule for the next element changes the data structure work.', 'start', '0 operations', [], { kind: 'queues', heap: [], deque: new CircularDeque(4).snapshot(), mode })];
  const heap = new MinHeap(); const deque = new CircularDeque(operation === 'resize' ? 4 : 8);
  if (operation === 'resize') { for (const value of values.slice(0, 5)) { const before = deque.size === deque.slots.length; if (before) steps.push(makeStep('The backing array is full', 'ArrayDeque copies its logical sequence into a larger array once.', 'That occasional O(n) resize is spread across many O(1) operations: amortized O(1).', 'linear', `${deque.size} copies`, ['offer()'], { kind: 'queues', heap: [], deque: deque.snapshot(), mode, resize: true })); deque.addLast(value); steps.push(makeStep('Write at the tail', `${value} joins the deque.`, 'One write and one index update are amortized O(1).', 'constant', '1 write', ['offer()'], { kind: 'queues', heap: [], deque: deque.snapshot(), mode })); } return steps; }
  if (operation.startsWith('build')) { values.forEach((value) => { heap.offer(value); if (stack) deque.addFirst(value); else deque.addLast(value); steps.push(makeStep('Insert into both structures', `${value} is offered to the heap and placed at the ${stack ? 'front/top' : 'tail'}.`, 'PriorityQueue may bubble along a heap path; ArrayDeque changes an index.', 'logarithmic', 'heap path + 1 deque write', [stack ? 'push()' : 'offer()'], { kind: 'queues', heap: [...heap.items], deque: deque.snapshot(), mode })); }); return steps; }
  values.forEach((value) => { heap.offer(value); if (stack) deque.addFirst(value); else deque.addLast(value); }); const priority = heap.poll(); const dequeValue = stack ? deque.removeFirst() : deque.removeFirst(); steps.push(makeStep('PriorityQueue polls the root', `${priority} leaves first because it has the smallest priority value.`, 'Replacing the root and sifting down is O(log n).', 'logarithmic', 'sift-down path', ['poll()'], { kind: 'queues', heap: [...heap.items], deque: deque.snapshot(), mode })); steps.push(makeStep(stack ? 'ArrayDeque pops the newest' : 'ArrayDeque polls the oldest', `${dequeValue} leaves from the ${stack ? 'top' : 'head'}.`, 'ArrayDeque reads one end and moves an index: amortized O(1).', 'constant', '1 read + index move', [stack ? 'pop()' : 'poll()'], { kind: 'queues', heap: [...heap.items], deque: deque.snapshot(), mode })); return steps;
}

export function buildSteps(module, values, operation) { if (module === 'lists') return listSteps(values, operation); if (module === 'search') return searchSteps(values, operation); if (module === 'sets') return setSteps(values, operation); return queueSteps(values, operation); }
