(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/lib/chess-engine.ts [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "INITIAL_BOARD",
    ()=>INITIAL_BOARD,
    "getInitialState",
    ()=>getInitialState,
    "isValidMove",
    ()=>isValidMove,
    "makeMove",
    ()=>makeMove
]);
const INITIAL_BOARD = [
    // Black pieces (top)
    [
        {
            type: 'R',
            player: 'black'
        },
        {
            type: 'H',
            player: 'black'
        },
        {
            type: 'E',
            player: 'black'
        },
        {
            type: 'A',
            player: 'black'
        },
        {
            type: 'K',
            player: 'black'
        },
        {
            type: 'A',
            player: 'black'
        },
        {
            type: 'E',
            player: 'black'
        },
        {
            type: 'H',
            player: 'black'
        },
        {
            type: 'R',
            player: 'black'
        }
    ],
    [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
    ],
    [
        null,
        {
            type: 'C',
            player: 'black'
        },
        null,
        null,
        null,
        null,
        null,
        {
            type: 'C',
            player: 'black'
        },
        null
    ],
    [
        {
            type: 'P',
            player: 'black'
        },
        null,
        {
            type: 'P',
            player: 'black'
        },
        null,
        {
            type: 'P',
            player: 'black'
        },
        null,
        {
            type: 'P',
            player: 'black'
        },
        null,
        {
            type: 'P',
            player: 'black'
        }
    ],
    [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
    ],
    // River
    [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
    ],
    [
        {
            type: 'P',
            player: 'red'
        },
        null,
        {
            type: 'P',
            player: 'red'
        },
        null,
        {
            type: 'P',
            player: 'red'
        },
        null,
        {
            type: 'P',
            player: 'red'
        },
        null,
        {
            type: 'P',
            player: 'red'
        }
    ],
    [
        null,
        {
            type: 'C',
            player: 'red'
        },
        null,
        null,
        null,
        null,
        null,
        {
            type: 'C',
            player: 'red'
        },
        null
    ],
    [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null
    ],
    [
        {
            type: 'R',
            player: 'red'
        },
        {
            type: 'H',
            player: 'red'
        },
        {
            type: 'E',
            player: 'red'
        },
        {
            type: 'A',
            player: 'red'
        },
        {
            type: 'K',
            player: 'red'
        },
        {
            type: 'A',
            player: 'red'
        },
        {
            type: 'E',
            player: 'red'
        },
        {
            type: 'H',
            player: 'red'
        },
        {
            type: 'R',
            player: 'red'
        }
    ]
];
const getInitialState = ()=>({
        board: JSON.parse(JSON.stringify(INITIAL_BOARD)),
        turn: 'red',
        lastMove: null,
        winner: null,
        isCheck: false
    });
const isValidMove = (state, move)=>{
    const { from, to } = move;
    const board = state.board;
    const piece = board[from.r][from.c];
    if (!piece || piece.player !== state.turn) return false;
    const target = board[to.r][to.c];
    if (target && target.player === state.turn) return false;
    const dr = to.r - from.r;
    const dc = to.c - from.c;
    const absDr = Math.abs(dr);
    const absDc = Math.abs(dc);
    switch(piece.type){
        case 'K':
            if (absDr + absDc !== 1) return false;
            // Must stay in palace
            if (to.c < 3 || to.c > 5) return false;
            if (piece.player === 'red' && to.r < 7) return false;
            if (piece.player === 'black' && to.r > 2) return false;
            break;
        case 'A':
            if (absDr !== 1 || absDc !== 1) return false;
            // Must stay in palace
            if (to.c < 3 || to.c > 5) return false;
            if (piece.player === 'red' && to.r < 7) return false;
            if (piece.player === 'black' && to.r > 2) return false;
            break;
        case 'E':
            if (absDr !== 2 || absDc !== 2) return false;
            // Cannot cross river
            if (piece.player === 'red' && to.r < 5) return false;
            if (piece.player === 'black' && to.r > 4) return false;
            // Cannot be blocked (Eye of the Elephant)
            if (board[from.r + dr / 2][from.c + dc / 2]) return false;
            break;
        case 'H':
            if (!(absDr === 2 && absDc === 1 || absDr === 1 && absDc === 2)) return false;
            // Cannot be blocked (Horse leg)
            if (absDr === 2) {
                if (board[from.r + dr / 2][from.c]) return false;
            } else {
                if (board[from.r][from.c + dc / 2]) return false;
            }
            break;
        case 'R':
            if (dr !== 0 && dc !== 0) return false;
            if (countPiecesBetween(board, from, to) !== 0) return false;
            break;
        case 'C':
            if (dr !== 0 && dc !== 0) return false;
            const count = countPiecesBetween(board, from, to);
            if (target) {
                if (count !== 1) return false; // Must jump over exactly one piece to capture
            } else {
                if (count !== 0) return false; // Must have no pieces between to move
            }
            break;
        case 'P':
            if (piece.player === 'red') {
                if (dr > 0) return false; // Cannot move backward
                if (from.r >= 5) {
                    // Before crossing river
                    if (dr !== -1 || dc !== 0) return false;
                } else {
                    // After crossing river
                    if (absDr + absDc !== 1 || dr > 0) return false;
                }
            } else {
                if (dr < 0) return false; // Cannot move backward
                if (from.r <= 4) {
                    // Before crossing river
                    if (dr !== 1 || dc !== 0) return false;
                } else {
                    // After crossing river
                    if (absDr + absDc !== 1 || dr < 0) return false;
                }
            }
            break;
    }
    // Check for "Flying General" (King facing King)
    // This is usually checked AFTER the move or as part of move validation
    // But for simple move validation, we mainly care about piece movement rules.
    return true;
};
const countPiecesBetween = (board, from, to)=>{
    let count = 0;
    if (from.r === to.r) {
        const start = Math.min(from.c, to.c);
        const end = Math.max(from.c, to.c);
        for(let c = start + 1; c < end; c++){
            if (board[from.r][c]) count++;
        }
    } else {
        const start = Math.min(from.r, to.r);
        const end = Math.max(from.r, to.r);
        for(let r = start + 1; r < end; r++){
            if (board[r][from.c]) count++;
        }
    }
    return count;
};
const makeMove = (state, move)=>{
    if (!isValidMove(state, move)) return null;
    const newBoard = JSON.parse(JSON.stringify(state.board));
    const piece = newBoard[move.from.r][move.from.c];
    // Handle Fly General rule check (optional but good)
    // ...
    newBoard[move.to.r][move.to.c] = piece;
    newBoard[move.from.r][move.from.c] = null;
    const nextTurn = state.turn === 'red' ? 'black' : 'red';
    // Check win condition (if King is captured)
    const target = state.board[move.to.r][move.to.c];
    let winner = null;
    if (target && target.type === 'K') {
        winner = state.turn;
    }
    return {
        ...state,
        board: newBoard,
        turn: nextTurn,
        lastMove: move,
        winner
    };
};
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/src/components/Board.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>Board
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/chess-engine.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/clsx/dist/clsx.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/tailwind-merge/dist/bundle-mjs.mjs [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
'use client';
;
;
;
;
function cn(...inputs) {
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$tailwind$2d$merge$2f$dist$2f$bundle$2d$mjs$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["twMerge"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$clsx$2f$dist$2f$clsx$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["clsx"])(inputs));
}
const PIECE_NAMES = {
    'red-K': '帥',
    'black-K': '將',
    'red-A': '仕',
    'black-A': '士',
    'red-E': '相',
    'black-E': '象',
    'red-H': '傌',
    'black-H': '馬',
    'red-R': '俥',
    'black-R': '車',
    'red-C': '砲',
    'black-C': '炮',
    'red-P': '兵',
    'black-P': '卒'
};
function Board({ gameState, onMove, playerSide }) {
    _s();
    const [selected, setSelected] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const handleClick = (r, c)=>{
        if (gameState.winner) return;
        if (selected) {
            const move = {
                from: selected,
                to: {
                    r,
                    c
                }
            };
            if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidMove"])(gameState, move)) {
                onMove(move);
                setSelected(null);
            } else {
                // If clicking on another piece of the same player, select it instead
                const piece = gameState.board[r][c];
                if (piece && piece.player === gameState.turn) {
                    setSelected({
                        r,
                        c
                    });
                } else {
                    setSelected(null);
                }
            }
        } else {
            const piece = gameState.board[r][c];
            if (piece && piece.player === gameState.turn) {
                setSelected({
                    r,
                    c
                });
            }
        }
    };
    const renderBoard = ()=>{
        const cells = [];
        for(let r = 0; r < 10; r++){
            for(let c = 0; c < 9; c++){
                const piece = gameState.board[r][c];
                const isSelected = selected?.r === r && selected?.c === c;
                const isLastMove = gameState.lastMove?.from.r === r && gameState.lastMove?.from.c === c || gameState.lastMove?.to.r === r && gameState.lastMove?.to.c === c;
                cells.push(/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    onClick: ()=>handleClick(r, c),
                    className: cn("relative flex items-center justify-center cursor-pointer select-none", "w-full h-full border-[0.5px] border-black/20", isLastMove && "bg-yellow-500/20"),
                    children: [
                        piece && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: cn("w-10 h-10 rounded-full flex items-center justify-center font-bold text-2xl transition-all shadow-md border-2", piece.player === 'red' ? "bg-white text-red-600 border-red-600" : "bg-white text-black border-black", isSelected && "ring-4 ring-yellow-400 scale-110 z-10 shadow-xl"),
                            children: PIECE_NAMES[`${piece.player}-${piece.type}`]
                        }, void 0, false, {
                            fileName: "[project]/src/components/Board.tsx",
                            lineNumber: 80,
                            columnNumber: 29
                        }, this),
                        selected && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidMove"])(gameState, {
                            from: selected,
                            to: {
                                r,
                                c
                            }
                        }) && !piece && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "w-3 h-3 bg-black/10 rounded-full"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Board.tsx",
                            lineNumber: 93,
                            columnNumber: 29
                        }, this),
                        selected && (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$chess$2d$engine$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isValidMove"])(gameState, {
                            from: selected,
                            to: {
                                r,
                                c
                            }
                        }) && piece && piece.player !== gameState.turn && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "absolute inset-0 border-2 border-red-400/50 rounded-full m-1"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Board.tsx",
                            lineNumber: 96,
                            columnNumber: 29
                        }, this)
                    ]
                }, `${r}-${c}`, true, {
                    fileName: "[project]/src/components/Board.tsx",
                    lineNumber: 67,
                    columnNumber: 21
                }, this));
            }
        }
        return cells;
    };
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col items-center gap-4",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative bg-[#e6ceac] border-8 border-[#5d4037] p-2 shadow-2xl rounded-sm",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "absolute top-[40%] bottom-[40%] left-0 right-0 flex items-center justify-center font-serif text-3xl text-[#5d4037] font-bold opacity-40 pointer-events-none",
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            className: "flex justify-between w-full px-20",
                            children: [
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "楚 河"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Board.tsx",
                                    lineNumber: 111,
                                    columnNumber: 25
                                }, this),
                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                    children: "漢 界"
                                }, void 0, false, {
                                    fileName: "[project]/src/components/Board.tsx",
                                    lineNumber: 112,
                                    columnNumber: 25
                                }, this)
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Board.tsx",
                            lineNumber: 110,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/src/components/Board.tsx",
                        lineNumber: 109,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "grid grid-cols-9 grid-rows-10 w-[450px] h-[500px] border-collapse relative",
                        children: renderBoard()
                    }, void 0, false, {
                        fileName: "[project]/src/components/Board.tsx",
                        lineNumber: 116,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Board.tsx",
                lineNumber: 107,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-xl font-bold flex gap-8",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: cn("px-4 py-2 rounded", gameState.turn === 'red' ? "bg-red-600 text-white" : "bg-gray-200"),
                        children: [
                            "红方 ",
                            gameState.turn === 'red' && "对方落子中..."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Board.tsx",
                        lineNumber: 122,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: cn("px-4 py-2 rounded", gameState.turn === 'black' ? "bg-black text-white" : "bg-gray-200"),
                        children: [
                            "黑方 ",
                            gameState.turn === 'black' && "对方落子中..."
                        ]
                    }, void 0, true, {
                        fileName: "[project]/src/components/Board.tsx",
                        lineNumber: 125,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/src/components/Board.tsx",
                lineNumber: 121,
                columnNumber: 13
            }, this),
            gameState.winner && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "fixed inset-0 bg-black/60 flex items-center justify-center z-50",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "bg-white p-8 rounded-lg shadow-2xl text-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h2", {
                            className: "text-4xl font-bold mb-4",
                            children: [
                                gameState.winner === 'red' ? '红方' : '黑方',
                                " 胜利！"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/src/components/Board.tsx",
                            lineNumber: 133,
                            columnNumber: 25
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            className: "bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700",
                            onClick: ()=>window.location.reload(),
                            children: "再来一局"
                        }, void 0, false, {
                            fileName: "[project]/src/components/Board.tsx",
                            lineNumber: 134,
                            columnNumber: 25
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/src/components/Board.tsx",
                    lineNumber: 132,
                    columnNumber: 21
                }, this)
            }, void 0, false, {
                fileName: "[project]/src/components/Board.tsx",
                lineNumber: 131,
                columnNumber: 17
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/components/Board.tsx",
        lineNumber: 106,
        columnNumber: 9
    }, this);
}
_s(Board, "PVKrpNrydW4BpnDEq9OT3cVmCk4=");
_c = Board;
var _c;
__turbopack_context__.k.register(_c, "Board");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_9e308560._.js.map