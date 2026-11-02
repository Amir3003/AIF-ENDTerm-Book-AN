/* Book content. Every number in the traces was checked by script.
   Authoring format: HTML strings, with $inline$ and $$display$$ math rendered by KaTeX at load. */
(function () {
  const R = String.raw;

  const ARROW = R`<defs><marker id="arr" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0 8 4 0 8z" fill="context-stroke"/></marker></defs>`;

  const weeks = [
    /* ---------------------------------------------------------------- WEEK 1 */
    {
      n: 1,
      title: 'Intelligent Agents &amp; Environments',
      plain: 'Intelligent Agents & Environments',
      lecture: R`
<h3>Core Definitions &amp; Math</h3>
<p><b>Agent.</b> A function from percept history to action: $f: \mathcal{P}^{*} \to \mathcal{A}$.</p>
<p><b>Rationality.</b> Pick the action with the highest expected performance, given the evidence so far:</p>
<div class="formula">$$a^{*} = \arg\max_{a}\; \mathbb{E}\left[\,U \mid e_{1:t},\, a\,\right]$$</div>
<p>Rational is not omniscient. A drone that takes the safest route and still meets a sudden gust made the right decision with a bad outcome.</p>
<p><b>PEAS.</b> The task specification: Performance measure, Environment, Actuators, Sensors. It comes before any code.</p>
<table class="t">
<tr><th>Property</th><th>Easier</th><th>Harder</th><th>What the harder case forces</th></tr>
<tr><td>Observability</td><td>Fully (chess)</td><td>Partially (taxi)</td><td>Internal state</td></tr>
<tr><td>Outcomes</td><td>Deterministic (8-puzzle)</td><td>Stochastic (dice)</td><td>Probabilities, contingency plans</td></tr>
<tr><td>Time</td><td>Static (crossword)</td><td>Dynamic (traffic)</td><td>Decisions under a deadline</td></tr>
</table>
<table class="t">
<tr><th>Architecture</th><th>Decision rule</th><th>Adds</th></tr>
<tr><td>Simple reflex</td><td>$a_t = \text{rule}(p_t)$</td><td>Nothing, current percept only</td></tr>
<tr><td>Model-based</td><td>$s_t = \text{update}(s_{t-1}, a_{t-1}, p_t)$</td><td>Memory of what it cannot see</td></tr>
<tr><td>Goal-based</td><td>find $a_{1:n}$ with $\text{Goal}(s_n)$</td><td>Planning ahead</td></tr>
<tr><td>Utility-based</td><td>$\arg\max_a \sum_{s'} P(s' \mid s, a)\, U(s')$</td><td>Trade-offs between goals</td></tr>
</table>
<h3>In My Own Words (Engineering Intuition)</h3>
<p class="own">I read the four architectures as four answers to one question: what does the agent know at the moment it acts? A reflex agent knows one percept. A model-based agent also knows its own past. A goal-based agent can simulate the future, and a utility-based agent can rank those futures when no single one wins on every metric. Each step costs more compute and more design work, so I pick the simplest one the environment table allows. Properties of the environment choose the architecture. My preferences do not.</p>`,
      practiceTitle: 'Autonomous Urban Delivery Drone',
      practice: R`
<h3>Weekly Practical Task / Case Study</h3>
<p>Write the PEAS specification for a drone that delivers parcels in a city, classify its environment, choose an architecture, then show why the cheapest architecture fails.</p>
<table class="t">
<tr><td class="k">P</td><td>On-time rate, energy per km, zero no-fly violations, zero collisions, parcel intact</td></tr>
<tr><td class="k">E</td><td>Urban airspace, buildings, wind, pedestrians, landing pads, other drones</td></tr>
<tr><td class="k">A</td><td>Four rotors, parcel winch, radio link, status lights</td></tr>
<tr><td class="k">S</td><td>GPS, IMU, LiDAR, stereo camera, barometer, battery gauge</td></tr>
</table>
<p><b>Classification:</b> partially observable, stochastic, dynamic, continuous, multi-agent.<br><b>Choice:</b> utility-based planner on a model-based state estimator. On-time rate and battery conflict, so a binary goal cannot express the trade-off.</p>
<h3>Step-by-Step Trace: Simple Reflex Loop</h3>
<p>Grid world, cell $(3,0)$ is a wall, goal $G$ is at $(3,1)$. The only sensor is one bit: is the cell to the East blocked? Rules: <span class="m">R1 clear → East</span>, <span class="m">R2 blocked → West</span>.</p>
<div class="split">
<svg class="fig" viewBox="0 0 250 132" role="img" aria-label="Four by two grid. The agent moves east to cell 2,0, then oscillates between cells 1,0 and 2,0 while the goal at 3,1 is never reached.">
${ARROW}
<g class="cells"><rect x="5" y="6" width="60" height="60"/><rect x="65" y="6" width="60" height="60"/><rect x="125" y="6" width="60" height="60"/><rect x="185" y="6" width="60" height="60" class="goal"/><rect x="5" y="66" width="60" height="60"/><rect x="65" y="66" width="60" height="60"/><rect x="125" y="66" width="60" height="60"/><rect x="185" y="66" width="60" height="60" class="wall"/></g>
<text x="215" y="41" class="lb" text-anchor="middle">G</text><text x="35" y="118" class="sm" text-anchor="middle">start</text><text x="215" y="118" class="sm inv" text-anchor="middle">wall</text>
<path d="M35 90H90" class="ln ink" marker-end="url(#arr)"/>
<path d="M95 84Q125 66 152 84" class="ln acc" marker-end="url(#arr)"/><path d="M155 100Q125 118 98 100" class="ln acc" marker-end="url(#arr)"/>
</svg>
<table class="t tight">
<tr><th>$t$</th><th>Cell</th><th>Percept</th><th>Rule</th><th>Act</th></tr>
<tr><td>0</td><td>(0,0)</td><td>clear</td><td>R1</td><td>E</td></tr>
<tr><td>1</td><td>(1,0)</td><td>clear</td><td>R1</td><td>E</td></tr>
<tr><td>2</td><td>(2,0)</td><td>blocked</td><td>R2</td><td>W</td></tr>
<tr class="hot"><td>3</td><td>(1,0)</td><td>clear</td><td>R1</td><td>E</td></tr>
<tr class="hot"><td>4</td><td>(2,0)</td><td>blocked</td><td>R2</td><td>W</td></tr>
</table>
</div>
<p>State $(1,0)$ repeats at $t=1$ and $t=3$. The rules are deterministic and hold no memory, so the same state always produces the same next state: a period-2 loop, forever. Changing R2 to North solves this map and fails on the next map where North is walled too. A model-based agent marks $(2,0)$ as tried and picks an untried direction, so it works on both.</p>
<div class="take"><b>Key Takeaway</b>With partial observability and no memory, a repeated state means a guaranteed infinite loop.</div>`
    },

    /* ---------------------------------------------------------------- WEEK 2 */
    {
      n: 2,
      title: 'Uninformed &amp; Informed Search Algorithms',
      plain: 'Uninformed & Informed Search',
      lecture: R`
<h3>Core Definitions &amp; Math</h3>
<p><b>Search problem.</b> A 5-tuple:</p>
<div class="formula">$$\langle\, S_0,\; \text{Actions}(s),\; \text{Result}(s,a),\; \text{Goal-Test}(s),\; \text{Path-Cost}(p)\,\rangle$$</div>
<p>Every algorithm below runs the same loop: pop a node from the frontier, test it, expand it. Only the frontier ordering changes.</p>
<table class="t">
<tr><th>Algorithm</th><th>Frontier order</th><th>Time</th><th>Space</th><th>Optimal</th></tr>
<tr><td>BFS</td><td>FIFO queue</td><td>$O(b^d)$</td><td>$O(b^d)$</td><td>If costs equal</td></tr>
<tr><td>DFS</td><td>LIFO stack</td><td>$O(b^m)$</td><td>$O(bm)$</td><td>No</td></tr>
<tr><td>UCS</td><td>Min $g(n)$</td><td>$O(b^{1+\lfloor C^*/\epsilon \rfloor})$</td><td>same</td><td>Yes</td></tr>
<tr><td>Greedy</td><td>Min $h(n)$</td><td>$O(b^m)$</td><td>$O(b^m)$</td><td>No</td></tr>
<tr><td>A*</td><td>Min $f(n)$</td><td>Depends on $h$</td><td>Often large</td><td>Yes, see below</td></tr>
</table>
<p>Here $b$ is the branching factor, $d$ the depth of the shallowest goal, $m$ the maximum depth, $C^*$ the optimal cost, $\epsilon$ the smallest step cost.</p>
<div class="formula">$$f(n) = g(n) + h(n)$$</div>
<p><b>Admissible:</b> $h(n) \le h^*(n)$ for every node, so $h$ never overestimates the true remaining cost. This makes A* tree search optimal.</p>
<p><b>Consistent:</b> $h(n) \le c(n, a, n') + h(n')$ for every edge, a triangle inequality. Then $f$ never decreases along a path, and A* graph search never has to reopen a closed node. Consistent implies admissible.</p>
<h3>In My Own Words (Engineering Intuition)</h3>
<p class="own">UCS looks only backward and knows what it has paid. Greedy looks only forward and knows what it hopes to pay. A* adds the two, so $f(n)$ estimates the total price of a route through $n$. An admissible heuristic is an optimistic quote. When the goal is popped, every path left on the frontier has a quote at least as high as the goal's real cost, so none of them can turn out cheaper. A better heuristic keeps the same answer and stops the search from wasting time on nodes that look cheap and lead nowhere.</p>`,
      practiceTitle: 'Routing on a 5-Node Weighted Graph',
      practice: R`
<h3>Weekly Practical Task / Case Study</h3>
<p>Route from $S$ to $G$ on a directed weighted graph. Compare what BFS, UCS and A* return and how many nodes each expands. The heuristic is admissible and consistent.</p>
<div class="split wide-l">
<svg class="fig" viewBox="0 0 340 128" role="img" aria-label="Directed graph. S to A cost 2, S to B cost 1, A to C cost 2, B to C cost 5, B to G cost 9, C to G cost 3. Optimal path is S, A, C, G.">
${ARROW}
<path d="M38 56 112 24" class="ln acc" marker-end="url(#arr)"/><path d="M38 70 112 98" class="ln" marker-end="url(#arr)"/>
<path d="M144 20 208 52" class="ln acc" marker-end="url(#arr)"/><path d="M144 102 208 72" class="ln" marker-end="url(#arr)"/>
<path d="M240 62H298" class="ln acc" marker-end="url(#arr)"/><path d="M144 110Q240 136 304 78" class="ln" marker-end="url(#arr)"/>
<text x="68" y="31" class="wt">2</text><text x="68" y="99" class="wt">1</text><text x="178" y="28" class="wt">2</text><text x="170" y="78" class="wt">5</text><text x="266" y="55" class="wt">3</text><text x="256" y="118" class="wt">9</text>
<g class="nd"><circle cx="24" cy="62" r="15"/><circle cx="128" cy="18" r="15"/><circle cx="128" cy="106" r="15"/><circle cx="224" cy="62" r="15"/><circle cx="316" cy="62" r="15"/></g>
<g class="lb" text-anchor="middle"><text x="24" y="66">S</text><text x="128" y="22">A</text><text x="128" y="110">B</text><text x="224" y="66">C</text><text x="316" y="66">G</text></g>
</svg>
<table class="t tight">
<tr><th>$n$</th><th>$h(n)$</th><th>$h^*(n)$</th></tr>
<tr><td>S</td><td>6</td><td>7</td></tr><tr><td>A</td><td>4</td><td>5</td></tr><tr><td>B</td><td>7</td><td>8</td></tr><tr><td>C</td><td>3</td><td>3</td></tr><tr><td>G</td><td>0</td><td>0</td></tr>
</table>
</div>
<h3>Step-by-Step Trace: Frontier After Each Pop</h3>
<table class="t tight mono">
<tr><th>Alg</th><th>Pop</th><th>Frontier after the pop</th></tr>
<tr class="grp"><td rowspan="3">BFS</td><td>S</td><td>A, B</td></tr>
<tr><td>A</td><td>B, C</td></tr>
<tr><td>B</td><td>C; G generated, goal test passes, stop</td></tr>
<tr class="grp"><td rowspan="5">UCS</td><td>S (0)</td><td>B:1, A:2</td></tr>
<tr><td>B (1)</td><td>A:2, C:6, G:10</td></tr>
<tr><td>A (2)</td><td>C:4 (was 6), G:10</td></tr>
<tr><td>C (4)</td><td>G:7 (was 10)</td></tr>
<tr><td>G (7)</td><td>goal popped, stop</td></tr>
<tr class="grp"><td rowspan="4">A*</td><td>S (f=6)</td><td>A: 2+4=6, B: 1+7=8</td></tr>
<tr><td>A (f=6)</td><td>C: 4+3=7, B: 8</td></tr>
<tr><td>C (f=7)</td><td>G: 7+0=7, B: 8</td></tr>
<tr><td>G (f=7)</td><td>goal popped, stop; B never expanded</td></tr>
</table>
<table class="t tight">
<tr><th>Result</th><th>Path</th><th>Cost</th><th>Expanded</th></tr>
<tr><td>BFS</td><td>S, B, G</td><td class="bad">10</td><td>3 (S, A, B)</td></tr>
<tr><td>UCS</td><td>S, A, C, G</td><td class="good">7</td><td>4 (S, B, A, C)</td></tr>
<tr><td>A*</td><td>S, A, C, G</td><td class="good">7</td><td>3 (S, A, C)</td></tr>
</table>
<div class="take"><b>Key Takeaway</b>BFS minimizes edges, UCS minimizes cost, and A* reaches the same cost as UCS with fewer expansions.</div>`
    },

    /* ---------------------------------------------------------------- WEEK 3 */
    {
      n: 3,
      title: 'Adversarial Search &amp; Games',
      plain: 'Adversarial Search & Games',
      lecture: R`
<h3>Core Definitions &amp; Math</h3>
<p><b>Zero-sum game.</b> Two players whose utilities sum to a constant: my gain is exactly your loss. MAX wants the highest utility, MIN wants the lowest, and each assumes the other plays perfectly.</p>
<p><b>Minimax.</b> The value of a state is defined recursively:</p>
<div class="formula">$$V(s)=\begin{cases}\text{Utility}(s) & \text{terminal}\\ \max_{a} V(\text{Result}(s,a)) & \text{MAX to move}\\ \min_{a} V(\text{Result}(s,a)) & \text{MIN to move}\end{cases}$$</div>
<p>Depth-first, so time is $O(b^m)$ and space is $O(bm)$. Chess has $b \approx 35$, $m \approx 80$, which makes exact search impossible.</p>
<p><b>Alpha-Beta Pruning.</b> Carry two bounds down the tree: $\alpha$ is the best value MAX can already force on this path, $\beta$ is the best value MIN can already force. Stop exploring a node as soon as:</p>
<div class="formula">$$\alpha \ge \beta$$</div>
<p>The root value is unchanged. With perfect move ordering, time falls to $O(b^{m/2})$, which doubles the searchable depth for the same budget.</p>
<p><b>Evaluation function.</b> A depth cutoff replaces true utility with a fast estimate, usually a weighted feature sum:</p>
<div class="formula">$$\text{Eval}(s) = \sum_{i} w_i\, f_i(s)$$</div>
<p><b>Expectiminimax.</b> Chance nodes (dice, shuffles) take a probability-weighted average of their children:</p>
<div class="formula">$$V(s) = \sum_{r} P(r)\, V(\text{Result}(s, r))$$</div>
<h3>In My Own Words (Engineering Intuition)</h3>
<p class="own">Pruning is a small proof. Suppose I already have a move worth 4. I open a second move and the opponent's first reply there gives me 3. The opponent would hold me to 3 or less on that branch, so its other replies cannot change my decision. I can skip them with no risk. That is also why move ordering matters so much: strong moves searched first raise $\alpha$ early, and every later branch gets cut sooner. Chance nodes break this easily, since an average depends on every child unless the utilities are bounded.</p>`,
      practiceTitle: 'Alpha-Beta on a 2-Ply Game Tree',
      practice: R`
<h3>Weekly Practical Task / Case Study</h3>
<p>MAX moves at the root, MIN replies at $B$, $C$, $D$, with 9 terminal utilities. Find the root value and the best move, tracking the exact $\alpha, \beta$ bounds, and count how many leaves can be skipped.</p>
<svg class="fig" viewBox="0 0 500 178" role="img" aria-label="Game tree. Root MAX equals 4. MIN node B has leaves 4, 7, 6 and value 4. MIN node C has leaf 3, then leaves 8 and 1 are pruned. MIN node D has leaves 9 and 2, then 6 is pruned.">
<g class="ln"><path d="M250 26 90 72"/><path d="M250 26 250 72"/><path d="M250 26 410 72"/><path d="M90 90 40 140"/><path d="M90 90 90 140"/><path d="M90 90 140 140"/><path d="M250 90 200 140"/><path d="M410 90 360 140"/><path d="M410 90 410 140"/></g>
<path d="M250 26 90 72" class="ln acc"/>
<g class="ln pr"><path d="M250 90 250 140"/><path d="M250 90 300 140"/><path d="M410 90 460 140"/></g>
<g class="nd"><path d="M250 6 268 34H232z"/><path d="M90 92 72 64H108z"/><path d="M250 92 232 64H268z"/><path d="M410 92 392 64H428z"/></g>
<g class="lb" text-anchor="middle"><text x="250" y="28">4</text><text x="90" y="80">4</text><text x="250" y="80">3</text><text x="410" y="80">2</text></g>
<g class="sm" text-anchor="middle"><text x="284" y="24" text-anchor="start">MAX</text><text x="62" y="72" text-anchor="end">B</text><text x="224" y="72" text-anchor="end">C</text><text x="436" y="72" text-anchor="start">D</text></g>
<g class="nd"><rect x="28" y="140" width="24" height="22"/><rect x="78" y="140" width="24" height="22"/><rect x="128" y="140" width="24" height="22"/><rect x="188" y="140" width="24" height="22"/><rect x="348" y="140" width="24" height="22"/><rect x="398" y="140" width="24" height="22"/></g>
<g class="nd prn"><rect x="238" y="140" width="24" height="22"/><rect x="288" y="140" width="24" height="22"/><rect x="448" y="140" width="24" height="22"/></g>
<g class="lb" text-anchor="middle"><text x="40" y="155">4</text><text x="90" y="155">7</text><text x="140" y="155">6</text><text x="200" y="155">3</text><text x="360" y="155">9</text><text x="410" y="155">2</text></g>
<g class="lb prt" text-anchor="middle"><text x="250" y="155">8</text><text x="300" y="155">1</text><text x="460" y="155">6</text></g>
<text x="275" y="174" class="sm acc-t" text-anchor="middle">pruned</text><text x="460" y="174" class="sm acc-t" text-anchor="middle">pruned</text>
</svg>
<h3>Step-by-Step Trace</h3>
<table class="t tight mono">
<tr><th>#</th><th>Node</th><th>Sees</th><th>$\alpha$</th><th>$\beta$</th><th>Action</th></tr>
<tr><td>1</td><td>B</td><td>leaf 4</td><td>$-\infty$</td><td>4</td><td>MIN lowers $\beta$</td></tr>
<tr><td>2</td><td>B</td><td>leaf 7</td><td>$-\infty$</td><td>4</td><td>no change</td></tr>
<tr><td>3</td><td>B</td><td>leaf 6</td><td>$-\infty$</td><td>4</td><td>no change, B returns 4</td></tr>
<tr><td>4</td><td>Root</td><td>B = 4</td><td>4</td><td>$+\infty$</td><td>MAX raises $\alpha$</td></tr>
<tr><td>5</td><td>C</td><td>leaf 3</td><td>4</td><td>3</td><td>MIN lowers $\beta$</td></tr>
<tr class="hot"><td>6</td><td>C</td><td>test</td><td>4</td><td>3</td><td>$4 \ge 3$: cut, skip 8 and 1</td></tr>
<tr><td>7</td><td>Root</td><td>C $\le$ 3</td><td>4</td><td>$+\infty$</td><td>no change</td></tr>
<tr><td>8</td><td>D</td><td>leaf 9</td><td>4</td><td>9</td><td>$4 &lt; 9$: continue</td></tr>
<tr><td>9</td><td>D</td><td>leaf 2</td><td>4</td><td>2</td><td>MIN lowers $\beta$</td></tr>
<tr class="hot"><td>10</td><td>D</td><td>test</td><td>4</td><td>2</td><td>$4 \ge 2$: cut, skip 6</td></tr>
<tr><td>11</td><td>Root</td><td>D $\le$ 2</td><td>4</td><td>$+\infty$</td><td>no change, return 4</td></tr>
</table>
<p><b>Check with full minimax:</b> $B = \min(4,7,6) = 4$, $C = \min(3,8,1) = 1$, $D = \min(9,2,6) = 2$, root $= \max(4,1,2) = 4$. Same value and same move ($B$). Alpha-Beta reported $C \le 3$, a bound rather than the exact value 1, and that was enough. It evaluated 6 of 9 leaves.</p>
<div class="take"><b>Key Takeaway</b>Alpha-Beta skips only branches that cannot change the root decision, so the answer stays exact while the work drops.</div>`
    },

    /* ---------------------------------------------------------------- WEEK 4 */
    {
      n: 4,
      title: 'Constraint Satisfaction Problems (CSP)',
      plain: 'Constraint Satisfaction Problems',
      lecture: R`
<h3>Core Definitions &amp; Math</h3>
<p><b>CSP.</b> A triplet $(X, D, C)$: variables $X = \{X_1, \dots, X_n\}$, a domain $D_i$ for each variable, and constraints $C$ that list which value combinations are allowed. A solution is a complete, consistent assignment.</p>
<p><b>Backtracking search.</b> Depth-first, one variable per level. Assign a value, check the constraints, and undo on failure. Worst case is $O(d^n)$ for domain size $d$, which is why ordering heuristics matter:</p>
<table class="t">
<tr><th>Heuristic</th><th>Question</th><th>Choice</th></tr>
<tr><td>MRV</td><td>Which variable next?</td><td>Smallest remaining domain, $\min |D_i|$</td></tr>
<tr><td>Degree</td><td>Tie on MRV?</td><td>Most constraints on unassigned variables</td></tr>
<tr><td>LCV</td><td>Which value first?</td><td>Removes the fewest neighbor values</td></tr>
</table>
<p>The asymmetry is deliberate. Variables are chosen fail-first, since every variable must be assigned anyway. Values are chosen fail-last, since only one value has to work.</p>
<p><b>Forward Checking.</b> After $X_i = v$, delete $v$-conflicting values from each unassigned neighbor. An empty domain means immediate backtrack.</p>
<p><b>Arc Consistency.</b> Arc $X_i \to X_j$ is consistent when every value of $X_i$ has some partner in $X_j$:</p>
<div class="formula">$$\forall x \in D_i\;\; \exists y \in D_j :\; (x, y) \in C_{ij}$$</div>
<p><b>AC-3.</b> Keep a queue of arcs. Pop $X_i \to X_j$ and revise $D_i$. If $D_i$ shrank, re-enqueue every $X_k \to X_i$. With $c$ binary constraints, time is $O(c\,d^3)$. An empty domain proves there is no solution under the current assignment.</p>
<h3>In My Own Words (Engineering Intuition)</h3>
<p class="own">Generic search treats a state as a black box. A CSP opens the box, so the solver can see why a state is bad and throw away whole regions at once. I think of MRV as doing the hardest job first: if a variable has one option left and that option will fail, I want to learn it now, while few decisions depend on it. Forward Checking looks one edge ahead. AC-3 keeps propagating until nothing changes, so it catches contradictions between two variables that are both still unassigned. Forward Checking misses those. More propagation per node means fewer nodes, and on hard problems that trade pays off.</p>`,
      practiceTitle: 'Map Coloring with MRV + Forward Checking',
      practice: R`
<h3>Weekly Practical Task / Case Study</h3>
<p>Color four regions $W, X, Y, Z$ with $\{R, G, B\}$ so that adjacent regions differ. Borders: $W\text{-}X$, $W\text{-}Y$, $X\text{-}Y$, $X\text{-}Z$, $Y\text{-}Z$.</p>
<div class="split wide-r">
<svg class="fig" viewBox="0 0 200 150" role="img" aria-label="Constraint graph. W and Z are not adjacent, X and Y are adjacent to everything. Final coloring: X red, Y green, W and Z blue.">
<g class="ln"><path d="M36 75 100 24"/><path d="M36 75 100 126"/><path d="M100 24V126"/><path d="M100 24 164 75"/><path d="M100 126 164 75"/></g>
<circle cx="36" cy="75" r="19" class="c-b"/><circle cx="100" cy="24" r="19" class="c-r"/><circle cx="100" cy="126" r="19" class="c-g"/><circle cx="164" cy="75" r="19" class="c-b"/>
<g class="lb wh" text-anchor="middle"><text x="36" y="79">W</text><text x="100" y="28">X</text><text x="100" y="130">Y</text><text x="164" y="79">Z</text></g>
</svg>
<div>
<table class="t tight">
<tr><th>Region</th><th>Neighbors</th><th>Degree</th></tr>
<tr><td>W</td><td>X, Y</td><td>2</td></tr>
<tr><td>X</td><td>W, Y, Z</td><td>3</td></tr>
<tr><td>Y</td><td>W, X, Z</td><td>3</td></tr>
<tr><td>Z</td><td>X, Y</td><td>2</td></tr>
</table>
</div>
</div>
<h3>Step-by-Step Trace: Domain Reduction</h3>
<table class="t tight mono dom">
<tr><th>#</th><th>Decision</th><th>W</th><th>X</th><th>Y</th><th>Z</th></tr>
<tr><td>0</td><td>Initial domains</td><td>RGB</td><td>RGB</td><td>RGB</td><td>RGB</td></tr>
<tr><td>1</td><td>X = R</td><td class="cut">GB</td><td class="set">R</td><td class="cut">GB</td><td class="cut">GB</td></tr>
<tr><td>2</td><td>Y = G</td><td class="cut">B</td><td>R</td><td class="set">G</td><td class="cut">B</td></tr>
<tr><td>3</td><td>W = B</td><td class="set">B</td><td>R</td><td>G</td><td>B</td></tr>
<tr><td>4</td><td>Z = B</td><td>B</td><td>R</td><td>G</td><td class="set">B</td></tr>
</table>
<p><b>Why each pick.</b></p>
<ul>
<li><b>Step 1.</b> MRV ties (all domains have size 3). Degree ties $X$ and $Y$ at 3, and I break alphabetically. All values tie under LCV, so $R$.</li>
<li><b>Step 2.</b> MRV ties $W, Y, Z$ at size 2. Counting unassigned neighbors only: $Y$ has 2 ($W, Z$), the others have 1. Pick $Y$, then Forward Checking leaves $W$ and $Z$ with $\{B\}$.</li>
<li><b>Steps 3 and 4.</b> Both have one value left, and $W, Z$ are not adjacent, so both take $B$.</li>
</ul>
<p><b>Result:</b> $W{=}B,\ X{=}R,\ Y{=}G,\ Z{=}B$ with 0 backtracks. All 5 constraints hold.</p>
<p><b>Why order matters.</b> Start with the low-degree pair instead: $W{=}R$, $Z{=}G$ is legal, yet it leaves $D_X = D_Y = \{B\}$ on two adjacent regions. Assigning $X{=}B$ empties $D_Y$ and forces a backtrack. Starting at $X, Y$ makes this dead end impossible.</p>
<div class="take"><b>Key Takeaway</b>Assign the most constrained variable first and let Forward Checking expose failures early.</div>`
    },

    /* ---------------------------------------------------------------- WEEK 5 */
    {
      n: 5,
      title: 'Knowledge-Based Agents &amp; Propositional Logic',
      plain: 'Knowledge-Based Agents & Logic',
      lecture: R`
<h3>Core Definitions &amp; Math</h3>
<p><b>Knowledge base (KB).</b> A set of sentences the agent holds as true. The agent loop is TELL (add percepts) and ASK (query for actions).</p>
<p><b>Entailment.</b> $\alpha$ follows from the KB when it is true in every model where the KB is true:</p>
<div class="formula">$$KB \models \alpha \iff M(KB) \subseteq M(\alpha)$$</div>
<p><b>Syntax and semantics.</b> Syntax says which strings are well-formed. Semantics assigns a truth value to a sentence in each model.</p>
<table class="t tight center">
<tr><th>$P$</th><th>$Q$</th><th>$\neg P$</th><th>$P \land Q$</th><th>$P \lor Q$</th><th>$P \Rightarrow Q$</th><th>$P \Leftrightarrow Q$</th></tr>
<tr><td>F</td><td>F</td><td>T</td><td>F</td><td>F</td><td>T</td><td>T</td></tr>
<tr><td>F</td><td>T</td><td>T</td><td>F</td><td>T</td><td>T</td><td>F</td></tr>
<tr><td>T</td><td>F</td><td>F</td><td>F</td><td>T</td><td>F</td><td>F</td></tr>
<tr><td>T</td><td>T</td><td>F</td><td>T</td><td>T</td><td>T</td><td>T</td></tr>
</table>
<p>A truth table with $n$ symbols has $2^n$ rows. Model checking is sound and complete, and exponential.</p>
<p><b>Conjunctive Normal Form (CNF).</b> An AND of clauses, where each clause is an OR of literals. Four conversion steps:</p>
<ol>
<li>Replace $\alpha \Leftrightarrow \beta$ with $(\alpha \Rightarrow \beta) \land (\beta \Rightarrow \alpha)$.</li>
<li>Replace $\alpha \Rightarrow \beta$ with $\neg \alpha \lor \beta$.</li>
<li>Push $\neg$ inward with De Morgan, cancel $\neg\neg$.</li>
<li>Distribute $\lor$ over $\land$.</li>
</ol>
<p><b>Inference rules.</b> Modus Ponens on the left, Resolution on the right:</p>
<div class="formula">$$\frac{\alpha \Rightarrow \beta,\quad \alpha}{\beta} \qquad\qquad \frac{a \lor b,\quad \neg b \lor c}{a \lor c}$$</div>
<p><b>Proof by refutation.</b> $KB \models \alpha$ exactly when $KB \land \neg\alpha$ is unsatisfiable. Resolution is sound and refutation-complete for CNF.</p>
<h3>In My Own Words (Engineering Intuition)</h3>
<p class="own">Resolution looks odd until you read it as case analysis. Either $b$ is true or it is false. If true, the second clause gives $c$. If false, the first clause gives $a$. So $a \lor c$ holds both ways, and $b$ can be dropped. To prove something, I assume its opposite and keep combining clauses. Reaching the empty clause means my assumption and the KB cannot both hold. An agent built this way has one big advantage over a reflex table: I can add a new fact and it updates its conclusions without any new code.</p>`,
      practiceTitle: 'Wumpus World: Is Cell (2,2) Safe?',
      practice: R`
<h3>Weekly Practical Task / Case Study</h3>
<p>On a 3x3 grid, a cell is breezy exactly when an adjacent cell has a pit. The agent has visited $(1,1)$, $(1,2)$ and $(2,1)$. It felt no breeze at $(1,2)$ and a breeze at $(2,1)$. Prove that $(2,2)$ has no pit before stepping there.</p>
<div class="split wide-r">
<svg class="fig" viewBox="0 0 186 186" role="img" aria-label="Three by three Wumpus grid. Cell 1,1 visited. Cell 1,2 visited with no breeze. Cell 2,1 visited with breeze. Cell 2,2 proved safe. Cell 3,1 contains the deduced pit.">
<g class="cells"><rect x="3" y="3" width="60" height="60"/><rect x="63" y="3" width="60" height="60"/><rect x="123" y="3" width="60" height="60"/><rect x="3" y="63" width="60" height="60" class="seen"/><rect x="63" y="63" width="60" height="60" class="safe"/><rect x="123" y="63" width="60" height="60"/><rect x="3" y="123" width="60" height="60" class="seen"/><rect x="63" y="123" width="60" height="60" class="seen"/><rect x="123" y="123" width="60" height="60" class="pit"/></g>
<g class="sm" text-anchor="middle"><text x="33" y="20">(1,3)</text><text x="93" y="20">(2,3)</text><text x="153" y="20">(3,3)</text><text x="33" y="80">(1,2)</text><text x="93" y="80" class="wh">(2,2)</text><text x="153" y="80">(3,2)</text><text x="33" y="140">(1,1)</text><text x="93" y="140">(2,1)</text><text x="153" y="140" class="wh">(3,1)</text></g>
<g class="lb" text-anchor="middle"><text x="33" y="104">no B</text><text x="93" y="104" class="wh">safe</text><text x="33" y="164">start</text><text x="93" y="164">B</text><text x="153" y="164" class="wh">pit</text></g>
</svg>
<div>
<p class="tiny"><b>Physics of the two percept cells:</b></p>
<div class="formula s">$$B_{1,2} \Leftrightarrow P_{1,1} \lor P_{2,2} \lor P_{1,3}$$</div>
<div class="formula s">$$B_{2,1} \Leftrightarrow P_{1,1} \lor P_{3,1} \lor P_{2,2}$$</div>
<p class="tiny">The forward direction of the first rule converts to CNF as $(\neg P_{1,1} \lor B_{1,2}) \land (\neg P_{2,2} \lor B_{1,2}) \land (\neg P_{1,3} \lor B_{1,2})$.</p>
</div>
</div>
<h3>Step-by-Step Trace: Resolution Refutation</h3>
<table class="t tight">
<tr><th>ID</th><th>Clause</th><th>Source</th></tr>
<tr><td>C1</td><td>$\neg P_{2,2} \lor B_{1,2}$</td><td>Physics, CNF</td></tr>
<tr><td>C2</td><td>$\neg B_{1,2}$</td><td>Percept at $(1,2)$</td></tr>
<tr class="hot"><td>C3</td><td>$P_{2,2}$</td><td>Negated query</td></tr>
<tr><td>C4</td><td>$B_{1,2}$</td><td>Resolve C3, C1 on $P_{2,2}$</td></tr>
<tr class="hot"><td>C5</td><td>$\square$ (empty clause)</td><td>Resolve C4, C2 on $B_{1,2}$</td></tr>
</table>
<p>The empty clause means $KB \land P_{2,2}$ is unsatisfiable, so $KB \models \neg P_{2,2}$. <b>Cell $(2,2)$ is safe from pits.</b></p>
<p><b>The same KB also locates the pit.</b> From $B_{2,1}$ and the second rule: $P_{1,1} \lor P_{3,1} \lor P_{2,2}$. Resolving with $\neg P_{1,1}$ (the first CNF clause and C2) and $\neg P_{2,2}$ (just proved) leaves $P_{3,1}$.</p>
<p class="tiny">Scope: this proves freedom from pits only. Wumpus safety needs the same argument over stench percepts.</p>
<div class="take"><b>Key Takeaway</b>A cell with no breeze clears all its neighbors, and the agent can prove this from clauses alone.</div>`
    },

    /* ---------------------------------------------------------------- WEEK 6 */
    {
      n: 6,
      title: 'First-Order Logic &amp; Reasoning Under Uncertainty',
      plain: 'First-Order Logic & Uncertainty',
      lecture: R`
<h3>Core Definitions &amp; Math</h3>
<p><b>First-Order Logic.</b> Adds objects, relations and quantifiers, so one sentence covers a whole domain:</p>
<div class="formula">$$\forall x\; \text{Drone}(x) \Rightarrow \text{Flies}(x) \qquad \exists x\; \text{Drone}(x) \land \text{Lost}(x)$$</div>
<p>Pair $\forall$ with $\Rightarrow$ and $\exists$ with $\land$. Swapping them is the classic bug: $\forall x\, \text{Drone}(x) \land \text{Flies}(x)$ claims that everything is a flying drone.</p>
<p><b>Unification.</b> Finds a substitution $\theta$ that makes two sentences identical:</p>
<div class="formula">$$\text{Unify}(\text{Knows}(A, x),\, \text{Knows}(y, B)) = \{y/A,\ x/B\}$$</div>
<p>This is what lets a general rule fire on a specific fact.</p>
<p><b>Conditional probability.</b> Restrict to the worlds where $B$ holds, then renormalize:</p>
<div class="formula">$$P(A \mid B) = \frac{P(A \land B)}{P(B)}$$</div>
<p><b>Bayes' Rule.</b> Inverts the direction of a conditional:</p>
<div class="formula">$$P(H \mid E) = \frac{P(E \mid H)\, P(H)}{P(E)}, \quad P(E) = \sum_{h} P(E \mid h)\, P(h)$$</div>
<p><b>Bayesian Network.</b> A directed acyclic graph where each node stores $P(X_i \mid \text{Parents}(X_i))$. The joint distribution factorizes:</p>
<div class="formula">$$P(X_1, \dots, X_n) = \prod_{i=1}^{n} P(X_i \mid \text{Parents}(X_i))$$</div>
<p><b>Conditional independence.</b> $P(A, B \mid C) = P(A \mid C)\, P(B \mid C)$. Each node is independent of its non-descendants given its parents. For $n$ binary variables with at most $k$ parents, storage falls from $2^n$ entries to $n \cdot 2^k$.</p>
<h3>In My Own Words (Engineering Intuition)</h3>
<p class="own">Logic stores what is certainly true. A real sensor gives me only how likely something is, so I need numbers that update. Bayes is that update. The prior is my belief before the evidence, the likelihood says how well the hypothesis explains the evidence, and the denominator keeps everything summing to one. The mistake I now watch for is confusing $P(E \mid H)$ with $P(H \mid E)$. A test that catches 95% of sick patients says nothing yet about a patient who tested positive, because that answer also depends on how rare the disease is. Networks make this tractable: instead of one giant table, each variable only talks to its parents.</p>`,
      practiceTitle: 'Medical Test and the False-Positive Trap',
      practice: R`
<h3>Weekly Practical Task / Case Study</h3>
<p>A disease affects 1% of a population. A test has 95% sensitivity and a 5% false-positive rate. A patient tests positive. What is the probability they are sick, and how does the false-positive rate (FPR) change that?</p>
<h3>Step-by-Step Trace</h3>
<div class="formula s">$$P(D) = 0.01,\quad P(+ \mid D) = 0.95,\quad P(+ \mid \neg D) = 0.05$$</div>
<p><b>Step 1. Evidence, by total probability:</b></p>
<div class="formula s">$$P(+) = 0.95 \cdot 0.01 + 0.05 \cdot 0.99 = 0.0095 + 0.0495 = 0.059$$</div>
<p><b>Step 2. Posterior, by Bayes:</b></p>
<div class="formula s">$$P(D \mid +) = \frac{0.0095}{0.059} \approx 0.161$$</div>
<p>Only 16.1%, despite a test that sounds 95% accurate.</p>
<p><b>Step 3. Check with counts,</b> per 10,000 people:</p>
<table class="t tight center">
<tr><th></th><th>Test +</th><th>Test $-$</th><th>Total</th></tr>
<tr><th>Sick</th><td class="good">95</td><td>5</td><td>100</td></tr>
<tr><th>Healthy</th><td class="bad">495</td><td>9,405</td><td>9,900</td></tr>
<tr><th>Total</th><td>590</td><td>9,410</td><td>10,000</td></tr>
</table>
<p>$95 / 590 = 16.1\%$. False positives outnumber true positives 495 to 95 because the healthy group is 99 times larger.</p>
<p><b>Step 4. False-positive rate analysis,</b> holding sensitivity and prevalence fixed:</p>
<table class="t tight center">
<tr><th>FPR</th><th>$P(+)$</th><th>$P(D \mid +)$</th><th>Reading</th></tr>
<tr><td>10%</td><td>0.1085</td><td>8.8%</td><td>Mostly false alarms</td></tr>
<tr class="hot"><td>5%</td><td>0.0590</td><td>16.1%</td><td>This test</td></tr>
<tr><td>1%</td><td>0.0194</td><td>49.0%</td><td>A coin flip</td></tr>
<tr><td>0.1%</td><td>0.0105</td><td>90.6%</td><td>Close to a diagnosis</td></tr>
</table>
<p><b>Step 5. Retest.</b> A second positive from an independent test multiplies the odds by the likelihood ratio $0.95 / 0.05 = 19$:</p>
<div class="formula s">$$\text{odds} = \frac{0.0095}{0.0495} \cdot 19 \approx 3.65 \;\Rightarrow\; P(D \mid {+}{+}) \approx 78.5\%$$</div>
<p class="tiny">The same arithmetic applies to spam filters: when spam is rare in a mailbox, FPR dominates the precision of the "spam" label.</p>
<div class="take"><b>Key Takeaway</b>For rare events, lowering the false-positive rate moves the posterior far more than raising sensitivity.</div>`
    },

    /* ---------------------------------------------------------------- WEEK 7 */
    {
      n: 7,
      title: 'Machine Learning Foundations &amp; Supervised Learning',
      plain: 'ML Foundations & Supervised Learning',
      lecture: R`
<h3>Core Definitions &amp; Math</h3>
<p><b>Supervised learning.</b> Given pairs $(x_i, y_i)$ drawn from an unknown distribution, find $f_\theta$ that predicts $y$ on inputs it has not seen.</p>
<p><b>Empirical Risk Minimization.</b> True risk needs the unknown distribution, so I minimize the average loss on the sample:</p>
<div class="formula">$$\hat{\theta} = \arg\min_{\theta}\; \frac{1}{N} \sum_{i=1}^{N} \ell\big(f_\theta(x_i),\, y_i\big)$$</div>
<p><b>Linear Regression.</b> $\hat{y} = wx + b$, or $\hat{y} = \theta^{T}x$ in vector form.</p>
<p><b>MSE Loss.</b> Penalizes large errors quadratically and is convex in $\theta$ for a linear model:</p>
<div class="formula">$$L(\theta) = \frac{1}{N} \sum_{i=1}^{N} (y_i - \hat{y}_i)^2$$</div>
<p><b>Gradient Descent.</b> The gradient points uphill, so step against it. The learning rate $\alpha$ sets the step size:</p>
<div class="formula">$$\theta \leftarrow \theta - \alpha\, \nabla L(\theta)$$</div>
<p>For the line, the two partial derivatives are:</p>
<div class="formula">$$\frac{\partial L}{\partial w} = -\frac{2}{N} \sum x_i (y_i - \hat{y}_i), \qquad \frac{\partial L}{\partial b} = -\frac{2}{N} \sum (y_i - \hat{y}_i)$$</div>
<p><b>Overfitting.</b> Low training error with high test error: the model memorized noise. Underfitting is high error on both.</p>
<p><b>Regularization.</b> Add a penalty that prefers small weights. L2 (Ridge) shrinks all weights, L1 (Lasso) pushes some to exactly zero:</p>
<div class="formula">$$L_{\text{reg}}(\theta) = L(\theta) + \lambda \lVert \theta \rVert_2^2$$</div>
<h3>In My Own Words (Engineering Intuition)</h3>
<p class="own">Training is search again, only over a continuous parameter space, where the gradient plays the role of a heuristic that is free to compute. Stand on the loss surface, check which way is steepest, step down. If $\alpha$ is too large the updates overshoot and diverge, and if it is too small the budget runs out before convergence. The part I find most important is that low training loss proves very little. ERM optimizes a stand-in for what I actually want, so I keep a test set untouched and treat its error as the only honest number. Regularization encodes a simple bet: among models that fit about equally, the smoother one will usually generalize better.</p>`,
      practiceTitle: 'One Gradient Descent Step by Hand',
      practice: R`
<h3>Weekly Practical Task / Case Study</h3>
<p>Fit $\hat{y} = wx + b$ on three training points, $(1,2)$, $(2,4)$, $(3,5)$. Start at $w = 0$, $b = 0$, with $\alpha = 0.05$. Run one full-batch update by hand, then score the model on a held-out test set, $(4,8)$ and $(5,9)$. That is a 60/40 split.</p>
<h3>Step-by-Step Trace</h3>
<p><b>Step 1. Forward pass and loss</b> ($\hat{y}_i = 0$ for all points):</p>
<table class="t tight center">
<tr><th>$x_i$</th><th>$y_i$</th><th>$\hat{y}_i$</th><th>$e_i = y_i - \hat{y}_i$</th><th>$e_i^2$</th><th>$x_i e_i$</th></tr>
<tr><td>1</td><td>2</td><td>0</td><td>2</td><td>4</td><td>2</td></tr>
<tr><td>2</td><td>4</td><td>0</td><td>4</td><td>16</td><td>8</td></tr>
<tr><td>3</td><td>5</td><td>0</td><td>5</td><td>25</td><td>15</td></tr>
<tr><th>Sum</th><td></td><td></td><td>11</td><td>45</td><td>25</td></tr>
</table>
<div class="formula s">$$L = 45 / 3 = 15$$</div>
<p><b>Step 2. Gradients:</b></p>
<div class="formula s">$$\frac{\partial L}{\partial w} = -\tfrac{2}{3}(25) = -16.667, \qquad \frac{\partial L}{\partial b} = -\tfrac{2}{3}(11) = -7.333$$</div>
<p><b>Step 3. Update:</b></p>
<div class="formula s">$$w = 0 + 0.05(16.667) = 0.833, \qquad b = 0 + 0.05(7.333) = 0.367$$</div>
<p><b>Step 4. Check.</b> New predictions are $1.20$, $2.03$, $2.87$. Squared errors are $0.64$, $3.87$, $4.55$, so $L = 9.06 / 3 = 3.02$. One step cut the loss from 15 to 3.02, an 80% drop.</p>
<p><b>Step 5. Train and test evaluation.</b></p>
<table class="t tight center">
<tr><th>Model</th><th>$w$</th><th>$b$</th><th>Train MSE</th><th>Test MSE</th></tr>
<tr><td>Initial</td><td>0</td><td>0</td><td>15.00</td><td>72.50</td></tr>
<tr><td>After 1 step</td><td>0.833</td><td>0.367</td><td>3.02</td><td>19.22</td></tr>
<tr class="hot"><td>Converged</td><td>1.500</td><td>0.667</td><td>0.056</td><td>1.24</td></tr>
</table>
<p>The converged values come from the normal equations, $w = S_{xy} / S_{xx} = 3 / 2$ and $b = \bar{y} - w\bar{x} = 2/3$. Test MSE is 22 times the train MSE. With three training points and extrapolation to $x = 4, 5$, a gap like this is expected.</p>
<div class="code"><span class="c"># the same step in code</span>
e = y - (w*x + b)
w += alpha * 2 * (x*e).mean()
b += alpha * 2 * e.mean()</div>
<div class="take"><b>Key Takeaway</b>Trust the test error, because the training loss can only tell you the optimizer is working.</div>`
    },

    /* ---------------------------------------------------------------- WEEK 8 */
    {
      n: 8,
      title: 'Classification, Decision Trees &amp; Model Evaluation',
      plain: 'Classification, Trees & Evaluation',
      lecture: R`
<h3>Core Definitions &amp; Math</h3>
<p><b>Logistic Regression.</b> A linear score squashed into a probability by the sigmoid:</p>
<div class="formula">$$\sigma(z) = \frac{1}{1 + e^{-z}}, \qquad P(y{=}1 \mid x) = \sigma(w^{T}x + b)$$</div>
<p><b>Cross-Entropy loss.</b> The negative log-likelihood. It is convex for this model, and a confident wrong answer costs a lot:</p>
<div class="formula">$$L = -\frac{1}{N} \sum_{i} \big[\, y_i \log \hat{y}_i + (1 - y_i) \log (1 - \hat{y}_i) \,\big]$$</div>
<p><b>Shannon Entropy.</b> Impurity of a set $S$, in bits. It is 0 for a pure set, and 1 for a 50/50 binary split:</p>
<div class="formula">$$H(S) = -\sum_{i} p_i \log_2 p_i$$</div>
<p><b>Information Gain.</b> The entropy removed by splitting on attribute $A$. A decision tree greedily picks the highest gain, then recurses on each subset:</p>
<div class="formula">$$IG(S, A) = H(S) - \sum_{v \in \text{Values}(A)} \frac{|S_v|}{|S|}\, H(S_v)$$</div>
<p><b>Confusion Matrix.</b> Counts of $TP, FP, FN, TN$. Three metrics read from it:</p>
<div class="formula">$$\text{Precision} = \frac{TP}{TP + FP} \qquad \text{Recall} = \frac{TP}{TP + FN}$$</div>
<div class="formula">$$F_1 = \frac{2 \cdot \text{Precision} \cdot \text{Recall}}{\text{Precision} + \text{Recall}}$$</div>
<p>Precision answers: of everything I flagged, how much was right? Recall answers: of everything real, how much did I catch?</p>
<h3>In My Own Words (Engineering Intuition)</h3>
<p class="own">Entropy is the number of yes/no questions I still need, on average, to identify the class. A good split is the question that shrinks that number the most, which is why trees feel like playing twenty questions against the data. Trees overfit if they keep splitting until every leaf is pure, so I limit depth or prune. On metrics, accuracy misleads whenever classes are imbalanced: a model that says "no fraud" every time scores 99.9% and catches nothing. I choose by the cost of the error. A cancer screen protects recall, because a miss is expensive. A spam filter protects precision, because losing a real email is worse than reading a junk one. $F_1$ uses the harmonic mean, so it stays low unless both are good.</p>`,
      practiceTitle: 'Spam Tree Root Split and F1-Score',
      practice: R`
<h3>Weekly Practical Task / Case Study</h3>
<p>From 10 labeled emails (6 spam, 4 ham), pick the root feature for a decision tree. Then evaluate a separate trained classifier from its confusion matrix on 200 test emails.</p>
<h3>Step-by-Step Trace, Part 1: Root Split</h3>
<p><b>Entropy of the full set:</b></p>
<div class="formula s">$$H(S) = -0.6 \log_2 0.6 - 0.4 \log_2 0.4 = 0.971 \text{ bits}$$</div>
<table class="t tight center">
<tr><th>Feature</th><th>Value</th><th>Spam / Ham</th><th>$H(S_v)$</th><th>Weight</th></tr>
<tr class="grp hot"><td rowspan="2">ALL_CAPS subject</td><td>yes</td><td>4 / 0</td><td>0.000</td><td>0.4</td></tr>
<tr class="hot"><td>no</td><td>2 / 4</td><td>0.918</td><td>0.6</td></tr>
<tr class="grp"><td rowspan="2">Has link</td><td>yes</td><td>4 / 1</td><td>0.722</td><td>0.5</td></tr>
<tr><td>no</td><td>2 / 3</td><td>0.971</td><td>0.5</td></tr>
<tr class="grp"><td rowspan="2">Attachment</td><td>yes</td><td>2 / 1</td><td>0.918</td><td>0.3</td></tr>
<tr><td>no</td><td>4 / 3</td><td>0.985</td><td>0.7</td></tr>
</table>
<div class="formula s">$$IG(\text{Caps}) = 0.971 - (0.4 \cdot 0 + 0.6 \cdot 0.918) = \mathbf{0.420}$$</div>
<div class="formula s">$$IG(\text{Link}) = 0.971 - (0.5 \cdot 0.722 + 0.5 \cdot 0.971) = 0.125$$</div>
<div class="formula s">$$IG(\text{Attach}) = 0.971 - (0.3 \cdot 0.918 + 0.7 \cdot 0.985) = 0.006$$</div>
<p><b>Root = ALL_CAPS subject.</b> Its "yes" branch is already pure (all spam) and becomes a leaf. Only the "no" branch keeps splitting.</p>
<h3>Step-by-Step Trace, Part 2: F1-Score</h3>
<div class="split wide-r">
<table class="t tight center cm">
<tr><th></th><th>Pred spam</th><th>Pred ham</th></tr>
<tr><th>Is spam</th><td class="good">TP = 40</td><td class="bad">FN = 20</td></tr>
<tr><th>Is ham</th><td class="bad">FP = 10</td><td class="good">TN = 130</td></tr>
</table>
<div>
<div class="formula s">$$\text{Precision} = \tfrac{40}{50} = 0.800$$</div>
<div class="formula s">$$\text{Recall} = \tfrac{40}{60} = 0.667$$</div>
<div class="formula s">$$F_1 = \tfrac{2(0.8)(0.667)}{0.8 + 0.667} = 0.727$$</div>
</div>
</div>
<p>Accuracy is $170 / 200 = 0.85$, which hides that a third of all spam gets through. $F_1 = 0.727$ reports the weakness.</p>
<div class="take"><b>Key Takeaway</b>Split on the highest Information Gain, and report F1 instead of accuracy when classes are imbalanced.</div>`
    },

    /* ---------------------------------------------------------------- WEEK 9 */
    {
      n: 9,
      title: 'Neural Networks &amp; Deep Learning',
      plain: 'Neural Networks & Deep Learning',
      lecture: R`
<h3>Core Definitions &amp; Math</h3>
<p><b>Perceptron.</b> A weighted sum followed by a threshold. It can only draw a single line (a hyperplane) through the input space.</p>
<p><b>Multi-Layer Perceptron (MLP).</b> Stacked layers, each an affine map followed by a non-linearity $\phi$:</p>
<div class="formula">$$z = Wx + b, \qquad a = \phi(z)$$</div>
<p>Without $\phi$, any number of layers collapses into one linear map.</p>
<table class="t">
<tr><th>Activation</th><th>Formula</th><th>Typical use</th></tr>
<tr><td>ReLU</td><td>$\max(0, z)$</td><td>Hidden layers; gradient stays 1 for $z &gt; 0$</td></tr>
<tr><td>Sigmoid</td><td>$\dfrac{1}{1 + e^{-z}}$</td><td>Binary output; saturates at the tails</td></tr>
<tr><td>Softmax</td><td>$\dfrac{e^{z_i}}{\sum_j e^{z_j}}$</td><td>Multi-class output; sums to 1</td></tr>
</table>
<p><b>Forward Pass.</b> Compute layer by layer and store every intermediate value:</p>
<div class="formula">$$a^{(l)} = \phi\big(W^{(l)} a^{(l-1)} + b^{(l)}\big), \qquad a^{(0)} = x$$</div>
<p><b>Backpropagation.</b> The chain rule applied from the output backward, reusing stored values. For a weight in layer $l$:</p>
<div class="formula">$$\frac{\partial L}{\partial W^{(l)}} = \frac{\partial L}{\partial a^{(L)}} \cdot \frac{\partial a^{(L)}}{\partial a^{(L-1)}} \cdots \frac{\partial a^{(l)}}{\partial W^{(l)}}$$</div>
<p>One backward pass costs about the same as one forward pass and returns every gradient at once.</p>
<p><b>Why XOR needs depth.</b> One line would need $b &lt; 0$, $w_1 + b &gt; 0$, $w_2 + b &gt; 0$ and $w_1 + w_2 + b &lt; 0$. Adding the middle two gives $w_1 + w_2 + 2b &gt; 0$, yet the first and last sum to a negative number. Contradiction.</p>
<h3>In My Own Words (Engineering Intuition)</h3>
<p class="own">A hidden layer does not solve the problem directly. It moves the data into a new space where the problem turns linear, and the last layer then only has to draw a line. Backpropagation is bookkeeping. Each weight asks how much the loss would change if it moved slightly, and the chain rule answers by multiplying local sensitivities along the path to the output. That product also explains the vanishing gradient: chain many sigmoids, each with slope at most 0.25, and early layers barely learn. ReLU keeps the slope at 1 on its active side, which is a main reason deep networks became trainable.</p>`,
      practiceTitle: 'Solving XOR with a 2-Layer Network',
      practice: R`
<h3>Weekly Practical Task / Case Study</h3>
<p>Build a 2-2-1 network that computes XOR, verify it on all four inputs, then switch to sigmoid units and trace one backpropagation update on a single weight.</p>
<div class="split wide-l">
<svg class="fig" viewBox="0 0 270 136" role="img" aria-label="Network with inputs x1 and x2, hidden units h1 and h2, and output y. All input to hidden weights are 1. Hidden biases are minus 0.5 and minus 1.5. Output weights are 1 and minus 2, output bias minus 0.5.">
<g class="ln"><path d="M34 34 118 34"/><path d="M34 34 118 102"/><path d="M34 102 118 34"/><path d="M34 102 118 102"/><path d="M142 102 226 68"/></g><path d="M142 34 226 68" class="ln acc"/>
<g class="nd"><circle cx="22" cy="34" r="15"/><circle cx="22" cy="102" r="15"/><circle cx="130" cy="34" r="15"/><circle cx="130" cy="102" r="15"/><circle cx="238" cy="68" r="15"/></g>
<g class="lb" text-anchor="middle"><text x="22" y="38">x1</text><text x="22" y="106">x2</text><text x="130" y="38">h1</text><text x="130" y="106">h2</text><text x="238" y="72">y</text></g>
<g class="wt" text-anchor="middle"><text x="130" y="11">b=-0.5</text><text x="130" y="130">b=-1.5</text><text x="238" y="44">b=-0.5</text><text x="76" y="17">all input w=1</text><text x="185" y="42" class="acc-t">v1=1</text><text x="185" y="102">v2=-2</text></g>
</svg>
<table class="t tight center">
<tr><th>$x_1$</th><th>$x_2$</th><th>$h_1$</th><th>$h_2$</th><th>$y$</th></tr>
<tr><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
<tr><td>0</td><td>1</td><td>1</td><td>0</td><td>1</td></tr>
<tr><td>1</td><td>0</td><td>1</td><td>0</td><td>1</td></tr>
<tr><td>1</td><td>1</td><td>1</td><td>1</td><td>0</td></tr>
</table>
</div>
<p>With step activations, $h_1$ is OR, $h_2$ is AND, and $y = h_1 - 2h_2 - 0.5 &gt; 0$ reads "OR and not AND". All four rows match XOR. In $(h_1, h_2)$ space the data is linearly separable.</p>
<h3>Step-by-Step Trace: One Weight Update</h3>
<p>Replace the steps with sigmoids so gradients exist. Sample $x = (1, 0)$, target $t = 1$, loss $L = \tfrac{1}{2}(\hat{y} - t)^2$, rate $\alpha = 0.5$. Update $v_1$ only.</p>
<table class="t tight">
<tr><th colspan="2">Forward pass</th></tr>
<tr><td>$h_1 = \sigma(1 - 0.5)$</td><td>$= 0.6225$</td></tr>
<tr><td>$h_2 = \sigma(1 - 1.5)$</td><td>$= 0.3775$</td></tr>
<tr><td>$z = 0.6225 - 2(0.3775) - 0.5$</td><td>$= -0.6326$</td></tr>
<tr><td>$\hat{y} = \sigma(-0.6326)$</td><td>$= 0.3469$</td></tr>
<tr><td>$L = \tfrac{1}{2}(0.3469 - 1)^2$</td><td>$= 0.2133$</td></tr>
</table>
<p><b>Backward pass, chain rule:</b></p>
<div class="formula s">$$\frac{\partial L}{\partial v_1} = \underbrace{(\hat{y} - t)}_{-0.6531} \cdot \underbrace{\hat{y}(1 - \hat{y})}_{0.2266} \cdot \underbrace{h_1}_{0.6225} = -0.0921$$</div>
<p><b>Update:</b> $v_1 \leftarrow 1 - 0.5(-0.0921) = 1.0461$.</p>
<p><b>Check:</b> re-running the forward pass gives $\hat{y} = 0.3534$ and $L = 0.2090$. The prediction moved toward 1 and the loss fell. Weights tuned for steps start out too small for sigmoids, and repeated updates grow them. One level deeper, $\partial L / \partial w_{11}$ multiplies in $v_1 \cdot \sigma'(0.5) \cdot x_1$ and equals $-0.0348$.</p>
<div class="take"><b>Key Takeaway</b>Hidden layers remap the input until it is linearly separable, and the chain rule trains every weight toward that.</div>`
    },

    /* ---------------------------------------------------------------- WEEK 10 */
    {
      n: 10,
      title: 'Sequence Models, Transformers &amp; Generative AI (LLMs)',
      plain: 'Transformers & Generative AI',
      lecture: R`
<h3>Core Definitions &amp; Math</h3>
<p><b>Tokenization.</b> Splits text into integer IDs from a fixed vocabulary, usually sub-word pieces.</p>
<p><b>Embeddings.</b> A learned lookup maps each ID to a vector in $\mathbb{R}^{d}$. Similar usage ends up nearby. Position information is added too, since attention itself ignores order.</p>
<p><b>Self-Attention.</b> Each token forms a query $Q$, a key $K$ and a value $V$ through learned linear projections. Scores decide how much of every other token to mix in:</p>
<div class="formula">$$\text{Attention}(Q, K, V) = \text{softmax}\left(\frac{QK^{T}}{\sqrt{d_k}}\right) V$$</div>
<p>Dividing by $\sqrt{d_k}$ controls the variance of the dot products. Without it, large $d_k$ pushes softmax into near one-hot outputs with tiny gradients. A decoder also masks future positions, so a token cannot peek at what it has to predict.</p>
<p><b>Autoregressive prediction.</b> The model outputs a distribution over the next token, samples one, appends it, and repeats:</p>
<div class="formula">$$P(x_1, \dots, x_T) = \prod_{t=1}^{T} P(x_t \mid x_{1:t-1})$$</div>
<p><b>Temperature sampling.</b> Divide logits $z_i$ by $T$ before softmax. $T \to 0$ approaches greedy decoding, and large $T$ approaches uniform:</p>
<div class="formula">$$p_i = \frac{\exp(z_i / T)}{\sum_{j} \exp(z_j / T)}$$</div>
<p><b>RAG (Retrieval-Augmented Generation).</b> Embed the query, retrieve the top-$k$ documents by cosine similarity, and place them in the prompt:</p>
<div class="formula">$$\text{cos}(q, d) = \frac{q \cdot d}{\lVert q \rVert\, \lVert d \rVert}$$</div>
<h3>In My Own Words (Engineering Intuition)</h3>
<p class="own">Attention is a differentiable lookup table. A dictionary returns one exact match. Attention returns a weighted blend of every entry, with weights set by how well each key fits the query. An RNN has to squeeze a whole sentence through one hidden state and read it in order, while attention connects any two positions in one step and runs in parallel. An LLM is therefore a next-token predictor, with no fact store inside it. It produces likely text, which is often true and sometimes confidently false. RAG is the practical fix: rather than trusting what the weights recall, I hand the model the source text and let it read. Temperature is the risk dial: low for code and extraction, higher for brainstorming.</p>`,
      practiceTitle: 'Attention Weights and Decoding Strategies',
      practice: R`
<h3>Weekly Practical Task / Case Study</h3>
<p>Trace self-attention by hand over the 4-token sentence <span class="m">the drone lost signal</span>, then compare greedy decoding with temperature sampling on the next token.</p>
<h3>Step-by-Step Trace, Part 1: Attention</h3>
<p>Toy embeddings with $d_k = 2$, and $Q = K = V = X$ (projections omitted):</p>
<div class="formula s">$$\text{the}=[0.2, 0.1],\ \text{drone}=[1, 0.4],\ \text{lost}=[0.6, 0.9],\ \text{signal}=[1, 0.6]$$</div>
<p>Query <span class="m">lost</span>, dividing dot products by $\sqrt{2}$:</p>
<table class="t tight center">
<tr><th>Key</th><th>the</th><th>drone</th><th>lost</th><th>signal</th></tr>
<tr><th>$q \cdot k$</th><td>0.21</td><td>0.96</td><td>1.17</td><td>1.14</td></tr>
<tr><th>$\div \sqrt{2}$</th><td>0.148</td><td>0.679</td><td>0.827</td><td>0.806</td></tr>
<tr><th>softmax</th><td>0.151</td><td>0.257</td><td>0.299</td><td>0.292</td></tr>
</table>
<p>Output for <span class="m">lost</span>: $0.151\,v_{\text{the}} + 0.257\,v_{\text{drone}} + 0.299\,v_{\text{lost}} + 0.292\,v_{\text{signal}} = [0.759, 0.562]$. The vector moved from $[0.6, 0.9]$ toward its context.</p>
<p><b>Full weight matrix</b> (each row sums to 1, up to rounding):</p>
<table class="t tight center heat">
<tr><th>Q \ K</th><th>the</th><th>drone</th><th>lost</th><th>signal</th></tr>
<tr><th>the</th><td style="--h:.226">.226</td><td style="--h:.259">.259</td><td style="--h:.253">.253</td><td style="--h:.262">.262</td></tr>
<tr><th>drone</th><td style="--h:.151">.151</td><td style="--h:.29">.290</td><td style="--h:.252">.252</td><td style="--h:.307">.307</td></tr>
<tr><th>lost</th><td style="--h:.151">.151</td><td style="--h:.257">.257</td><td style="--h:.299">.299</td><td style="--h:.292">.292</td></tr>
<tr><th>signal</th><td style="--h:.142">.142</td><td style="--h:.284">.284</td><td style="--h:.265">.265</td><td style="--h:.309">.309</td></tr>
</table>
<p>Every query gives <span class="m">the</span> a low weight as a key because its vector is short. In a trained model, $Q$ and $K$ projections reshape these scores.</p>
<h3>Step-by-Step Trace, Part 2: Decoding</h3>
<p>Next-token logits: <span class="m">again 2.0, near 1.5, today 1.0, banana -1.0</span>.</p>
<table class="t tight center">
<tr><th>$T$</th><th>again</th><th>near</th><th>today</th><th>banana</th><th>Entropy</th></tr>
<tr><td>0.5</td><td>.664</td><td>.244</td><td>.090</td><td>.002</td><td>1.22 bits</td></tr>
<tr><td>1.0</td><td>.494</td><td>.300</td><td>.182</td><td>.025</td><td>1.60 bits</td></tr>
<tr><td>2.0</td><td>.383</td><td>.299</td><td>.233</td><td>.086</td><td>1.84 bits</td></tr>
</table>
<p><b>Greedy</b> takes $\arg\max$ and always returns <span class="m">again</span>, at any $T$. It is reproducible and tends to repeat itself. <b>Sampling</b> at $T = 2$ picks <span class="m">banana</span> 8.6% of the time. At $T = 0.5$, only 0.2%.</p>
<div class="take"><b>Key Takeaway</b>Attention decides what context each token reads, and temperature decides how much risk the decoder takes.</div>`
    }
  ];

  const insideFront = R`
<div class="eyebrow"><span>Front Matter</span><span>How to Read</span></div>
<h2 class="ptitle">How This Book Works</h2>
<p>Each of the ten spreads covers one week of the course. The left page holds the theory, the right page holds a problem solved by hand. Open any week and you can follow the full argument without turning a page.</p>
<h3>Left Page: Lecture &amp; Theory</h3>
<ul>
<li><b>Core Definitions &amp; Math.</b> Exact statements and formulas.</li>
<li><b>In My Own Words.</b> Why the idea works, in engineering terms.</li>
</ul>
<h3>Right Page: Practice &amp; Tasks</h3>
<ul>
<li><b>Weekly Practical Task.</b> The problem being solved.</li>
<li><b>Step-by-Step Trace.</b> Every intermediate value, shown so you can check it.</li>
<li><b>Key Takeaway.</b> One line to remember.</li>
</ul>
<h3>Controls</h3>
<table class="t">
<tr><td class="k">→ / ←</td><td>Next or previous page turn</td></tr>
<tr><td class="k">Corner</td><td>Click the bottom corner of a page to turn it</td></tr>
<tr><td class="k">Toolbar</td><td>Jump to the Cover, any week, or the Back Cover</td></tr>
<tr><td class="k">Double-click</td><td>Open a page in the large-print reader</td></tr>
<tr><td class="k">Home / End</td><td>Close the book at the front or the back</td></tr>
</table>
<h3>The Course as One Idea</h3>
<p>An agent has to decide what to do. Every week gives it a stronger way to decide.</p>
<table class="t">
<tr><th>Weeks</th><th>The agent decides by</th></tr>
<tr><td>1 to 4</td><td><b>Searching</b> through states, against opponents, under constraints</td></tr>
<tr><td>5 to 6</td><td><b>Reasoning</b> from facts with logic, and from evidence with probability</td></tr>
<tr><td>7 to 10</td><td><b>Learning</b> its decision function from data</td></tr>
</table>
<p class="tiny">Every numeric trace in this book was verified by script.</p>`;

  window.BOOK = { weeks, insideFront };
})();
