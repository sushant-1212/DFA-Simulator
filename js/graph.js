/**
 * SVG Graph Renderer & Visual Editor
 * Draws states, directed edges, self-loops, and highlights simulation states in real-time.
 */
class DFAGraph {
    constructor(svgElement, dfa, onStateClick = null) {
        this.svg = svgElement;
        this.dfa = dfa;
        this.onStateClick = onStateClick;
        this.nodeRadius = 26;
        this.activeState = null;
        this.activeEdge = null;
        this.isAccepted = null;

        // Dragging state
        this.draggedState = null;
        this.dragOffset = { x: 0, y: 0 };

        this.initSVG();
    }

    initSVG() {
        this.svg.innerHTML = `
            <defs>
                <!-- Default transition arrowhead -->
                <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5"
                        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#64748b" />
                </marker>
                <!-- Active transition arrowhead -->
                <marker id="arrow-active" viewBox="0 0 10 10" refX="9" refY="5"
                        markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#2563eb" />
                </marker>
                <!-- Initial start arrow -->
                <marker id="start-arrow" viewBox="0 0 10 10" refX="9" refY="5"
                        markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                    <path d="M 0 1.5 L 10 5 L 0 8.5 z" fill="#475569" />
                </marker>
            </defs>
            <g id="edges-layer"></g>
            <g id="nodes-layer"></g>
        `;

        // SVG mouse events for dragging states
        this.svg.addEventListener("mousemove", (e) => this.handleMouseMove(e));
        this.svg.addEventListener("mouseup", () => this.handleMouseUp());
        this.svg.addEventListener("mouseleave", () => this.handleMouseUp());
    }

    /**
     * Re-renders the entire DFA graph
     */
    render(activeState = null, activeEdge = null, isAccepted = null) {
        this.activeState = activeState;
        this.activeEdge = activeEdge;
        this.isAccepted = isAccepted;

        const edgesLayer = this.svg.getElementById("edges-layer");
        const nodesLayer = this.svg.getElementById("nodes-layer");
        if (!edgesLayer || !nodesLayer) return;

        edgesLayer.innerHTML = "";
        nodesLayer.innerHTML = "";

        // 1. Draw Edges
        this.renderEdges(edgesLayer);

        // 2. Draw Nodes
        this.renderNodes(nodesLayer);
    }

    /**
     * Groups transitions between pairs of states to combine symbols (e.g. "0, 1")
     */
    getGroupedEdges() {
        // Map key: "fromState->toState" -> array of symbols
        const edgeMap = new Map();

        for (const from of this.dfa.states) {
            for (const sym of this.dfa.alphabet) {
                const to = this.dfa.getTransition(from, sym);
                if (to && this.dfa.states.includes(to)) {
                    const key = `${from}->${to}`;
                    if (!edgeMap.has(key)) {
                        edgeMap.set(key, { from, to, symbols: [] });
                    }
                    edgeMap.get(key).symbols.push(sym);
                }
            }
        }
        return Array.from(edgeMap.values());
    }

    renderEdges(layer) {
        const groupedEdges = this.getGroupedEdges();

        groupedEdges.forEach(edge => {
            const { from, to, symbols } = edge;
            const fromPos = this.dfa.positions[from];
            const toPos = this.dfa.positions[to];

            if (!fromPos || !toPos) return;

            const isEdgeActive = this.activeEdge && 
                                 this.activeEdge.from === from && 
                                 this.activeEdge.to === to && 
                                 symbols.includes(this.activeEdge.symbol);

            const labelText = symbols.join(", ");

            if (from === to) {
                // Self-loop on top of node
                this.renderSelfLoop(layer, fromPos, labelText, isEdgeActive);
            } else {
                // Check if reverse edge exists for curvature
                const reverseKey = `${to}->${from}`;
                const hasReverse = groupedEdges.some(e => e.from === to && e.to === from);
                this.renderDirectedEdge(layer, fromPos, toPos, labelText, isEdgeActive, hasReverse);
            }
        });
    }

    renderSelfLoop(layer, pos, text, isActive) {
        const r = this.nodeRadius;
        const x = pos.x;
        const y = pos.y - r;

        // Cubic bezier loop above state
        const pathData = `M ${x - 12} ${y} C ${x - 32} ${y - 48}, ${x + 32} ${y - 48}, ${x + 12} ${y}`;
        
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("class", `graph-edge ${isActive ? "active-edge" : ""}`);
        path.setAttribute("marker-end", isActive ? "url(#arrow-active)" : "url(#arrow)");
        layer.appendChild(path);

        // Label above loop
        const textElem = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textElem.setAttribute("x", x);
        textElem.setAttribute("y", y - 40);
        textElem.setAttribute("class", `edge-label ${isActive ? "active-edge-label" : ""}`);
        textElem.textContent = text;
        layer.appendChild(textElem);
    }

    renderDirectedEdge(layer, p1, p2, text, isActive, isCurved) {
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;
        const dist = Math.hypot(dx, dy);
        if (dist === 0) return;

        const ux = dx / dist;
        const uy = dy / dist;

        // Normal perpendicular vector for curving
        const nx = -uy;
        const ny = ux;

        let pathData = "";
        let textX = 0;
        let textY = 0;

        if (isCurved) {
            // Quadratic curve with control point
            const curveOffset = 28;
            const midX = (p1.x + p2.x) / 2 + nx * curveOffset;
            const midY = (p1.y + p2.y) / 2 + ny * curveOffset;

            // Trim start and end by radius
            const startX = p1.x + ux * this.nodeRadius;
            const startY = p1.y + uy * this.nodeRadius;
            const endX = p2.x - ux * (this.nodeRadius + 4);
            const endY = p2.y - uy * (this.nodeRadius + 4);

            pathData = `M ${startX} ${startY} Q ${midX} ${midY} ${endX} ${endY}`;
            textX = midX + nx * 8;
            textY = midY + ny * 8;
        } else {
            // Straight line trimmed to node borders
            const startX = p1.x + ux * this.nodeRadius;
            const startY = p1.y + uy * this.nodeRadius;
            const endX = p2.x - ux * (this.nodeRadius + 4);
            const endY = p2.y - uy * (this.nodeRadius + 4);

            pathData = `M ${startX} ${startY} L ${endX} ${endY}`;
            textX = (startX + endX) / 2 + nx * 14;
            textY = (startY + endY) / 2 + ny * 14;
        }

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", pathData);
        path.setAttribute("class", `graph-edge ${isActive ? "active-edge" : ""}`);
        path.setAttribute("marker-end", isActive ? "url(#arrow-active)" : "url(#arrow)");
        layer.appendChild(path);

        // Edge symbol label
        const textElem = document.createElementNS("http://www.w3.org/2000/svg", "text");
        textElem.setAttribute("x", textX);
        textElem.setAttribute("y", textY);
        textElem.setAttribute("class", `edge-label ${isActive ? "active-edge-label" : ""}`);
        textElem.textContent = text;
        layer.appendChild(textElem);
    }

    renderNodes(layer) {
        this.dfa.states.forEach(stateId => {
            const pos = this.dfa.positions[stateId] || { x: 100, y: 100 };
            const isInitial = (this.dfa.initialState === stateId);
            const isFinal = this.dfa.finalStates.has(stateId);
            const isCurrent = (this.activeState === stateId);

            const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
            group.setAttribute("class", "node-group");
            group.setAttribute("data-state", stateId);

            // Drag handler
            group.addEventListener("mousedown", (e) => this.handleMouseDown(e, stateId));
            group.addEventListener("click", (e) => {
                if (this.onStateClick) this.onStateClick(stateId);
            });

            // Initial start arrow pointing into node
            if (isInitial) {
                const arrowLine = document.createElementNS("http://www.w3.org/2000/svg", "line");
                arrowLine.setAttribute("x1", pos.x - this.nodeRadius - 32);
                arrowLine.setAttribute("y1", pos.y);
                arrowLine.setAttribute("x2", pos.x - this.nodeRadius - 4);
                arrowLine.setAttribute("y2", pos.y);
                arrowLine.setAttribute("stroke", "#475569");
                arrowLine.setAttribute("stroke-width", "2");
                arrowLine.setAttribute("marker-end", "url(#start-arrow)");
                group.appendChild(arrowLine);

                const startLabel = document.createElementNS("http://www.w3.org/2000/svg", "text");
                startLabel.setAttribute("x", pos.x - this.nodeRadius - 20);
                startLabel.setAttribute("y", pos.y - 8);
                startLabel.setAttribute("class", "start-label");
                startLabel.textContent = "Start";
                group.appendChild(startLabel);
            }

            // Determine status style
            let statusClass = "";
            if (isCurrent) {
                if (this.isAccepted === true) {
                    statusClass = "node-accepted";
                } else if (this.isAccepted === false) {
                    statusClass = "node-rejected";
                } else {
                    statusClass = "node-current";
                }
            }

            // Outer circle
            const outerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            outerCircle.setAttribute("cx", pos.x);
            outerCircle.setAttribute("cy", pos.y);
            outerCircle.setAttribute("r", this.nodeRadius);
            outerCircle.setAttribute("class", `node-circle ${statusClass}`);
            group.appendChild(outerCircle);

            // Inner circle for Final (Accepting) states
            if (isFinal) {
                const innerCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                innerCircle.setAttribute("cx", pos.x);
                innerCircle.setAttribute("cy", pos.y);
                innerCircle.setAttribute("r", this.nodeRadius - 5);
                innerCircle.setAttribute("class", `node-inner-circle ${statusClass}`);
                group.appendChild(innerCircle);
            }

            // State label text
            const textElem = document.createElementNS("http://www.w3.org/2000/svg", "text");
            textElem.setAttribute("x", pos.x);
            textElem.setAttribute("y", pos.y + 5);
            textElem.setAttribute("class", `node-label ${isCurrent ? "node-label-current" : ""}`);
            textElem.textContent = stateId;
            group.appendChild(textElem);

            layer.appendChild(group);
        });
    }

    handleMouseDown(e, stateId) {
        e.stopPropagation();
        this.draggedState = stateId;
        const pos = this.dfa.positions[stateId];
        const svgRect = this.svg.getBoundingClientRect();
        this.dragOffset = {
            x: (e.clientX - svgRect.left) - pos.x,
            y: (e.clientY - svgRect.top) - pos.y
        };
    }

    handleMouseMove(e) {
        if (!this.draggedState) return;
        const svgRect = this.svg.getBoundingClientRect();
        let newX = (e.clientX - svgRect.left) - this.dragOffset.x;
        let newY = (e.clientY - svgRect.top) - this.dragOffset.y;

        // Keep inside bounds
        const pad = this.nodeRadius + 10;
        newX = Math.max(pad, Math.min(svgRect.width - pad, newX));
        newY = Math.max(pad, Math.min(svgRect.height - pad, newY));

        this.dfa.positions[this.draggedState] = { x: newX, y: newY };
        this.render(this.activeState, this.activeEdge, this.isAccepted);
    }

    handleMouseUp() {
        this.draggedState = null;
    }
}

// Export for browser
window.DFAGraph = DFAGraph;
