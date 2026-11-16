import { useEffect, useMemo, useRef, useState } from 'react';
import { buildSteps as buildModelSteps } from './models/steps.js';

const MODULES = {
  lists: { number: '01', label: 'Lists', title: 'Same values. Different journeys.', summary: 'See an ArrayList jump to an index while a LinkedList walks node by node.', values: '8, 15, 22, 5, 12, 19', methods: ['get(index)', 'add(index)', 'remove(index)'], operations: [['get', 'Get the middle value'], ['add', 'Add at index 0'], ['remove', 'Remove the middle value']] },
  search: { number: '02', label: 'Search', title: 'Scan every value—or jump to a bucket.', summary: 'Follow contains() through a linear list and a hash table, including collisions.', values: '8, 15, 22, 5, 12, 19', methods: ['contains()', 'hashCode()', 'equals()'], operations: [['first', 'Find the first value'], ['last', 'Find the last value'], ['missing', 'Find a missing value']] },
  sets: { number: '03', label: 'Ordered sets', title: 'Order on one side. Buckets on the other.', summary: 'Watch TreeSet compare IDs through a balanced tree while HashSet hashes IDs into buckets.', values: '42, 7, 100, 18, 63, 3', methods: ['compareTo()', 'hashCode()', 'equals()'], operations: [['insert', 'Insert every Book'], ['find', 'Find the last Book'], ['remove', 'Remove the middle Book']] },
  queues: { number: '04', label: 'Queues & stacks', title: 'Priority, arrival order, or last in?', summary: 'Compare a min-heap with ArrayDeque in FIFO queue and LIFO stack modes.', values: '8, 2, 5, 1, 7, 3', methods: ['offer()', 'poll()', 'push()', 'pop()'], operations: [['buildQueue', 'Insert: PriorityQueue vs queue'], ['removeQueue', 'Take out: PriorityQueue vs queue'], ['buildStack', 'Insert: PriorityQueue vs stack'], ['removeStack', 'Take out: PriorityQueue vs stack'], ['resize', 'Why ArrayDeque is amortized O(1)']] }
};

const complexityCopy = { constant: { label: 'O(1)', tone: 'mint' }, logarithmic: { label: 'O(log n)', tone: 'blue' }, linear: { label: 'O(n)', tone: 'coral' }, start: { label: 'READY', tone: 'violet' } };
const parse = (text) => [...new Set(text.split(',').map((x) => Number.parseInt(x.trim(), 10)).filter(Number.isFinite))].slice(0, 9);
const bucketIndex = (value, count = 7) => ((value % count) + count) % count;
const bucketsFor = (values) => { const buckets = Array.from({ length: 7 }, () => []); values.forEach((v) => buckets[bucketIndex(v)].push(v)); return buckets; };
const step = (title, text, why, complexity, work, methods, view) => ({ title, text, why, complexity, work, methods, view });

function listSteps(values, operation) {
  const out = [step('Ready to compare', 'Both structures contain the same values, but their physical layout is different.', 'The layout decides how much work an operation needs.', 'start', '0 operations', [], { kind: 'lists', array: values, linked: values })];
  if (operation === 'get') {
    const target = Math.floor(values.length / 2);
    out.push(step('ArrayList jumps straight there', `Index ${target} becomes a direct array position.`, 'An index calculation does not grow with n.', 'constant', '1 lookup', ['get(index)'], { kind: 'lists', array: values, linked: values, arrayActive: target }));
    for (let i = 0; i <= target; i++) out.push(step(i === target ? 'LinkedList found the node' : 'Follow the next link', i === target ? `After ${i + 1} visits, value ${values[i]} is found.` : `Node ${i} points to the next node.`, 'LinkedList cannot jump to an index; it must walk there.', 'linear', `${i + 1} node visits`, ['get(index)'], { kind: 'lists', array: values, linked: values, linkedActive: i, linkedFound: i === target }));
  } else if (operation === 'add') {
    const added = Math.max(...values) + 1;
    for (let i = values.length - 1; i >= 0; i--) out.push(step('ArrayList shifts a value', `${values[i]} moves one cell right to make room.`, 'Adding at the front can move every existing value.', 'linear', `${values.length - i} shifts`, ['add(index)'], { kind: 'lists', array: values, linked: values, arrayMove: i }));
    out.push(step('LinkedList changes one link', `A new node ${added} becomes the first node.`, 'Only the first link changes at the front.', 'constant', '1 link update', ['add(index)'], { kind: 'lists', array: [added, ...values], linked: [added, ...values], linkedActive: 0 }));
  } else {
    const target = Math.floor(values.length / 2);
    for (let i = 0; i <= target; i++) out.push(step(i === target ? 'Unlink the middle node' : 'Walk toward the node', i === target ? `${values[target]} is removed by changing its neighbors.` : `Visit node ${i} on the way to index ${target}.`, 'The search to the middle is linear; the final unlink is constant.', 'linear', `${i + 1} node visits`, ['remove(index)'], { kind: 'lists', array: values.filter((_, j) => j !== target), linked: i === target ? values.filter((_, j) => j !== target) : values, linkedActive: i, linkedRemove: i === target }));
  }
  return out;
}

function searchSteps(values, operation) {
  const target = operation === 'first' ? values[0] : operation === 'last' ? values.at(-1) : Math.max(...values) + 7;
  const buckets = bucketsFor(values);
  const out = [step('Choose a target', `Search for ${target} in both structures.`, 'ArrayList scans; HashSet computes a bucket.', 'start', '0 checks', [], { kind: 'search', values, buckets, target })];
  let found = false;
  for (let i = 0; i < values.length; i++) { found = values[i] === target; out.push(step(found ? 'ArrayList found it' : 'Check the next cell', found ? `${target} equals the value at index ${i}.` : `${values[i]} is not ${target}.`, 'A last or missing value may require n checks.', 'linear', `${i + 1} equality checks`, ['contains()'], { kind: 'search', values, buckets, target, listActive: i, listFound: found })); if (found) break; }
  const b = bucketIndex(target);
  out.push(step('HashSet calculates a bucket', `hashCode(${target}) points to bucket ${b}.`, 'Hashing and an array index are constant-time on average.', 'constant', '1 hash calculation', ['contains()', 'hashCode()'], { kind: 'search', values, buckets, target, bucketActive: b }));
  buckets[b].forEach((value, i) => { const match = value === target; out.push(step(match ? 'equals() confirms the value' : 'Handle a collision', match ? `${value} is the target.` : `${value} shares the bucket but is different.`, 'Many collisions can make HashSet approach O(n).', match ? 'constant' : 'linear', `${i + 1} bucket checks`, ['contains()', 'hashCode()', 'equals()'], { kind: 'search', values, buckets, target, bucketActive: b, bucketPosition: i, found: match })); });
  return out;
}

function balancedTree(values, active = null, removed = null) {
  const kept = values.filter((v) => v !== removed).sort((a, b) => a - b);
  const build = (items, depth = 0) => { if (!items.length) return []; const mid = Math.floor(items.length / 2); return [{ key: items[mid], depth, color: depth % 2 ? 'red' : 'black' }, ...build(items.slice(0, mid), depth + 1), ...build(items.slice(mid + 1), depth + 1)]; };
  return { nodes: build(kept), active };
}

function setSteps(values, operation) {
  const out = [step('Ready to compare', 'TreeSet keeps order. HashSet keeps buckets.', 'They answer “duplicate?” using different rules.', 'start', '0 operations', [], { kind: 'sets', tree: balancedTree([]), buckets: [] })];
  if (operation === 'insert') {
    values.forEach((value, i) => { const current = values.slice(0, i + 1); out.push(step('TreeSet calls compareTo()', `${value} is compared down a search-tree path.`, 'A balanced tree visits only its height: O(log n).', 'logarithmic', `${i + 1} comparisons`, ['compareTo()'], { kind: 'sets', tree: balancedTree(current, value), buckets: bucketsFor(current) })); if (i > 1) out.push(step('Rebalance and recolor', 'The red-black rules keep both sides balanced.', 'Keeping height near log n keeps future operations fast.', 'logarithmic', '1 local repair', ['compareTo()'], { kind: 'sets', tree: balancedTree(current, value), buckets: bucketsFor(current) })); });
  } else {
    const target = operation === 'find' ? values.at(-1) : values[Math.floor(values.length / 2)];
    const remaining = operation === 'remove' ? values.filter((v) => v !== target) : values;
    out.push(step('Compare along the tree path', `${target} is compared with each node on its path.`, 'A balanced TreeSet path is O(log n).', 'logarithmic', 'tree path', ['compareTo()'], { kind: 'sets', tree: balancedTree(values, target), buckets: bucketsFor(values) }));
    out.push(step(operation === 'find' ? 'TreeSet found the Book' : 'TreeSet removes and rebalances', operation === 'find' ? `${target} is found without scanning every node.` : `${target} leaves; the tree is repaired locally.`, 'HashSet uses a hash instead of maintaining sorted order.', 'logarithmic', operation === 'find' ? '1 path result' : '1 rebalance', ['compareTo()'], { kind: 'sets', tree: balancedTree(remaining, null), buckets: bucketsFor(remaining) }));
    const index = bucketIndex(target);
    out.push(step('HashSet uses hashCode() + equals()', `ID ${target} maps to bucket ${index}.`, 'HashSet is O(1) on average when buckets stay short.', 'constant', '1 hash + equality check', ['hashCode()', 'equals()'], { kind: 'sets', tree: balancedTree(remaining), buckets: bucketsFor(remaining), bucketActive: index }));
  }
  return out;
}

function heapInsert(heap, value) { const next = [...heap, value]; let i = next.length - 1; while (i > 0) { const p = Math.floor((i - 1) / 2); if (next[p] <= next[i]) break; [next[p], next[i]] = [next[i], next[p]]; i = p; } return next; }
function queueSteps(values, operation) {
  const stack = operation.toLowerCase().includes('stack'); const mode = stack ? 'stack' : 'queue'; const out = [step('Ready to compare', 'PriorityQueue cares about priority. ArrayDeque cares about arrival order—or the top.', 'The rule for the next element changes the data structure work.', 'start', '0 operations', [], { kind: 'queues', heap: [], deque: [], mode })];
  if (operation === 'resize') { let deque = []; out.push(step('ArrayDeque has a small backing array', 'Four slots are ready for values.', 'Most insertions only move an index.', 'constant', '0 writes', ['offer()'], { kind: 'queues', heap: [], deque, capacity: 4, mode: 'queue' })); values.slice(0, 5).forEach((value, i) => { if (i === 4) out.push(step('The array fills and resizes', 'Existing values are copied into a larger array once.', 'That occasional O(n) resize is spread across many O(1) operations: amortized O(1).', 'linear', '4 copies', ['offer()'], { kind: 'queues', heap: [], deque, capacity: 8, mode: 'queue', resize: true })); deque = [...deque, value]; out.push(step('Write at the tail', `${value} joins the deque.`, 'One write and one index update are amortized O(1).', 'constant', '1 write', ['offer()'], { kind: 'queues', heap: [], deque, capacity: i === 4 ? 8 : 4, mode: 'queue' })); }); return out; }
  if (operation.startsWith('build')) { let heap = []; values.forEach((value) => { heap = heapInsert(heap, value); out.push(step('PriorityQueue bubbles upward', `${value} moves until the smallest value is at the root.`, 'A heap operation follows its height: O(log n).', 'logarithmic', 'heap path', ['offer()'], { kind: 'queues', heap, deque: mode === 'stack' ? [...values].slice(0, heap.length).reverse() : values.slice(0, heap.length), mode })); }); return out; }
  const heap = values.reduce(heapInsert, []);
  out.push(step('PriorityQueue polls the root', `${heap[0]} leaves first because it has the highest priority.`, 'Replacing the root and sifting down is O(log n).', 'logarithmic', 'sift-down path', ['poll()'], { kind: 'queues', heap: heap.slice(1), deque: values, mode }));
  out.push(step(mode === 'stack' ? 'ArrayDeque pops the newest' : 'ArrayDeque polls the oldest', mode === 'stack' ? `${values.at(-1)} was pushed last.` : `${values[0]} arrived first.`, 'The deque reads one end and moves an index: amortized O(1).', 'constant', '1 read', [mode === 'stack' ? 'pop()' : 'poll()'], { kind: 'queues', heap: heap.slice(1), deque: mode === 'stack' ? values.slice(0, -1) : values.slice(1), mode }));
  return out;
}

function buildSteps(module, values, operation) { if (module === 'lists') return listSteps(values, operation); if (module === 'search') return searchSteps(values, operation); if (module === 'sets') return setSteps(values, operation); return queueSteps(values, operation); }

function Complexity({ type }) { const item = complexityCopy[type] || complexityCopy.constant; return <div className={`complexity ${item.tone}`}><span>complexity</span><strong>{item.label}</strong></div>; }
function Tree({ tree }) {
  if (!tree?.nodes?.length) return <div className="empty-state">The tree is empty.<br />Press play to grow it.</div>;
  const byKey = new Map(tree.nodes.map((node) => [node.key, node]));
  const ordered = [...tree.nodes].sort((a, b) => a.key - b.key);
  const positions = new Map();
  const place = (key, depth = 0) => {
    if (key == null || positions.has(key)) return;
    const index = ordered.findIndex((node) => node.key === key);
    positions.set(key, { x: 42 + index * (516 / Math.max(ordered.length - 1, 1)), y: 28 + depth * 68 });
    const node = byKey.get(key);
    if (node) { place(node.left, depth + 1); place(node.right, depth + 1); }
  };
  place(tree.root ?? tree.nodes[0].key);
  const edges = tree.nodes.flatMap((node) => [node.left, node.right].filter((child) => child != null).map((child) => {
    const from = positions.get(node.key); const to = positions.get(child);
    return from && to ? <line key={`${node.key}-${child}`} className="tree-edge" x1={from.x} y1={from.y} x2={to.x} y2={to.y} /> : null;
  }));
  return <svg className="tree" viewBox="0 0 600 250" role="img" aria-label="TreeSet balanced search tree"><g>{edges}</g>{tree.nodes.map((node) => { const pos = positions.get(node.key); return pos ? <g key={node.key} className={`tree-node ${node.color} ${node.key === tree.active ? 'active' : ''}`}><circle cx={pos.x} cy={pos.y} r="21" /><text x={pos.x} y={pos.y + 4}>{node.key}</text></g> : null; })}</svg>;
}
function Buckets({ buckets, active }) { return <div className="buckets">{(buckets?.length ? buckets : Array.from({ length: 7 }, () => [])).map((bucket, i) => <div className={`bucket ${active === i ? 'active' : ''}`} key={i}><b>{i}</b><span>{bucket.join('  ') || '·'}</span></div>)}</div>; }
function ArrayVisual({ values, active, move, found }) { return <div className="array-visual">{values.map((value, i) => <div key={`${value}-${i}`} className={`cell ${i === active ? found ? 'found' : 'active' : ''} ${i === move ? 'move' : ''}`}><small>{i}</small>{value}</div>)}</div>; }
function LinkedVisual({ values, active, found }) { return <div className="linked-visual">{values.map((value, i) => <span key={`${value}-${i}`} className="linked-piece"><span className={`node ${i === active ? found ? 'found' : 'active' : ''}`}>{value}</span>{i < values.length - 1 && <i>→</i>}</span>)}<i>→ null</i></div>; }
function Deque({ deque, mode }) { const capacity = deque?.slots?.length || 8; return <div className="deque"><div className="deque-center"><strong>{deque?.size || 0}/{capacity}</strong><span>{mode === 'stack' ? 'LIFO stack' : 'FIFO queue'}</span></div>{Array.from({ length: capacity }, (_, i) => <div className={`deque-slot ${i === deque?.head ? 'active' : ''}`} style={{ '--angle': `${i * 360 / capacity}deg` }} key={i}>{deque?.slots?.[i] ?? '·'}</div>)}<span className="deque-pointer head">HEAD</span><span className="deque-pointer tail">TAIL</span></div>; }
function Panel({ title, note, children }) { return <section className="scene-part"><div className="panel-heading"><strong>{title}</strong><span>{note}</span></div>{children}</section>; }
function Visual({ view }) {
  if (view.kind === 'lists') return <div className="visual-grid"><Panel title="ArrayList" note="indexed cells"><ArrayVisual values={view.array} active={view.arrayActive} move={view.arrayMove} /></Panel><Panel title="LinkedList" note="nodes + links"><LinkedVisual values={view.linked} active={view.linkedActive} found={view.linkedFound} /></Panel></div>;
  if (view.kind === 'search') return <div className="visual-grid"><Panel title="ArrayList" note={`target ${view.target}`}><ArrayVisual values={view.values} active={view.listActive} found={view.listFound} /></Panel><Panel title="HashSet" note="hash → bucket"><Buckets buckets={view.buckets} active={view.bucketActive} /></Panel></div>;
  if (view.kind === 'sets') return <div className="visual-grid"><Panel title="TreeSet<Book>" note="balanced search tree"><Tree tree={view.tree} /></Panel><Panel title="HashSet<Book>" note="bucket table"><Buckets buckets={view.buckets} active={view.bucketActive} /></Panel></div>;
  return <div className="visual-grid"><Panel title="PriorityQueue" note="min-heap"><div className="heap-values">{view.heap?.map((v, i) => <span key={i}>{v}</span>)}</div><div className="heap-note">Smallest value stays at the root; poll repairs the heap with sift-down.</div></Panel><Panel title={`ArrayDeque as ${view.mode}`} note={view.mode === 'stack' ? 'LIFO' : 'FIFO'}><Deque deque={view.deque} mode={view.mode} /></Panel></div>;
}

function TerminalLog({ steps, stepIndex }) {
  const visibleSteps = steps.slice(0, stepIndex + 1);
  return <section className="terminal-card" aria-label="Step-by-step terminal log">
    <div className="terminal-bar"><span className="terminal-lights"><i /><i /><i /></span><strong>lesson-runner</strong><span className="terminal-status">step {stepIndex + 1}/{steps.length} · live log</span></div>
    <div className="terminal-body" aria-live="polite">
      <div className="terminal-line terminal-muted"><span className="terminal-prompt">$</span> run {visibleSteps.length ? 'step-by-step explanation' : 'ready'}</div>
      {visibleSteps.map((item, index) => <div className={`terminal-line ${index === stepIndex ? 'current' : ''}`} key={`${index}-${item.title}`}>
        <span className="terminal-prompt">$</span><span className="terminal-step">step {String(index + 1).padStart(2, '0')}</span><span className="terminal-command">{item.title}</span><span className="terminal-complexity">{complexityCopy[item.complexity]?.label || 'READY'}</span>
        <span className="terminal-detail">{item.text}<small className="terminal-extra">work: {item.work} · why: {item.why}</small></span>
      </div>)}
      <div className="terminal-cursor"><span className="terminal-prompt">$</span><span className="cursor-block" /></div>
    </div>
  </section>;
}

export default function App() {
  const [module, setModule] = useState('lists');
  const config = MODULES[module];
  const [valuesText, setValuesText] = useState(config.values);
  const [operation, setOperation] = useState(config.operations[0][0]);
  const [stepIndex, setStepIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(2);
  const timer = useRef(null);
  const values = useMemo(() => parse(valuesText), [valuesText]);
  const steps = useMemo(() => values.length > 1 ? buildModelSteps(module, values, operation) : [], [module, values, operation]);
  const current = steps[stepIndex] || steps[0];

  useEffect(() => { setValuesText(config.values); setOperation(config.operations[0][0]); setStepIndex(0); setPlaying(false); }, [module]);
  useEffect(() => { setStepIndex(0); setPlaying(false); }, [valuesText, operation]);
  useEffect(() => { if (!playing) return undefined; timer.current = window.setTimeout(() => { if (stepIndex < steps.length - 1) setStepIndex((i) => i + 1); else setPlaying(false); }, [1350, 900, 600, 350][speed - 1]); return () => window.clearTimeout(timer.current); }, [playing, stepIndex, speed, steps.length]);
  useEffect(() => { const onKey = (event) => { if (['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return; if (event.code === 'Space') { event.preventDefault(); setPlaying((p) => !p); } if (event.key === 'ArrowRight') setStepIndex((i) => Math.min(i + 1, Math.max(steps.length - 1, 0))); if (event.key.toLowerCase() === 'r') { setPlaying(false); setStepIndex(0); } }; window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey); }, [steps.length]);

  const randomize = () => { const next = new Set(); while (next.size < 6) next.add(Math.floor(Math.random() * 90) + 1); setValuesText([...next].join(', ')); };
  const reset = () => { setPlaying(false); setStepIndex(0); };
  const next = () => { setPlaying(false); setStepIndex((i) => Math.min(i + 1, Math.max(steps.length - 1, 0))); };

  return <div className="app"><header className="lesson-header"><div className="lesson-heading"><span className="kicker">Data structure lab</span><strong>Choose a lesson</strong></div><nav className="lesson-tabs" aria-label="Lessons">{Object.entries(MODULES).map(([key, item]) => <button key={key} className={`lesson-tab ${module === key ? 'active' : ''}`} onClick={() => { setPlaying(false); setModule(key); }}><b>{item.number}</b><span>{item.label}</span></button>)}</nav></header><main className="content"><section className="controls"><label>Test values<input value={valuesText} onChange={(e) => setValuesText(e.target.value)} /></label><label>Operation<select value={operation} onChange={(e) => setOperation(e.target.value)}>{config.operations.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label><button className="ghost" onClick={randomize}>Randomize</button><div className="playback"><button onClick={reset} aria-label="Reset">↺</button><button onClick={next} aria-label="Next step">→|</button><button className="play" onClick={() => setPlaying((p) => !p)}>{playing ? 'Ⅱ Pause' : '▶ Play'}</button></div><label className="speed">Speed <output>{speed}×</output><input type="range" min="1" max="4" value={speed} onChange={(e) => setSpeed(Number(e.target.value))} /></label></section>{current ? <><section className="visual-card"><div className="visual-head"><div><div className="kicker">Lesson {config.number} · {config.label}</div><h1>{config.title}</h1><p>{config.summary}</p></div><div className="chips">{config.methods.map((method) => <span className={current.methods?.includes(method) ? 'on' : ''} key={method}>{method}</span>)}</div></div><div className="stage"><Visual view={current.view} /></div></section><TerminalLog steps={steps} stepIndex={stepIndex} /></> : <div className="error">Enter at least two different whole numbers.</div>}</main></div>;
}
