var storedPlayerScripts = {
    random1: {
        displayName: "Random1",
        playerClass: function () {
            this.init = function (c, playerdata, selfindex) {
                console.log('hello, world');
                // here an initialization might take place;
            }

            this.moveFunction = function (c, playerdata, selfindex) {
                var self = playerdata[selfindex]; // read the info for the actual player
                var newcenter = { // thats how the center of the next movement can be computed
                    x: self.pos.x + (self.pos.x - self.oldpos.x),
                    y: self.pos.y + (self.pos.y - self.oldpos.y)
                };
                var nextmove = newcenter;
                // the variable nextmove is initialized as the center point
                // if it is valid, we stay there with a high probability
                if (!lc.equalPoints(newcenter, self.pos) && lc.validLine(self.pos, newcenter) && lc.playerAt(newcenter) < 0 && Math.random() > 0.1)
                    return { x: 0, y: 0 }; // with returning 0,0, the next movement will be the center
                else { // the center point is not valid or we want to change with a small probability
                    var validmoves = [];
                    var validstay = null;
                    // we try the possible movements
                    for (var i = -1; i <= 1; i++)
                        for (var j = -1; j <= 1; j++) {
                            nextmove = { x: newcenter.x + i, y: newcenter.y + j };
                            // if the movement is valid (the whole line has to be valid)
                            if (lc.validLine(self.pos, nextmove) && (lc.playerAt(nextmove) < 0 || lc.playerAt(nextmove) == selfindex))
                                if (!lc.equalPoints(nextmove, self.pos)) // if there is no one else
                                    validmoves.push({ x: i, y: j }); // we store the movement as a valid movement
                                else
                                    validstay = { x: i, y: j }; // the next movement is me
                        }
                    if (validmoves.length) {
                        // if there is a valid movement, try to step there, if it not equal with my actual position
                        return validmoves[Math.floor(Math.random() * validmoves.length)];
                    }
                    else {
                        // if the only one movement is equal to my actual position, we rather stay there
                        if (validstay) {
                            return validstay;
                        }
                    }
                    return { x: 0, y: 0 }; // if there is no valid movement, then close our eyes....
                }
            }
        }
    },
    astar: {
        displayName: "G08FJ6",
        playerClass: function () {
            // Minimum binary heap implementation for A* since it is O(log(n))
            class MinHeap {
                constructor() {
                    this.values = new Map();
                }
                add(element) {
                    this.values.push(element);
                    let index = this.values.length - 1;
                    const current = this.values[index];

                    while (index >= 0) {
                        let parentIndex = Math.floor((index - 1) / 2);
                        let parent = this.values[parentIndex];

                        if (parent >= current) {
                            this.values[parentIndex] = current;
                            this.values[index] = parent;
                            index = parentIndex;
                        } else break;
                    }
                }

                extractMin() {
                    const min = this.values[0];
                    const end = this.values.pop();
                    this.values[0] = end;

                    let index = 0;
                    const length = this.values.length;
                    const current = this.values[0];
                    while (true) {
                        let leftChildIndex = 2 * index + 1;
                        let rightChildIndex = 2 * index + 2;
                        let leftChild, rightChild;
                        let swap = null;

                        if (leftChildIndex < length) {
                            leftChild = this.values[leftChildIndex];
                            if (leftChild > current) swap = leftChildIndex;
                        }
                        if (rightChildIndex < length) {
                            rightChild = this.values[rightChildIndex];
                            if (
                                (swap === null && rightChild < current) ||
                                (swap !== null && rightChild < leftChild)
                            )
                                swap = rightChildIndex;
                        }

                        if (swap === null) break;
                        this.values[index] = this.values[swap];
                        this.values[swap] = current;
                        index = swap;
                    }

                    return min;
                }
            }

            var openList = [];
            var closedList = [];
            var endPositions = [];
            this.init = function (c, playerdata, selfindex) {
                var start = playerdata[selfindex];
                openList.push({ x: start.pos.x, y: start.pos.y });
                // We will store the total cost of the position: f(x) = g(x) + h(x)
                // The initial position will have a total cost of "infinity"
                for (var i = 0; i < c.length; i++) {
                    for (var j = 0; j < c[i].length; j++) {
                        if (c[i][j] == 100) {
                            endPositions.push({ x: i, y: j });
                        }
                        c[i][j].f = 0;
                        c[i][j].g = 0;
                        c[i][j].h = 0;
                        c[i][j].parent = null;
                    }
                }
            }

            this.moveFunction = function (c, playerdata, selfindex) {
                var self = playerdata[selfindex];
                var newcenter = { // thats how the center of the next movement can be computed
                    x: self.pos.x + (self.pos.x - self.oldpos.x),
                    y: self.pos.y + (self.pos.y - self.oldpos.y)
                };
                var nextmove = newcenter;
                // the variable nextmove is initialized as the center point
                // if it is valid, we stay there with a high probability
                if (!lc.equalPoints(newcenter, self.pos) && lc.validLine(self.pos, newcenter) && lc.playerAt(newcenter) < 0)
                    return { x: 0, y: 0 }; // with returning 0,0, the next movement will be the center
                else { // the center point is not valid or we want to change with a small probability
                    var validmoves = [];
                    var validstay = null;

                    for (var i = -1; i <= 1; i++)
                        for (var j = -1; j <= 1; j++) {
                            nextmove = { x: newcenter.x + i, y: newcenter.y + j };
                            // if the movement is valid (the whole line has to be valid)
                            if (lc.validLine(self.pos, nextmove) && (lc.playerAt(nextmove) < 0 || lc.playerAt(nextmove) == selfindex))
                                if (!lc.equalPoints(nextmove, self.pos)) // if there is no one else
                                    validmoves.push({ x: i, y: j }); // we store the movement as a valid movement
                                else
                                    validstay = { x: i, y: j }; // the next movement is me
                        }
                    if (validmoves.length) {
                        while (openList.length > 0) {
                            // Extract minimal cost element
                            var lowInd = 0;
                            for (var i = 0; i < openList.length; i++) {
                                if (openList[i].f < openList[lowInd].f) { lowInd = i; }
                            }
                            var currentNode = openList[lowInd];
                            if (!validmoves.includes(currentNode)) {
                                validmoves.push(currentNode);
                            }
                            // Check if current element is in the open list
                            for (var i = 0; i < validmoves.length; i++){
                                var gScore = validmoves[i].g + 1;
                                var isBestGScore = false;
                                if (!openList.includes(validmoves[i])) {
                                    isBestGScore = true;
                                    validmoves[i].h = this.manhattanDistance(validmoves[i], endPositions[0]);
                                    openList.push(validmoves[i]);
                                } else if (gScore < validmoves[i].g)
                                    isBestGScore = true;
                                if (isBestGScore){
                                    validmoves[i].parent = currentNode;
                                    validmoves[i].g = gScore;
                                    validmoves[i].f = validmoves[i].h + validmoves[i].g;
                                }
                                return validmoves[i];
                            }
                        }
                    }
                    else {
                        // if the only one movement is equal to my actual position, we rather stay there
                        if (validstay) {
                            return validstay;
                        }
                    }
                    return { x: 0, y: 0 }; // if there is no valid movement, then close our eyes....

                }
            }

            // I use the Manhattan distance as a heuristic for A*
            this.manhattanDistance = function (p1, p2) {
                return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
            }
        }
    }
}; 