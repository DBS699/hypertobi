import React from "react";
/* HYPERPIZZA game bundle — auto-generated from uploads/hyperpizza/src */
const { useState, useEffect, useRef } = React;
/* gemini stub: no API key in static site; components fall back gracefully */
const canUseGemini = () => false;
const generatePizzaReview = async () => null;
const generateAvatarEmotions = async () => { throw new Error('API Key Missing'); };
const generatePizzaRecipe = async () => { throw new Error('API Key Missing'); };
const generateCriticComment = async () => null;
const parseShoppingList = async () => { throw new Error('API Key Missing'); };

const { playClick, playPop, playPowerUp, playSuccess, playChaos } = (() => {
// Simple 8-bit sound synthesizer using Web Audio API

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

const playTone = (freq, type, duration) => {
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = type; // 'square', 'sawtooth', 'triangle', 'sine'
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);

    gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
};

const playClick = () => {
    playTone(400, 'square', 0.1);
};

const playPop = () => {
    playTone(600, 'sine', 0.1);
};

const playPowerUp = () => {
    playTone(300, 'square', 0.1);
    setTimeout(() => playTone(450, 'square', 0.1), 100);
    setTimeout(() => playTone(600, 'square', 0.2), 200);
};

const playSuccess = () => {
    playTone(523.25, 'triangle', 0.1); // C5
    setTimeout(() => playTone(659.25, 'triangle', 0.1), 100); // E5
    setTimeout(() => playTone(783.99, 'triangle', 0.1), 200); // G5
    setTimeout(() => playTone(1046.50, 'triangle', 0.4), 300); // C6
};

const playChaos = () => {
    // Random noise-like effect
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            playTone(200 + Math.random() * 800, 'sawtooth', 0.1);
        }, i * 50);
    }
}

return { playClick, playPop, playPowerUp, playSuccess, playChaos };
})();

const useGameLoop = (() => {

const useGameLoop = (callback) => {
    const requestRef = useRef();
    const previousTimeRef = useRef();
    const callbackRef = useRef(callback);

    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        const animate = (time) => {
            if (previousTimeRef.current !== undefined) {
                const deltaTime = time - previousTimeRef.current;
                callbackRef.current(deltaTime);
            }
            previousTimeRef.current = time;
            requestRef.current = requestAnimationFrame(animate);
        };

        requestRef.current = requestAnimationFrame(animate);

        return () => cancelAnimationFrame(requestRef.current);
    }, []);
};



return useGameLoop;
})();

const usePlayerControls = (() => {

const usePlayerControls = () => {
    const [keys, setKeys] = useState({
        up: false,
        down: false,
        left: false,
        right: false,
        action: false
    });

    useEffect(() => {
        const handleKeyDown = (e) => {
            switch (e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    e.preventDefault();
                    setKeys(k => ({ ...k, up: true }));
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    e.preventDefault();
                    setKeys(k => ({ ...k, down: true }));
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    e.preventDefault();
                    setKeys(k => ({ ...k, left: true }));
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    e.preventDefault();
                    setKeys(k => ({ ...k, right: true }));
                    break;
                case 'Space':
                case 'Enter':
                    e.preventDefault();
                    setKeys(k => ({ ...k, action: true }));
                    break;
                default:
                    break;
            }
        };

        const handleKeyUp = (e) => {
            switch (e.code) {
                case 'ArrowUp':
                case 'KeyW':
                    setKeys(k => ({ ...k, up: false }));
                    break;
                case 'ArrowDown':
                case 'KeyS':
                    setKeys(k => ({ ...k, down: false }));
                    break;
                case 'ArrowLeft':
                case 'KeyA':
                    setKeys(k => ({ ...k, left: false }));
                    break;
                case 'ArrowRight':
                case 'KeyD':
                    setKeys(k => ({ ...k, right: false }));
                    break;
                case 'Space':
                case 'Enter':
                    setKeys(k => ({ ...k, action: false }));
                    break;
                default:
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    return keys;
};



return usePlayerControls;
})();

const ChefSprite = (() => {

const ChefSprite = ({ x, y, direction, holding, avatarConfig, isWalking }) => {
    // avatarConfig includes: { color (shirt), skin, hat, pants, hair ('short'|'long'), outfit ('pants'|'dress') }
    const pantsColor = avatarConfig.pants || '#224488';
    const shirtColor = avatarConfig.color;
    const skinColor = avatarConfig.skin;
    const isLongHair = avatarConfig.hair === 'long';
    const isDress = avatarConfig.outfit === 'dress';

    const transform = direction === 'left' ? 'scaleX(-1)' : 'scaleX(1)';
    const bounce = isWalking ? 'translateY(-2px)' : 'translateY(0)';

    return (
        <div style={{
            position: 'absolute',
            left: x,
            top: y,
            width: 40,
            height: 60,
            zIndex: Math.floor(y),
            transition: 'none',
            pointerEvents: 'none'
        }}>
            <div style={{
                position: 'relative', width: '100%', height: '100%',
                transform: transform
            }}>

                {/* --- LEGS --- */}
                {/* If Dress, legs might be hidden or just peeking out at bottom? Let's keep them but maybe shorter/darker if under dress? 
                    Actually standard legs work fine under a dress if the dress is wide. */}
                <div style={{
                    position: 'absolute', bottom: 0, left: 8, width: 10, height: 20,
                    background: isDress ? skinColor : pantsColor, // If dress, maybe bare legs or stockings? Let's assume bare legs (skin) for now or keep pants as tights? User asked for dress, usually implies legs visible or tights. Let's use pantsColor as "Tights/Leggings" color if dress, or just skin. Let's stick to pantsColor as "Legwear" which is versatile.
                    transformOrigin: 'top center',
                    animation: isWalking ? 'walkLeft 0.4s infinite ease-in-out alternate' : 'none',
                    borderRadius: '0 0 4px 4px'
                }} />
                <div style={{
                    position: 'absolute', bottom: 0, right: 8, width: 10, height: 20,
                    background: isDress ? skinColor : pantsColor,
                    transformOrigin: 'top center',
                    animation: isWalking ? 'walkRight 0.4s infinite ease-in-out alternate' : 'none',
                    borderRadius: '0 0 4px 4px'
                }} />

                {/* --- LONG HAIR BACK --- */}
                {isLongHair && (
                    <div style={{
                        position: 'absolute', top: 5, left: -2, width: 34, height: 35,
                        background: '#333', // Default hair color (black/brown). Wait, we don't have hair color select. Assuming dark hair or matching something? Let's stick to dark brown/black generic hair for now or add Hair Color later.
                        // Actually, let's make it dark brown #4a3c31
                        borderRadius: '8px',
                        transform: bounce,
                        animation: isWalking ? 'bounce 0.2s infinite alternate' : 'none',
                        zIndex: 1 // Behind Body
                    }} />
                )}

                {/* --- BODY (Shirt / Dress) --- */}
                <div style={{
                    position: 'absolute', bottom: 15, left: isDress ? 0 : 2, width: isDress ? 40 : 36, height: isDress ? 30 : 25,
                    background: shirtColor,
                    borderRadius: isDress ? '4px 4px 10px 10px' : '4px', // Dress shape
                    transform: bounce,
                    animation: isWalking ? 'bounce 0.2s infinite alternate' : 'none',
                    zIndex: 2,
                    // Dress flare
                    clipPath: isDress ? 'polygon(10% 0, 90% 0, 100% 100%, 0% 100%)' : 'none'
                }}>
                    {/* Logo/Icon */}
                    <div style={{
                        position: 'absolute', top: 8, left: isDress ? 14 : 12, fontSize: '12px',
                        filter: 'grayscale(0.5)'
                    }}>🍕</div>
                </div>

                {/* --- HEAD --- */}
                <div style={{
                    position: 'absolute', top: 0, left: 5, width: 30, height: 30,
                    background: skinColor,
                    borderRadius: '4px',
                    transform: bounce,
                    animation: isWalking ? 'bounce 0.2s infinite alternate' : 'none',
                    zIndex: 3
                }}>
                    {/* Eyes (only if no sunglasses) */}
                    {!avatarConfig.sunglasses && (
                        <>
                            <div style={{ position: 'absolute', top: 10, left: 18, width: 4, height: 4, background: 'black' }}></div>
                            <div style={{ position: 'absolute', top: 10, left: 6, width: 4, height: 4, background: 'black', opacity: direction === 'up' ? 0 : 1 }}></div>
                        </>
                    )}

                    {/* Mustache */}
                    {avatarConfig.mustache && (
                        <div style={{
                            position: 'absolute', bottom: 8, left: 8, width: 14, height: 4,
                            background: '#420', borderRadius: '2px'
                        }} />
                    )}

                    {/* Sunglasses */}
                    {avatarConfig.sunglasses && (
                        <div style={{
                            position: 'absolute', top: 10, left: 4, width: 22, height: 6,
                            background: 'black', display: 'flex', gap: '2px'
                        }}>
                            <div style={{ position: 'absolute', top: 1, left: 2, width: 3, height: 2, background: '#555' }} />
                            <div style={{ position: 'absolute', top: 1, right: 2, width: 3, height: 2, background: '#555' }} />
                        </div>
                    )}
                </div>

                {/* --- HAT --- */}
                <div style={{
                    position: 'absolute', top: -10, left: 0, width: '100%', height: 40,
                    transform: bounce,
                    animation: isWalking ? 'bounce 0.2s infinite alternate' : 'none',
                    zIndex: 4,
                    display: 'flex', justifyContent: 'center'
                }}>
                    {avatarConfig.hat === 'chef' && (
                        <div style={{ width: 20, height: 25, background: 'white', borderRadius: '5px 5px 0 0', marginTop: -15, boxShadow: 'inset 0 -2px #eee' }} />
                    )}
                    {avatarConfig.hat === 'cap' && (
                        <div style={{ width: 34, height: 12, background: '#333', borderRadius: '4px 4px 0 0', marginTop: 10, position: 'relative' }}>
                            <div style={{ position: 'absolute', bottom: 0, right: -6, width: 10, height: 4, background: '#333' }} />
                        </div>
                    )}
                </div>

                {/* --- ARMS --- */}
                <div style={{
                    position: 'absolute', top: 22, left: -4, width: 8, height: 20,
                    background: shirtColor,
                    borderRadius: 4,
                    transformOrigin: 'top center',
                    animation: isWalking ? 'swingLeft 0.4s infinite ease-in-out alternate' : 'none',
                    zIndex: 1
                }}>
                    <div style={{ position: 'absolute', bottom: -4, left: 0, width: 8, height: 6, background: skinColor, borderRadius: '0 0 2px 2px' }} />
                </div>
                <div style={{
                    position: 'absolute', top: 22, right: -4, width: 8, height: 20,
                    background: shirtColor,
                    borderRadius: 4,
                    transformOrigin: 'top center',
                    transform: holding ? 'rotate(-45deg)' : 'none',
                    animation: (isWalking && !holding) ? 'swingRight 0.4s infinite ease-in-out alternate' : 'none',
                    zIndex: 5
                }}>
                    <div style={{ position: 'absolute', bottom: -4, left: 0, width: 8, height: 6, background: skinColor, borderRadius: '0 0 2px 2px' }} />
                    {holding && (
                        <div style={{
                            position: 'absolute',
                            bottom: -20, left: -10,
                            width: 30, height: 30,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '20px',
                            filter: 'drop-shadow(0 2px 2px rgba(0,0,0,0.5))',
                            transform: 'rotate(45deg)'
                        }}>
                            {holding.symbol}
                        </div>
                    )}
                </div>

            </div>

            <style>{`
                @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-2px); } }
                @keyframes walkLeft { from { transform: rotate(20deg); } to { transform: rotate(-20deg); } }
                @keyframes walkRight { from { transform: rotate(-20deg); } to { transform: rotate(20deg); } }
                @keyframes swingLeft { from { transform: rotate(-30deg); } to { transform: rotate(30deg); } }
                @keyframes swingRight { from { transform: rotate(30deg); } to { transform: rotate(-30deg); } }
            `}</style>
        </div>
    );
};



return ChefSprite;
})();

const Station = (() => {

const COLORS = {
    crate: '#8B4513',
    prep: '#C0C0C0',
    oven: '#A52A2A',
    trash: '#333333',
    serve: '#FFD700'
};

const Station = ({ x, y, width, height, type, data, highlight, content, inventory }) => {

    const getLabel = () => {
        if (type === 'crate') return data.symbol;
        if (type === 'prep') return 'PREP';
        if (type === 'oven') return 'OVEN';
        if (type === 'serve') return 'SERVE';
        return '';
    };

    return (
        <div style={{
            position: 'absolute',
            left: x,
            top: y,
            width: width,
            height: height,
            backgroundColor: COLORS[type] || '#555',
            border: highlight ? '4px solid white' : '4px solid rgba(0,0,0,0.3)',
            borderRadius: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            boxShadow: '0 5px 10px rgba(0,0,0,0.5)',
            transition: 'border 0.1s',
            fontFamily: '"Press Start 2P", cursive',
            textShadow: '1px 1px 0 black'
        }}>
            {/* Base Label */}
            <div style={{ fontSize: type === 'crate' ? '24px' : '14px' }}>
                {getLabel()}
            </div>

            {/* Content (e.g. Pizza on table) */}
            {content && (
                <div style={{
                    position: 'absolute',
                    top: -10,
                    width: 30,
                    height: 30,
                    background: '#f4e6c1',
                    borderRadius: '50%',
                    border: '2px solid #e0c090',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    color: 'black',
                    zIndex: 2
                }}>
                    {content.symbol}
                </div>
            )}

            {/* Inventory (Gathered Ingredients) */}
            {inventory && inventory.length > 0 && !content && (
                <div style={{ position: 'absolute', top: -15, width: '100%', display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
                    {inventory.map((item, i) => (
                        <div key={i} style={{
                            fontSize: '20px',
                            margin: '-5px',
                            filter: 'drop-shadow(0 2px 2px black)'
                        }}>
                            {item.symbol}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};



return Station;
})();

const { default: RecipeSelector, RECIPES } = (() => {

const RECIPES = [
    {
        id: 'margherita',
        name: 'Margherita',
        description: 'Classic Tomato & Cheese details.',
        ingredients: [
            { id: 'dough', symbol: '🍘', type: 'crate' },
            { id: 'sauce', symbol: '🍅', type: 'crate' },
            { id: 'cheese', symbol: '🧀', type: 'crate' }
        ],
        targetSymbol: '🍕+🧀'
    },
    {
        id: 'pepperoni',
        name: 'Pepperoni',
        description: 'Spicy slices on cheese.',
        ingredients: [
            { id: 'dough', symbol: '🍘', type: 'crate' },
            { id: 'sauce', symbol: '🍅', type: 'crate' },
            { id: 'cheese', symbol: '🧀', type: 'crate' },
            { id: 'pep', symbol: '🔴', type: 'crate' }
        ],
        targetSymbol: '🍕+🔴'
    },
    {
        id: 'veggie',
        name: 'Veggie Delight',
        description: 'Healthy greens.',
        ingredients: [
            { id: 'dough', symbol: '🍘', type: 'crate' },
            { id: 'sauce', symbol: '🍅', type: 'crate' },
            { id: 'mushroom', symbol: '🍄', type: 'crate' },
            { id: 'peppers', symbol: '🫑', type: 'crate' }
        ],
        targetSymbol: '🍕+🥗'
    }
];

const RecipeSelector = ({ onSelect }) => {
    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: 'rgba(20, 20, 30, 0.95)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            zIndex: 1000,
            color: 'white',
            fontFamily: '"Press Start 2P", cursive',
            letterSpacing: '-1px'
        }}>
            <h2 style={{
                color: 'var(--neon-yellow)',
                marginBottom: '40px',
                textShadow: '4px 4px var(--neon-purple)',
                fontSize: '24px',
                textAlign: 'center',
                lineHeight: '1.5'
            }}>
                SELECT RECIPE
            </h2>

            <div style={{ display: 'flex', gap: '20px', alignItems: 'stretch' }}>
                {RECIPES.map(recipe => (
                    <div
                        key={recipe.id}
                        onClick={() => onSelect(recipe)}
                        style={{
                            border: '4px solid var(--neon-blue)',
                            padding: '15px',
                            cursor: 'pointer',
                            background: '#000',
                            textAlign: 'center',
                            width: '160px',
                            transition: 'transform 0.1s',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            imageRendering: 'pixelated'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.05)';
                            e.currentTarget.style.borderColor = 'var(--neon-green)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.borderColor = 'var(--neon-blue)';
                        }}
                    >
                        <h3 style={{
                            color: 'var(--neon-pink)',
                            marginBottom: '15px',
                            fontSize: '12px',
                            lineHeight: '1.5',
                            textTransform: 'uppercase'
                        }}>
                            {recipe.name}
                        </h3>

                        <div style={{
                            fontSize: '10px',
                            color: '#ccc',
                            marginBottom: '20px',
                            lineHeight: '1.6',
                            minHeight: '50px' // consistent height
                        }}>
                            {recipe.description}
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', fontSize: '20px' }}>
                            {recipe.ingredients.map(ing => (
                                <span key={ing.id} title={ing.id}>{ing.symbol}</span>
                            ))}
                        </div>
                    </div>
                ))}
            </div>

            <p style={{ marginTop: '40px', color: '#666', fontSize: '10px' }}>
                CLICK TO START
            </p>
        </div>
    );
};



return { default: RecipeSelector, RECIPES };
})();

const PrepView = (() => {

const PrepView = ({ gatheredIngredients, recipe, onComplete }) => {
    // Check if we have dough
    const hasDough = gatheredIngredients.some(i => i.id === 'dough');

    // Filter out dough from toppings list
    const availableToppings = gatheredIngredients.filter(i => i.id !== 'dough');

    const [placedToppings, setPlacedToppings] = useState([]);
    const [selectedTopping, setSelectedTopping] = useState(null);

    const handlePizzaClick = (e) => {
        if (!selectedTopping) return;

        // Get click coordinates relative to pizza
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        setPlacedToppings([...placedToppings, {
            ...selectedTopping,
            x,
            y,
            rotation: Math.random() * 360
        }]);

        // Remove one instance of this topping from available (optional, but realistic?)
        // For now, let's assume "1 Sauce item" provides unlimited sauce splashes, 
        // OR strictly consume the generic gathered item. 
        // Let's keep it simple: You have the ingredients, you just place them. 
        // Validation happens on "Finish".
    };

    const handleFinish = () => {
        // Basic validation: Did we use the right stuff?
        // For now, allow creativity, just return the list.
        onComplete(placedToppings);
    };

    if (!hasDough) {
        return (
            <div style={{
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                background: '#222', color: 'white',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'
            }}>
                <h2>MISSING DOUGH!</h2>
                <p>You need to bring Dough to the table first.</p>
                <button onClick={() => onComplete(null)} style={{ marginTop: 20, padding: 10 }}>Back to Kitchen</button>
            </div>
        );
    }

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: '#333',
            display: 'flex',
            fontFamily: '"Press Start 2P", cursive',
            zIndex: 30
        }}>
            {/* Sidebar: Ingredients */}
            <div style={{
                width: '120px', background: '#444', borderRight: '4px solid #222',
                padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px',
                overflowY: 'auto'
            }}>
                <h3 style={{ color: 'var(--neon-yellow)', fontSize: '0.8em' }}>PANTRY</h3>

                {/* Visual confirmation that Dough is used */}
                <div style={{ padding: '10px', border: '2px dashed #666', opacity: 0.5, textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5em' }}>🍘</div>
                    <div style={{ fontSize: '0.6em', color: '#aaa' }}>BASE</div>
                </div>

                {availableToppings.map((ing, idx) => (
                    <div
                        key={idx}
                        onClick={() => setSelectedTopping(ing)}
                        style={{
                            padding: '10px',
                            background: selectedTopping === ing ? 'var(--neon-green)' : '#222',
                            color: selectedTopping === ing ? 'black' : 'white',
                            cursor: 'pointer',
                            border: '2px solid #000',
                            textAlign: 'center'
                        }}
                    >
                        <div style={{ fontSize: '2em' }}>{ing.symbol}</div>
                    </div>
                ))}
            </div>

            {/* Main Area: Assembly */}
            <div style={{ flex: 1, position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <h2 style={{ color: 'white', marginBottom: '20px' }}>ASSEMBLE: {recipe.name.toUpperCase()}</h2>

                {/* Pizza Stage */}
                <div
                    onClick={handlePizzaClick}
                    style={{
                        width: '300px', height: '300px',
                        background: '#eecfa1', // Dough color
                        borderRadius: '50%',
                        position: 'relative',
                        cursor: selectedTopping ? 'crosshair' : 'default',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.5)',
                        border: '4px solid #d4b58b'
                    }}
                >
                    {/* Visual hints for Sauce/Cheese layers could go here, but we'll do individual splats for now */}

                    {placedToppings.map((t, i) => (
                        <div key={i} style={{
                            position: 'absolute',
                            left: t.x - 15, top: t.y - 15,
                            fontSize: '2em',
                            transform: `rotate(${t.rotation}deg)`,
                            pointerEvents: 'none'
                        }}>
                            {t.symbol}
                        </div>
                    ))}
                </div>

                <div style={{ marginTop: '30px', display: 'flex', gap: '20px' }}>
                    <button
                        onClick={() => setPlacedToppings([])}
                        style={{ padding: '10px 20px', background: '#555', color: 'white', border: 'none', cursor: 'pointer' }}
                    >
                        CLEAR
                    </button>
                    <button
                        onClick={handleFinish}
                        style={{
                            padding: '10px 40px',
                            background: 'var(--neon-green)', color: 'black',
                            border: 'none', fontWeight: 'bold', fontSize: '1.2em', cursor: 'pointer'
                        }}
                    >
                        FINISH PIZZA
                    </button>
                </div>
            </div>
        </div>
    );
};



return PrepView;
})();

const OvenView = (() => {

// Game Constants
const MAX_TEMP = 600;
const COOLING_RATE = 1.0; // Very slow cooling
const HEATING_RATE = 3.0; // Very slow heating (requires holding/long presses, not tapping)
const TARGET_MIN = 350;
const TARGET_MAX = 450;
const BAKE_SPEED = 0.3;
const BURN_SPEED = 0.2;

const OvenView = ({ initialPizza, onComplete }) => {
    const [temp, setTemp] = useState(100);
    const [progress, setProgress] = useState(0);
    const [burnProgress, setBurnProgress] = useState(0);
    const [isHeating, setIsHeating] = useState(false);

    // Refs for loop state to avoid closure staleness
    const stateRef = useRef({ temp: 100, progress: 0, burnProgress: 0, isHeating: false });
    const reqRef = useRef(null);

    // --- Controls ---
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.code === 'Space') {
                stateRef.current.isHeating = true;
                setIsHeating(true);
            }
        };
        const handleKeyUp = (e) => {
            if (e.code === 'Space') {
                stateRef.current.isHeating = false;
                setIsHeating(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, []);

    // --- Game Loop ---
    useEffect(() => {
        const loop = () => {
            const { temp, progress, burnProgress, isHeating } = stateRef.current;

            // Physics: Heat or Cool
            let newTemp = temp;
            if (isHeating) {
                newTemp += HEATING_RATE;
            } else {
                newTemp -= COOLING_RATE;
            }

            // Clamp
            if (newTemp < 0) newTemp = 0;
            if (newTemp > MAX_TEMP) newTemp = MAX_TEMP;

            // Logic
            let newProgress = progress;
            let newBurn = burnProgress;

            const inZone = newTemp >= TARGET_MIN && newTemp <= TARGET_MAX;
            const isOverheating = newTemp > TARGET_MAX;

            if (inZone) {
                newProgress += BAKE_SPEED;
            }

            if (isOverheating) {
                // Burn Logic
                // If it's waaay too hot, burn faster?
                const severity = (newTemp - TARGET_MAX) / 100; // 0 to 1.5
                newBurn += BURN_SPEED + (severity * 1.0);
            } else {
                // Optional: Cool down burn? No, once burnt it stays burnt.
            }

            // Update State Ref
            stateRef.current = { temp: newTemp, progress: newProgress, burnProgress: newBurn, isHeating };

            // Sync React State
            setTemp(newTemp);
            setProgress(newProgress);
            setBurnProgress(newBurn);

            // Fail Condition
            if (newBurn >= 100) {
                onComplete(false); // Failed
                return;
            }

            // Win Condition
            if (newProgress >= 100) {
                onComplete(true); // Success
                return;
            }

            reqRef.current = requestAnimationFrame(loop);
        };

        reqRef.current = requestAnimationFrame(loop);

        return () => cancelAnimationFrame(reqRef.current);
    }, [onComplete]);

    // Derived Visuals
    const gaugeHeight = (temp / MAX_TEMP) * 100;
    const isTarget = temp >= TARGET_MIN && temp <= TARGET_MAX;
    const isTooHot = temp > TARGET_MAX;

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: '#111',
            display: 'flex', flexDirection: 'row',
            color: 'white', fontFamily: '"Press Start 2P", cursive',
            zIndex: 40,
            overflow: 'hidden'
        }}>
            {/* Burn Overlay Warning */}
            {isTooHot && (
                <div style={{
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                    background: `rgba(255, 0, 0, ${Math.min(burnProgress / 100, 0.5)})`,
                    pointerEvents: 'none',
                    zIndex: 10,
                    boxShadow: 'inset 0 0 50px red'
                }} />
            )}

            {/* Left: Instructions */}
            <div style={{ padding: 20, width: 200, borderRight: '2px solid #333', zIndex: 11 }}>
                <h2 style={{ color: 'var(--neon-yellow)' }}>OVEN MASTER</h2>
                <p style={{ fontSize: '10px', lineHeight: '1.5', marginTop: 10 }}>
                    Keep temp in <span style={{ color: 'lime' }}>GREEN ZONE</span>!
                </p>
                <div style={{ marginTop: 20, padding: 10, border: '2px solid white', textAlign: 'center', background: isHeating ? '#333' : 'transparent' }}>
                    HOLD <span style={{ color: 'var(--neon-pink)' }}>SPACE</span><br />TO HEAT
                </div>

                {/* Burn Meter */}
                <div style={{ marginTop: 30 }}>
                    <div style={{ fontSize: '10px', color: 'red', marginBottom: 5 }}>BURN RISK</div>
                    <div style={{ width: '100%', height: 10, background: '#333', border: '1px solid #555' }}>
                        <div style={{ width: `${Math.min(burnProgress, 100)}%`, height: '100%', background: 'red' }} />
                    </div>
                </div>
            </div>

            {/* Center: Pizza View */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', zIndex: 11 }}>
                <div style={{
                    fontSize: '8em',
                    filter: isTooHot ? `drop-shadow(0 0 ${20 + (Math.random() * 10)}px red)` : isTarget ? 'drop-shadow(0 0 20px gold)' : 'none',
                    transition: '0.1s',
                    transform: isTooHot ? `translate(${Math.random() * 2 - 1}px, ${Math.random() * 2 - 1}px)` : 'none' // Shake when burning
                }}>
                    {progress < 50 ? '🍕' : progress < 100 ? '🍕🔥' : '😋'}
                </div>

                {isTooHot ? (
                    <div style={{ marginTop: 20, fontSize: '1.5em', color: 'red', textShadow: '2px 2px black' }}>
                        BURNING! {Math.floor(burnProgress)}%
                    </div>
                ) : (
                    <div style={{ marginTop: 20, fontSize: '1.5em' }}>
                        BAKED: {Math.floor(progress)}%
                    </div>
                )}
            </div>

            {/* Right: Thermometer */}
            <div style={{ width: 100, padding: 20, display: 'flex', justifyContent: 'center', zIndex: 11 }}>
                <div style={{
                    position: 'relative',
                    width: 40, height: 300,
                    background: '#222',
                    border: '4px solid #555',
                    borderRadius: 20,
                    overflow: 'hidden'
                }}>
                    {/* Background Zones */}
                    <div style={{
                        position: 'absolute',
                        bottom: `${(TARGET_MIN / MAX_TEMP) * 100}%`,
                        height: `${((TARGET_MAX - TARGET_MIN) / MAX_TEMP) * 100}%`,
                        width: '100%',
                        background: 'rgba(0, 255, 0, 0.2)',
                        borderTop: '2px dashed lime',
                        borderBottom: '2px dashed lime'
                    }} />

                    {/* Mercury Bar */}
                    <div style={{
                        position: 'absolute', bottom: 0, left: 0, width: '100%',
                        height: `${gaugeHeight}%`,
                        minHeight: '4px', // Always visible
                        background: isTooHot ? 'red' : isTarget ? 'lime' : '#0099ff',
                        // Removed transition for instant responsiveness
                    }} />

                    {/* Tick Marks */}
                    <div style={{ position: 'absolute', top: '10%', right: 2, fontSize: '0.6em', color: '#888' }}>600</div>
                    <div style={{ position: 'absolute', top: '50%', right: 2, fontSize: '0.6em', color: '#888' }}>300</div>
                </div>
            </div>
        </div>
    );
};



return OvenView;
})();

const DiningView = (() => {
const customerHappy = '/arcade/customer_happy.png';
const customerAngry = '/arcade/customer_angry.png';

const DiningView = ({ pizza, recipe, onNext, avatarConfig }) => {
    const [score, setScore] = useState({ stars: 0, feedback: [] });
    const [aiReview, setAiReview] = useState(null);
    const [loadingAi, setLoadingAi] = useState(false);

    useEffect(() => {
        const runScoring = async () => {
            const calculated = calculateScoreOnly();
            setScore(calculated);

            if (canUseGemini()) {
                setLoadingAi(true);
                const review = await generatePizzaReview(pizza, recipe);
                setAiReview(review);
                setLoadingAi(false);
            }
        };
        runScoring();
    }, [pizza, recipe]);

    const calculateScoreOnly = () => {
        // 1. Cooking Check
        if (pizza.state !== 'cooked') {
            return {
                stars: 0,
                feedback: ['IT IS RAV!!!! (Raw)', 'Customer stormed out.']
            };
        }

        let stars = 5;
        let messages = [];

        // 2. Ingredients Check
        const reqIngredients = recipe.ingredients.filter(i => i.id !== 'dough');

        // Use ID based checking
        const servedToppingIds = (pizza.toppings || []).map(t => typeof t === 'string' ? t : t.id);

        reqIngredients.forEach(req => {
            if (!servedToppingIds.includes(req.id)) {
                stars -= 1;
                messages.push(`Missing ${req.symbol} (${req.id})`);
            }
        });

        // Cap stars
        if (stars < 1) stars = 1;

        // Fallback Feedback
        if (stars === 5) messages.push("DELICIOUS! Perfect Pizza!");
        else if (stars >= 3) messages.push("Not bad, but could be better.");
        else messages.push("This isn't what I ordered...");

        return { stars, feedback: messages };
    };

    const isHappy = score.stars >= 3;
    const customerImage = isHappy ? customerHappy : customerAngry;

    return (
        <div style={{
            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
            background: '#420', // Dark wood
            color: '#eee',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            justifyContent: 'flex-start', // Changed from center to prevent top cutoff
            paddingTop: '80px', // Push content down safely
            fontFamily: '"Press Start 2P", cursive',
            zIndex: 50,
            overflowY: 'auto' // Allow scroll if screen is small
        }}>
            <h1 style={{ color: 'var(--neon-yellow)', textShadow: '2px 2px black', marginBottom: '20px' }}>ORDER UP!</h1>

            {/* Customer Portrait */}
            <div style={{
                width: '180px', height: '180px',
                borderRadius: '50%',
                overflow: 'hidden',
                border: `6px solid ${isHappy ? 'lime' : 'red'}`,
                marginBottom: '20px',
                background: '#000',
                boxShadow: `0 0 30px ${isHappy ? 'lime' : 'red'}`,
                animation: isHappy ? 'bounce 0.6s infinite alternate' : 'shake 0.5s infinite',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
                {avatarConfig?.emotions ? (
                    <div
                        dangerouslySetInnerHTML={{ __html: isHappy ? avatarConfig.emotions.happy : avatarConfig.emotions.angry }}
                        style={{ width: '100%', height: '100%', transform: 'scale(0.8)' }}
                    />
                ) : (
                    <img src={customerImage} alt="Customer" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
            </div>

            {/* Receipt / Scorecard */}
            <div style={{
                background: '#fff', color: '#000',
                padding: '20px', width: '320px',
                fontFamily: 'Courier New, monospace',
                boxShadow: '0 0 15px black',
                transform: 'rotate(-2deg)',
                position: 'relative'
            }}>
                {/* Pin */}
                <div style={{
                    position: 'absolute', top: -15, left: '50%', transform: 'translateX(-50%)',
                    width: 30, height: 30, borderRadius: '50%', background: 'black', boxShadow: 'inset 0 2px 5px rgba(255,255,255,0.3)'
                }} />

                <h3 style={{ textAlign: 'center', borderBottom: '2px dashed #000', paddingBottom: '10px' }}>
                    BILL CHECK
                </h3>

                <div style={{ margin: '15px 0' }}>
                    <strong>Ordered:</strong> {recipe.name}<br />
                    <strong>Served:</strong> {pizza.state === 'cooked' ? 'Cooked Pizza' : 'Raw Mess'}
                </div>

                <div style={{ borderTop: '1px solid #ccc', paddingTop: '10px' }}>
                    {/* Standard Errors (Missing items) always show */}
                    {score.feedback.filter(msg => msg.startsWith('Missing')).map((msg, i) => (
                        <div key={i} style={{ color: '#d00', marginBottom: '5px' }}>&gt; {msg}</div>
                    ))}

                    {/* AI or Standard Review */}
                    {canUseGemini() ? (
                        <div style={{ marginTop: '10px', fontStyle: 'italic', color: '#555' }}>
                            {loadingAi ? (
                                <span>Generating Critique...</span>
                            ) : (
                                <span style={{ color: '#222' }}>"{aiReview}"</span>
                            )}
                        </div>
                    ) : (
                        score.feedback.filter(msg => !msg.startsWith('Missing')).map((msg, i) => (
                            <div key={i} style={{ color: '#222', marginBottom: '5px' }}>"{msg}"</div>
                        ))
                    )}
                </div>

                <div style={{
                    marginTop: '20px',
                    fontSize: '2em',
                    textAlign: 'center',
                    color: 'gold',
                    textShadow: '1px 1px 0 #000'
                }}>
                    {'★'.repeat(score.stars)}{'☆'.repeat(5 - score.stars)}
                </div>
            </div>

            <button
                onClick={() => onNext(score.stars)}
                style={{
                    marginTop: '30px',
                    padding: '15px 40px',
                    fontSize: '1.2em',
                    background: 'var(--neon-green)',
                    color: 'black',
                    border: 'none',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    boxShadow: '0 5px 0 #050'
                }}
            >
                NEXT ORDER
            </button>

            <style>{`
                @keyframes bounce { from { transform: translateY(0); } to { transform: translateY(-10px); } }
                @keyframes shake { 
                    0% { transform: translate(1px, 1px) rotate(0deg); }
                    10% { transform: translate(-1px, -2px) rotate(-1deg); }
                    20% { transform: translate(-3px, 0px) rotate(1deg); }
                    30% { transform: translate(3px, 2px) rotate(0deg); }
                    40% { transform: translate(1px, -1px) rotate(1deg); }
                    50% { transform: translate(-1px, 2px) rotate(-1deg); }
                    60% { transform: translate(-3px, 1px) rotate(0deg); }
                    70% { transform: translate(3px, 1px) rotate(-1deg); }
                    80% { transform: translate(-1px, -1px) rotate(1deg); }
                    90% { transform: translate(1px, 2px) rotate(0deg); }
                    100% { transform: translate(1px, -2px) rotate(-1deg); }
                }
            `}</style>
        </div>
    );
};



return DiningView;
})();

const AvatarEditor = (() => {
const html2canvas = window.html2canvas;

const COLORS = ['#E8402A', '#8A63D2', '#E17BA4', '#2E5BFF', '#FAF4E8'];
const PANTS_COLORS = ['#2E5BFF', '#201A17', '#8A63D2', '#6B6157', '#E8402A'];
const SKIN_TONES = ['#FFC0CB', '#8D5524', '#F1C27D', '#E0AC69'];
const HATS = ['chef', 'cap', 'cowboy', 'crown', 'viking', 'none'];

const AvatarEditor = ({ onComplete }) => {
    const [config, setConfig] = useState({
        color: COLORS[0],
        skin: SKIN_TONES[2],
        hat: HATS[0],
        pants: PANTS_COLORS[0],
        hair: 'short',   // 'short' | 'long'
        outfit: 'pants'  // 'pants' | 'dress'
    });

    const isDress = config.outfit === 'dress';
    const isLongHair = config.hair === 'long';

    const [isGenerating, setIsGenerating] = useState(false);
    const [status, setStatus] = useState("");

    const handleStart = async () => {
        try {
            // 1. Capture Screenshot FIRST (Before UI disappears)
            const previewElement = document.getElementById('avatar-preview');
            if (!previewElement) throw new Error("Preview element not found");

            const canvas = await html2canvas(previewElement, {
                backgroundColor: null,
                scale: 2
            });
            const imageBase64 = canvas.toDataURL("image/png");

            // 2. NOW switch to Loading Screen
            setIsGenerating(true);
            setStatus("INITIALIZING UPLINK...");

            // 3. Check Key
            await new Promise(r => setTimeout(r, 800));
            if (!canUseGemini()) {
                setStatus("ERROR: API KEY NOT FOUND\nFALLING BACK TO DEFAULTS");
                await new Promise(r => setTimeout(r, 2000));
                setIsGenerating(false);
                onComplete({ ...config, emotions: null });
                return;
            }

            // 4. Start Generation
            setStatus("TRANSMITTING VISION DATA TO SKYNET...");
            const apiPromise = generateAvatarEmotions(config, imageBase64);
            const minWait = new Promise(r => setTimeout(r, 1500));

            const [emotions] = await Promise.all([apiPromise, minWait]);

            if (emotions) {
                setStatus("PERSONA ACQUIRED.");
                await new Promise(r => setTimeout(r, 800));
                setIsGenerating(false);
                onComplete({ ...config, emotions });
            } else {
                throw new Error("Unknown Error (Empty)");
            }
        } catch (e) {
            console.error(e);
            // If capturing failed, we might not be in loading state yet
            // Ensure we are in loading state to show error, or alert
            setIsGenerating(true);
            setStatus(`FAILED: ${e.message || e.toString()}`);
            await new Promise(r => setTimeout(r, 3000));
            setIsGenerating(false);
            onComplete({ ...config, emotions: null });
        }
    };

    if (isGenerating) {
        return (
            <div style={{
                position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
                background: 'rgba(0,0,0,0.95)',
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                zIndex: 9999, color: 'var(--neon-green)'
            }}>
                <h2 className="blink" style={{ fontFamily: '"Press Start 2P"', marginBottom: '20px' }}>CONNECTING TO SKYNET...</h2>
                <div style={{ width: '300px', height: '20px', border: '2px solid var(--neon-green)', padding: '2px' }}>
                    <div style={{
                        width: '100%', height: '100%', background: 'var(--neon-green)',
                        animation: 'progress 2s infinite ease-in-out'
                    }} />
                </div>
                <p style={{ marginTop: '20px', color: '#aaa', fontSize: '0.8rem', fontFamily: 'monospace', whiteSpace: 'pre-wrap', textAlign: 'center' }}>
                    {status}
                </p>
                <style>{`
                    @keyframes progress {
                        0% { width: 0%; }
                        50% { width: 70%; }
                        100% { width: 100%; }
                    }
                    .blink { animation: blink 1s infinite; }
                    @keyframes blink { 50% { opacity: 0; } }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ textAlign: 'center', padding: '1rem' }}>
            <h3 className="text-neon-pink" style={{ marginBottom: '1rem', fontSize: '1.2rem' }}>DESIGN YOUR CHEF</h3>

            <div style={{
                display: 'flex',
                gap: '8rem', // Increased gap to prevent overlap
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: '14rem', // drastically increased to account for scale(2.5) overflow
                paddingLeft: '2rem' // Shift slightly right
            }}>

                {/* --- PREVIEW AREA --- */}
                <div id="avatar-preview" style={{
                    width: '120px',
                    height: '180px',
                    position: 'relative',
                    imageRendering: 'pixelated',
                    transform: 'scale(2.5)', // Bigger!
                    transformOrigin: 'top center'
                }}>
                    {/* Legs (Behind Dress if dress) */}
                    <div style={{
                        position: 'absolute', bottom: 40, left: 35, width: 20, height: 40,
                        background: isDress ? config.skin : config.pants,
                        borderRadius: '0 0 8px 8px'
                    }} />
                    <div style={{
                        position: 'absolute', bottom: 40, right: 35, width: 20, height: 40,
                        background: isDress ? config.skin : config.pants,
                        borderRadius: '0 0 8px 8px'
                    }} />

                    {/* Long Hair (Back) */}
                    {isLongHair && (
                        <div style={{
                            position: 'absolute', top: 20, left: 20, width: 80, height: 60,
                            background: '#4a3c31', // Dark Brown Hair
                            borderRadius: '8px',
                            zIndex: 1
                        }} />
                    )}

                    {/* Body (Shirt/Dress) */}
                    <div style={{
                        position: 'absolute',
                        bottom: isDress ? 40 : 70,
                        left: isDress ? 15 : 20,
                        width: isDress ? 90 : 80,
                        height: isDress ? 60 : 50,
                        background: config.color,
                        borderRadius: isDress ? '8px 8px 20px 20px' : '8px',
                        zIndex: 2,
                        clipPath: isDress ? 'polygon(10% 0, 90% 0, 100% 100%, 0% 100%)' : 'none'
                    }}>
                        {/* Logo */}
                        <div style={{ position: 'absolute', top: 15, left: isDress ? 35 : 30, fontSize: '20px' }}>🍕</div>
                    </div>

                    {/* Head */}
                    <div style={{
                        position: 'absolute', top: 10, left: 30, width: 60, height: 60,
                        backgroundColor: config.skin,
                        borderRadius: '8px',
                        zIndex: 3
                    }}>
                        {/* Eyes & Mouth (conditional) */}
                        {!config.sunglasses && (
                            <>
                                <div style={{ position: 'absolute', top: 20, left: 15, width: 8, height: 8, background: 'black' }} />
                                <div style={{ position: 'absolute', top: 20, right: 15, width: 8, height: 8, background: 'black' }} />
                            </>
                        )}
                        <div style={{ position: 'absolute', bottom: 15, left: 20, width: 20, height: 4, background: 'black' }} />

                        {/* Mustache */}
                        {config.mustache && (
                            <div style={{
                                position: 'absolute', bottom: 22, left: 15, width: 30, height: 6,
                                background: '#420', borderRadius: '4px'
                            }} />
                        )}

                        {/* Sunglasses */}
                        {config.sunglasses && (
                            <div style={{
                                position: 'absolute', top: 20, left: 10, width: 40, height: 12,
                                background: 'black', display: 'flex', gap: '4px'
                            }}>
                                {/* Glare */}
                                <div style={{ position: 'absolute', top: 2, left: 4, width: 6, height: 4, background: '#555' }} />
                                <div style={{ position: 'absolute', top: 2, right: 4, width: 6, height: 4, background: '#555' }} />
                            </div>
                        )}
                    </div>

                    {/* Hat: Chef */}
                    {config.hat === 'chef' && (
                        <div style={{
                            position: 'absolute', top: -25, left: 40, width: 40, height: 50,
                            background: 'white', borderRadius: '10px 10px 0 0',
                            boxShadow: '0 5px 0 #ddd inset',
                            zIndex: 4
                        }} />
                    )}
                    {/* Hat: Cap */}
                    {config.hat === 'cap' && (
                        <div style={{
                            position: 'absolute', top: 0, left: 25, width: 70, height: 25,
                            background: '#333', borderRadius: '8px 8px 0 0',
                            zIndex: 4
                        }}>
                            <div style={{ position: 'absolute', bottom: 0, right: -10, width: 20, height: 8, background: '#333' }}></div>
                        </div>
                    )}
                    {/* Hat: Cowboy */}
                    {config.hat === 'cowboy' && (
                        <div style={{ position: 'absolute', top: -10, left: 10, zIndex: 4 }}>
                            {/* Brim */}
                            <div style={{ position: 'absolute', top: 20, left: 0, width: 100, height: 10, background: '#8B4513', borderRadius: '5px' }} />
                            {/* Top */}
                            <div style={{ position: 'absolute', top: 0, left: 30, width: 40, height: 25, background: '#8B4513', borderRadius: '5px 5px 0 0' }} />
                        </div>
                    )}
                    {/* Hat: Crown */}
                    {config.hat === 'crown' && (
                        <div style={{
                            position: 'absolute', top: -15, left: 30, width: 60, height: 30,
                            background: 'gold', zIndex: 4,
                            clipPath: 'polygon(0% 100%, 20% 0%, 40% 100%, 60% 0%, 80% 100%, 100% 0%, 100% 100%, 0% 100%)'
                        }} />
                    )}
                    {/* Hat: Viking */}
                    {config.hat === 'viking' && (
                        <div style={{ position: 'absolute', top: -5, left: 25, width: 70, height: 20, background: '#aaa', zIndex: 4, borderRadius: '5px 5px 0 0' }}>
                            {/* Horns */}
                            <div style={{ position: 'absolute', top: -15, left: -5, width: 10, height: 20, background: 'white', clipPath: 'polygon(100% 100%, 0 0, 100% 50%)' }} />
                            <div style={{ position: 'absolute', top: -15, right: -5, width: 10, height: 20, background: 'white', clipPath: 'polygon(0 100%, 100% 0, 0 50%)' }} />
                        </div>
                    )}

                    {/* Arms */}
                    <div style={{
                        position: 'absolute', top: 60, left: 5, width: 20, height: 40,
                        background: config.color,
                        borderRadius: '8px',
                        zIndex: 1
                    }}>
                        <div style={{ position: 'absolute', bottom: -5, left: 0, width: 20, height: 10, background: config.skin, borderRadius: '0 0 4px 4px' }} />
                    </div>
                    <div style={{
                        position: 'absolute', top: 60, right: 5, width: 20, height: 40,
                        background: config.color,
                        borderRadius: '8px',
                        zIndex: 1
                    }}>
                        <div style={{ position: 'absolute', bottom: -5, left: 0, width: 20, height: 10, background: config.skin, borderRadius: '0 0 4px 4px' }} />
                    </div>
                </div>

                {/* --- CONTROLS --- */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', textAlign: 'left', minWidth: '200px' }}>

                    {/* Style Options */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>HAIR</label>
                            <button
                                onClick={() => setConfig({ ...config, hair: config.hair === 'short' ? 'long' : 'short' })}
                                style={{ padding: '5px 10px', background: '#333', border: '1px solid #555', color: 'white', cursor: 'pointer' }}
                            >
                                {config.hair === 'short' ? 'Short' : 'Long'}
                            </button>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>OUTFIT</label>
                            <button
                                onClick={() => setConfig({ ...config, outfit: config.outfit === 'pants' ? 'dress' : 'pants' })}
                                style={{ padding: '5px 10px', background: '#333', border: '1px solid #555', color: 'white', cursor: 'pointer' }}
                            >
                                {config.outfit === 'pants' ? 'Uniform' : 'Dress'}
                            </button>
                        </div>
                    </div>

                    <hr style={{ borderColor: '#333', margin: '0.5rem 0' }} />

                    {/* Colors */}
                    <div>
                        <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>OUTFIT COLOR</label>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {COLORS.map(c => (
                                <button key={c}
                                    onClick={() => setConfig({ ...config, color: c })}
                                    style={{
                                        width: '24px', height: '24px', background: c, border: config.color === c ? '2px solid white' : '1px solid #333',
                                        cursor: 'pointer'
                                    }}
                                />
                            ))}
                        </div>
                    </div>

                    {!isDress && (
                        <div>
                            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>PANTS COLOR</label>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                {PANTS_COLORS.map(c => (
                                    <button key={c}
                                        onClick={() => setConfig({ ...config, pants: c })}
                                        style={{
                                            width: '24px', height: '24px', background: c, border: config.pants === c ? '2px solid white' : '1px solid #333',
                                            cursor: 'pointer'
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Skin/Hat */}
                    <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                        <div>
                            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>SKIN</label>
                            <div style={{ display: 'flex', gap: '0.2rem' }}>
                                {SKIN_TONES.map(c => (
                                    <button key={c}
                                        onClick={() => setConfig({ ...config, skin: c })}
                                        style={{ width: '20px', height: '20px', background: c, border: config.skin === c ? '2px solid white' : '1px solid #333' }}
                                    />
                                ))}
                            </div>
                        </div>
                        <div>
                            <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>HAT</label>
                            <select
                                value={config.hat}
                                onChange={(e) => setConfig({ ...config, hat: e.target.value })}
                                style={{ padding: '0.3rem', background: '#333', color: 'white', border: '1px solid #555', fontSize: '0.8rem' }}
                            >
                                <option value="chef">Chef Hat</option>
                                <option value="cap">Cap</option>
                                <option value="cowboy">Cowboy</option>
                                <option value="crown">Crown</option>
                                <option value="viking">Viking</option>
                                <option value="none">No Hat</option>
                            </select>
                        </div>
                    </div>

                    {/* COOL FACTOR */}
                    <div style={{ marginTop: '1rem' }}>
                        <label style={{ fontSize: '0.8rem', display: 'block', marginBottom: '0.5rem' }}>COOL FACTOR</label>
                        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <button
                                onClick={() => setConfig({ ...config, sunglasses: !config.sunglasses })}
                                style={{
                                    padding: '5px 10px',
                                    background: config.sunglasses ? 'var(--neon-green)' : '#333',
                                    color: config.sunglasses ? 'black' : 'white',
                                    border: '1px solid #555',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem'
                                }}
                            >
                                🕶️ Shades
                            </button>
                            <button
                                onClick={() => setConfig({ ...config, mustache: !config.mustache })}
                                style={{
                                    padding: '5px 10px',
                                    background: config.mustache ? 'var(--neon-pink)' : '#333',
                                    color: config.mustache ? 'white' : 'white',
                                    border: '1px solid #555',
                                    cursor: 'pointer',
                                    fontSize: '0.8rem'
                                }}
                            >
                                👨🏻 Stache
                            </button>
                        </div>
                    </div>

                </div>
            </div>

            <button
                onClick={handleStart}
                id="start-btn"
                className="btn btn-primary"
                style={{
                    fontSize: '1.2rem',
                    padding: '1rem 3rem',
                    marginTop: '4rem', // Added extra margin to clear the scaled feet
                    position: 'relative',
                    zIndex: 10 // Ensure button is clickable if lightweight overlap
                }}
            >
                START COOKING
            </button>
        </div>
    );
};



return AvatarEditor;
})();

const MenuSystem = (() => {

const CLASSICS = [
    {
        id: 'margherita',
        name: 'Margherita',
        description: 'The classic. Just stay simple.',
        ingredients: [
            { id: 'dough', name: 'Dough', symbol: '🍘' },
            { id: 'sauce', name: 'Tomato Sauce', symbol: '🍅' },
            { id: 'cheese', name: 'Mozzarella', symbol: '🧀' },
            { id: 'basil', name: 'Fresh Basil', symbol: '🌿' }
        ]
    },
    {
        id: 'pepperoni',
        name: 'Pepperoni Feast',
        description: 'Spicy, greasy, perfect.',
        ingredients: [
            { id: 'dough', name: 'Dough', symbol: '🍘' },
            { id: 'sauce', name: 'Tomato Sauce', symbol: '🍅' },
            { id: 'cheese', name: 'Mozzarella', symbol: '🧀' },
            { id: 'pepperoni', name: 'Pepperoni', symbol: '🔴' }
        ]
    },
    {
        id: 'hawaiian',
        name: 'Aloha Disaster',
        description: 'Controversial yet brave.',
        ingredients: [
            { id: 'dough', name: 'Dough', symbol: '🍘' },
            { id: 'sauce', name: 'Tomato Sauce', symbol: '🍅' },
            { id: 'cheese', name: 'Mozzarella', symbol: '🧀' },
            { id: 'pineapple', name: 'Pineapple', symbol: '🍍' },
            { id: 'ham', name: 'Ham', symbol: '🥩' }
        ]
    }
];

const MenuSystem = ({ onSelectRecipe }) => {
    const [tab, setTab] = useState('CLASSICS'); // 'CLASSICS' | 'LAB'
    const [prompt, setPrompt] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setIsGenerating(true);
        setError(null);

        try {
            const recipe = await generatePizzaRecipe(prompt);
            console.log("Generated Recipe:", recipe);

            if (recipe) {
                // Ensure base ingredients exist if AI verified them? 
                // Actually the prompt should handle it, or we force add them.
                // Let's assume AI prompt is good for now.
                onSelectRecipe(recipe);
            } else {
                setError("AI burnt the recipe. Try again!");
            }
        } catch (e) {
            console.error(e);
            setError("Connection to Recipe Database Failed.");
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: 'white',
            maxWidth: '600px',
            margin: '0 auto'
        }}>
            <h2 className="text-neon-pink" style={{ marginBottom: '2rem', fontSize: '2rem' }}>PIZZA MENU</h2>

            {/* TABS */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginBottom: '2rem' }}>
                <button
                    onClick={() => setTab('CLASSICS')}
                    style={{
                        padding: '10px 20px',
                        background: tab === 'CLASSICS' ? 'var(--neon-green)' : '#333',
                        color: tab === 'CLASSICS' ? 'black' : 'white',
                        border: 'none', cursor: 'pointer', fontFamily: '"Press Start 2P"',
                        boxShadow: tab === 'CLASSICS' ? '0 0 10px var(--neon-green)' : 'none'
                    }}
                >
                    CLASSICS
                </button>
                <button
                    onClick={() => setTab('LAB')}
                    style={{
                        padding: '10px 20px',
                        background: tab === 'LAB' ? 'var(--neon-pink)' : '#333',
                        color: tab === 'LAB' ? 'white' : 'white',
                        border: 'none', cursor: 'pointer', fontFamily: '"Press Start 2P"',
                        boxShadow: tab === 'LAB' ? '0 0 10px var(--neon-pink)' : 'none'
                    }}
                >
                    R&D LAB 🧪
                </button>
            </div>

            {/* CONTENT */}
            {tab === 'CLASSICS' && (
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {CLASSICS.map(r => (
                        <div key={r.id}
                            onClick={() => onSelectRecipe(r)}
                            style={{
                                border: '2px solid #555', padding: '1rem', cursor: 'pointer',
                                textAlign: 'left', background: 'rgba(0,0,0,0.5)',
                                display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                            }}
                            onMouseEnter={e => { e.currentTarget.style.borderColor = 'white'; e.currentTarget.style.background = '#222'; }}
                            onMouseLeave={e => { e.currentTarget.style.borderColor = '#555'; e.currentTarget.style.background = 'rgba(0,0,0,0.5)'; }}
                        >
                            <div>
                                <h4 style={{ color: 'var(--neon-green)', marginBottom: '0.5rem' }}>{r.name}</h4>
                                <p style={{ fontSize: '0.8rem', color: '#aaa' }}>{r.description}</p>
                            </div>
                            <div style={{ fontSize: '1.5rem' }}>
                                {r.ingredients.slice(2).map(i => i.symbol).join(' ')} ➡️
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {tab === 'LAB' && (
                <div style={{ border: '2px dashed var(--neon-pink)', padding: '2rem', background: 'rgba(50,0,20,0.5)' }}>
                    <h3 style={{ marginBottom: '1rem' }}>INVENT A PIZZA</h3>
                    <p style={{ fontSize: '0.9rem', color: '#ccc', marginBottom: '1.5rem' }}>
                        Type anything. The AI will invent the recipe and shipment orders.
                    </p>

                    <input
                        type="text"
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. Spicy Alien Slime Pizza..."
                        style={{
                            width: '100%', padding: '1rem', fontSize: '1rem',
                            background: '#111', border: '1px solid #555', color: 'white',
                            marginBottom: '1rem', textAlign: 'center'
                        }}
                    />

                    {error && <div style={{ color: 'red', marginBottom: '1rem' }}>{error}</div>}

                    {canUseGemini() ? (
                        <button
                            onClick={handleGenerate}
                            disabled={isGenerating}
                            style={{
                                padding: '15px 30px',
                                background: isGenerating ? '#555' : 'var(--neon-pink)',
                                color: 'white', border: 'none', cursor: isGenerating ? 'wait' : 'pointer',
                                fontSize: '1.2rem', fontFamily: '"Press Start 2P"'
                            }}
                        >
                            {isGenerating ? "INVENTING..." : "GENERATE RECIPE"}
                        </button>
                    ) : (
                        <div style={{ color: 'red' }}>API KEY REQUIRED FOR R&D LAB</div>
                    )}
                </div>
            )}
        </div>
    );
};



return MenuSystem;
})();

const PizzaCritic = (() => {

const MESSAGES = [
    { score: 10, text: "ABSOLUTE PERFECTION! CHEF'S KISS! 🤌" },
    { score: 9, text: "Almost divine. Needs more glitz!" },
    { score: 8, text: "Solid pie. I'd eat it." },
    { score: 6, text: "It's... edible. Barely." },
    { score: 0, text: "MY EYES! WHAT DID YOU DO?!" }
];

const CRITICS = ['🐱', '👽', '💀', '👩‍🍳'];

const SCORES_KEY = 'hypertobi_pizzalab_scores';

/* leaderboard + weekly-pizza claim, shown under the critic's verdict */
const CriticScorePanel = ({ score }) => {
    const [name, setName] = useState('');
    const [saved, setSaved] = useState(false);
    const [list, setList] = useState(() => {
        try { return JSON.parse(localStorage.getItem(SCORES_KEY)) || []; } catch (e) { return []; }
    });
    const qualifies = !saved && (list.length < 5 || score > list[list.length - 1].s);
    const save = () => {
        const next = [...list, { n: (name || 'TOB').toUpperCase().slice(0, 3), s: score }]
            .sort((a, b) => b.s - a.s).slice(0, 5);
        try { localStorage.setItem(SCORES_KEY, JSON.stringify(next)); } catch (e) { /* private mode */ }
        setList(next); setSaved(true); playSuccess();
    };
    return (
        <div style={{ marginTop: '1.5rem', borderTop: '2px dashed #444', paddingTop: '1rem' }}>
            {qualifies && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '0.8rem' }}>
                    <input
                        value={name} onChange={(e) => setName(e.target.value)}
                        maxLength={3} placeholder="AAA"
                        onKeyDown={(e) => { if (e.key === 'Enter') save(); e.stopPropagation(); }}
                        style={{ width: '70px', textAlign: 'center', fontFamily: 'var(--font-retro)', fontSize: '0.8rem', background: '#111', color: '#fff', border: '2px solid var(--neon-green)', padding: '6px', textTransform: 'uppercase' }}
                    />
                    <button onClick={save} className="btn" style={{ fontSize: '0.55rem', padding: '0.6rem 1rem' }}>SAVE SCORE</button>
                </div>
            )}
            <div style={{ fontFamily: 'var(--font-retro)', fontSize: '0.55rem', lineHeight: 2.2, color: '#ccc' }}>
                <div style={{ color: 'var(--neon-pink)' }}>— TOP CHEFS —</div>
                {list.length
                    ? list.map((r, i) => <div key={i}>{i + 1}. {r.n} · {r.s}/10</div>)
                    : <div style={{ color: '#666' }}>no chefs yet — be the first</div>}
            </div>
            {score >= 10 && (
                <div style={{ border: '2px dashed var(--neon-yellow)', padding: '14px', marginTop: '1.2rem', background: 'rgba(255,255,0,0.05)' }}>
                    <div style={{ fontFamily: 'var(--font-retro)', fontSize: '0.6rem', color: 'var(--neon-yellow)', marginBottom: '8px' }}>🏆 PERFECT PIZZA — WIN A REAL ONE</div>
                    <div style={{ fontSize: '0.85rem', color: '#eee', marginBottom: '10px', lineHeight: 1.5 }}>
                        Screenshot this verdict and DM it to <b>@hypertobi</b> — the best chef of the week gets a pizza voucher.
                    </div>
                    <a href="https://instagram.com/hypertobi" target="_blank" rel="noopener" className="btn" style={{ fontSize: '0.55rem' }}>OPEN INSTAGRAM ▸</a>
                </div>
            )}
        </div>
    );
};

const PizzaCritic = ({ toppings, onRestart, avatarConfig, stars }) => {
    const [criticEmoji, setCriticEmoji] = useState(CRITICS[0]);
    const [review, setReview] = useState(null);

    useEffect(() => {
        // Pick a random critic emoji if no avatarConfig is provided
        if (!avatarConfig?.emotions) {
            setCriticEmoji(CRITICS[Math.floor(Math.random() * CRITICS.length)]);
        }

        // Calculate score logic
        let score = 8;
        let comment = "Not bad, kid.";

        // Logic based on ingredients
        const hasMarshmallow = toppings.find(t => t.id === 'marshmallow');
        const hasPineapple = toppings.find(t => t.id === 'pineapple');
        const hasJalapeno = toppings.find(t => t.id === 'jalapeno');

        let aiPromise = null;

        if (hasMarshmallow && hasJalapeno) {
            score = 0; // Chaos crime
            comment = "Spicy Marshmallows? Are you OK?";
        } else if (hasMarshmallow) {
            score = 11; // Bonus points for chaos
            comment = "A DESSERT PIZZA?! GENIUS! 11/10";
        } else if (stars !== undefined) {
            // SYNC WITH GAMEPLAY STARS
            score = stars * 2; // 5 stars -> 10/10
            // Default generic comment initially
            if (stars === 5) comment = "ABSOLUTE PERFECTION! CHEF'S KISS! 🤌";
            else if (stars === 4) comment = "Almost divine. Needs more glitz!";
            else if (stars === 3) comment = "Solid pie. I'd eat it.";
            else comment = "My disappointment is immeasurable.";

            // TRIGGER AI COMMENT GENERATOR
            if (canUseGemini()) {
                // Pass a generic name if recipe name not available prop yet, but toppings tell story
                aiPromise = generateCriticComment("Custom Pizza", score, toppings);
            }

        } else if (hasPineapple && toppings.length === 1) {
            score = 3;
            comment = "Just pineapple? Bold. Wrong, but bold.";
        } else if (toppings.length > 8) {
            score = 10;
            comment = "MAXIMUM FLAVOR OVERLOAD!";
        } else {
            const randomMsg = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
            score = randomMsg.score;
            comment = randomMsg.text;
        }

        const finalize = async () => {
            if (aiPromise) {
                try {
                    const aiText = await aiPromise;
                    if (aiText) comment = aiText;
                } catch (e) { console.error(e); }
            }
            setReview({ score, comment });
            if (score > 8) playSuccess();
        };

        // Delay for suspense
        setTimeout(finalize, 1500);

    }, [toppings, avatarConfig, stars]);

    const isHappy = review ? review.score >= 3 : false; // Basic logic for avatar emotion

    return (
        <div style={{
            textAlign: 'center',
            padding: '2rem',
            background: '#222',
            border: '4px dashed var(--neon-green)',
            animation: 'fadeIn 0.5s ease-out'
        }}>
            <h3 className="text-neon-pink" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>THE CRITIC HAS ARRIVED</h3>

            <div style={{ fontSize: '5rem', marginBottom: '1rem', animation: 'bounce 1s infinite', display: 'flex', justifyContent: 'center' }}>
                {avatarConfig?.emotions ? (
                    <div
                        dangerouslySetInnerHTML={{ __html: isHappy ? avatarConfig.emotions.happy : avatarConfig.emotions.angry }}
                        style={{ width: '120px', height: '120px' }}
                    />
                ) : (
                    <span>{criticEmoji}</span>
                )}
            </div>

            {!review ? (
                <p className="text-neon-green" style={{ fontFamily: 'var(--font-retro)' }}>TASTING...</p>
            ) : (
                <div>
                    <div style={{ fontSize: '3rem', color: 'white', fontWeight: 'bold' }}>
                        SCORE: <span style={{ color: review.score > 5 ? 'var(--neon-green)' : 'red' }}>{review.score}/10</span>
                    </div>
                    <p style={{ fontSize: '1.2rem', margin: '1rem 0', fontStyle: 'italic', color: '#ccc' }}>
                        "{review.comment}"
                    </p>
                    <CriticScorePanel score={review.score} />
                    <button onClick={onRestart} className="btn btn-primary" style={{ marginTop: '1.2rem' }}>COOK AGAIN</button>
                </div>
            )}

            <style>{`
                @keyframes bounce {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-10px); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.9); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};



return PizzaCritic;
})();

const KitchenGame = (() => {

const GAME_WIDTH = 600;
const GAME_HEIGHT = 400;
const MOVEMENT_SPEED = 0.3; // Pixels per ms
const INTERACTION_DIST = 100;

// Base Stations that always exist
const FIXED_STATIONS = [
    { id: 'prep1', type: 'prep', x: 200, y: 200, w: 100, h: 60, content: null, inventory: [] },
    { id: 'oven1', type: 'oven', x: 450, y: 20, w: 80, h: 100, content: null, timer: 0 },
    { id: 'serve', type: 'serve', x: 450, y: 300, w: 80, h: 80 }
];

const checkCollision = (rect1, rect2) => {
    return (
        rect1.x < rect2.x + rect2.w &&
        rect1.x + rect1.w > rect2.x &&
        rect1.y < rect2.y + rect2.h &&
        rect1.y + rect1.h > rect2.y
    );
};

const getDistance = (p1, p2) => {
    return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

const KitchenGame = ({ avatarConfig, onGameComplete, initialRecipe }) => {
    const controls = usePlayerControls();

    const [isGameStarted, setIsGameStarted] = useState(false);
    const [currentRecipe, setCurrentRecipe] = useState(initialRecipe || null);
    const [viewMode, setViewMode] = useState('KITCHEN'); // 'KITCHEN', 'PREP', 'OVEN', 'DINING'
    const gameContainerRef = useRef(null);

    const [gameState, setGameState] = useState({
        player: {
            x: 300,
            y: 100,
            w: 40, h: 40, // Hitbox
            direction: 'down',
            isWalking: false,
            holding: null
        },
        stations: [],
        activeStation: null,
        message: 'Select a Recipe!'
    });

    const gameStateRef = useRef(gameState);
    const lastActionRef = useRef(false);

    useEffect(() => {
        gameStateRef.current = gameState;
    }, [gameState]);

    // Handle Initial Recipe Injection
    useEffect(() => {
        if (initialRecipe) {
            handleRecipeSelect(initialRecipe);
        }
    }, [initialRecipe]);

    // --- GAME INITIALIZATION ---
    const handleRecipeSelect = (recipe) => {
        setCurrentRecipe(recipe);

        // Dynamically spawn crates based on ingredients
        const ingredientStations = recipe.ingredients.map((ing, index) => ({
            id: ing.id,
            type: 'crate',
            x: 20,
            y: 20 + (index * 60), // Stack vertically
            w: 50, h: 50,
            data: { id: ing.id, symbol: ing.symbol }
        }));

        // Deep copy fixed stations to avoid global mutation persistence
        const baseStations = FIXED_STATIONS.map(s => ({
            ...s,
            inventory: s.inventory ? [] : undefined // Reset inventory entirely
        }));

        setGameState(prev => ({
            ...prev,
            stations: [...ingredientStations, ...baseStations],
            message: `Chef! Make a ${recipe.name}!`
        }));
    };

    const handleStartGame = () => {
        setIsGameStarted(true);
        if (gameContainerRef.current) {
            gameContainerRef.current.focus();
        }
    };

    const handlePrepComplete = (toppings) => {
        if (!toppings) {
            // Cancelled/No Dough
            setViewMode('KITCHEN');
            setTimeout(() => gameContainerRef.current?.focus(), 100);
            return;
        }

        const state = gameStateRef.current;
        const prepIdx = state.stations.findIndex(s => s.type === 'prep');
        const prepStation = state.stations[prepIdx];

        // Create the assembled pizza
        const newPizza = {
            id: 'pizza',
            state: 'raw',
            symbol: '🍕', // Raw pizza
            toppings: toppings,
            recipeId: currentRecipe.id
        };

        // Update Station: Clear inventory, Set Content
        prepStation.inventory = [];
        prepStation.content = newPizza;

        setGameState({ ...state, stations: [...state.stations], message: "Pizza Assembled! to the Oven!" });
        setViewMode('KITCHEN');
        setTimeout(() => gameContainerRef.current?.focus(), 100);
    };

    const handleOvenComplete = (success) => {
        const state = gameStateRef.current;
        const ovenIdx = state.stations.findIndex(s => s.type === 'oven');
        const oven = state.stations[ovenIdx];

        if (oven.content) {
            if (success) {
                oven.content.state = 'cooked';
                oven.content.symbol = '🍕🔥';
                setGameState({ ...state, message: 'Perfectly Baked!' });
            } else {
                oven.content.state = 'burnt';
                oven.content.symbol = '⚫';
                setGameState({ ...state, message: 'IT BURNED!' });
            }
        }

        setViewMode('KITCHEN');
        setTimeout(() => gameContainerRef.current?.focus(), 100);
    };

    const handleDiningComplete = (stars) => {
        // Complete the game session
        onGameComplete && onGameComplete({ status: 'success', stars });
    };

    useGameLoop((deltaTime) => {
        if (!isGameStarted || !currentRecipe || viewMode !== 'KITCHEN') return;

        const state = gameStateRef.current;
        let player = { ...state.player };
        const stations = [...state.stations];
        let message = state.message;

        // --- 1. Movement & Collision ---
        let dx = 0;
        let dy = 0;

        if (controls.up) dy -= MOVEMENT_SPEED * deltaTime;
        if (controls.down) dy += MOVEMENT_SPEED * deltaTime;
        if (controls.left) dx -= MOVEMENT_SPEED * deltaTime;
        if (controls.right) dx += MOVEMENT_SPEED * deltaTime;

        if (dx !== 0) {
            player.x += dx;
            player.direction = dx > 0 ? 'right' : 'left';
            if (player.x < 0) player.x = 0;
            if (player.x > GAME_WIDTH - player.w) player.x = GAME_WIDTH - player.w;
            for (const s of stations) {
                if (checkCollision(player, s)) player.x -= dx;
            }
        }
        if (dy !== 0) {
            player.y += dy;
            if (dx === 0) player.direction = dy > 0 ? 'down' : 'up';
            if (player.y < 0) player.y = 0;
            if (player.y > GAME_HEIGHT - player.h) player.y = GAME_HEIGHT - player.h;
            for (const s of stations) {
                if (checkCollision(player, s)) player.y -= dy;
            }
        }
        player.isWalking = (dx !== 0 || dy !== 0);

        // --- 2. Interaction Detection ---
        let closest = null;
        let minDist = INTERACTION_DIST;
        const playerCenter = { x: player.x + player.w / 2, y: player.y + player.h / 2 };

        stations.forEach(s => {
            const sCenter = { x: s.x + s.w / 2, y: s.y + s.h / 2 };
            const d = getDistance(playerCenter, sCenter);
            if (d < minDist) {
                minDist = d;
                closest = s;
            }
        });
        const activeStation = closest ? closest.id : null;

        // --- 3. Action Logic ---
        if (controls.action && !lastActionRef.current && activeStation) {
            const sIdx = stations.findIndex(s => s.id === activeStation);
            const station = stations[sIdx];

            // A. PLAYER EMPTY HANDED -> PICK UP / INTERACT
            if (!player.holding) {
                if (station.type === 'crate') {
                    player.holding = { ...station.data };
                } else if (station.type === 'prep') {
                    if (station.content) {
                        player.holding = station.content;
                        station.content = null;
                        message = "Got the Pizza!";
                    } else {
                        // Enter Prep Mode
                        if (station.inventory && station.inventory.length > 0) {
                            setViewMode('PREP');
                        } else {
                            message = "Bring ingredients first!";
                        }
                    }
                } else if (station.content) {
                    // Pick up whatever is there
                    player.holding = station.content;
                    station.content = null;
                    message = "Hot Pizza!";
                }
            }
            // B. PLAYER HOLDING SOMETHING -> INTERACT/DROP
            else {
                if (station.type === 'prep') {
                    if (station.content) {
                        message = "Prep Table Full!";
                    } else {
                        if (!station.inventory) station.inventory = [];
                        station.inventory.push(player.holding);
                        message = `Added ${player.holding.symbol}`;
                        player.holding = null;
                    }
                } else if (station.type === 'oven') {
                    if (!station.content && player.holding.id === 'pizza' && player.holding.state === 'raw') {
                        // Put in oven
                        station.content = player.holding;
                        player.holding = null;

                        // START OVEN GAME
                        setViewMode('OVEN');
                    } else {
                        message = "Only Raw Pizza!";
                    }
                } else if (station.type === 'serve') {
                    if (player.holding.id === 'pizza') { // Any pizza triggers dining logic check
                        // START DINING/SCORING
                        setViewMode('DINING');
                    }
                } else if (station.type === 'crate') {
                    player.holding = null; // Trash
                }
            }
        }
        lastActionRef.current = controls.action;

        // Loop Update
        setGameState({
            player,
            stations: stations.map(s => ({ ...s })),
            activeStation,
            message
        });
    });

    return (
        <div
            ref={gameContainerRef}
            tabIndex="0"
            style={{
                position: 'relative',
                width: GAME_WIDTH,
                height: GAME_HEIGHT,
                background: '#222',
                border: '4px solid var(--neon-pink)',
                margin: '0 auto',
                overflow: 'hidden',
                imageRendering: 'pixelated',
                color: 'white',
                fontFamily: '"Press Start 2P", cursive',
                outline: 'none'
            }}
        >
            {viewMode === 'KITCHEN' && (
                <>
                    {/* Floor */}
                    <div style={{
                        position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                        backgroundSize: '40px 40px',
                        backgroundImage: 'linear-gradient(to right, #333 1px, transparent 1px), linear-gradient(to bottom, #333 1px, transparent 1px)',
                        opacity: 0.5
                    }} />

                    {/* Stations */}
                    {gameState.stations.map(station => (
                        <Station
                            key={station.id}
                            {...station}
                            highlight={gameState.activeStation === station.id}
                        />
                    ))}

                    {/* Player */}
                    <ChefSprite
                        x={gameState.player.x}
                        y={gameState.player.y}
                        direction={gameState.player.direction}
                        isWalking={gameState.player.isWalking}
                        holding={gameState.player.holding}
                        avatarConfig={avatarConfig}
                    />

                    {/* UI Overlay */}
                    <div style={{ position: 'absolute', top: 10, left: 10, textShadow: '1px 1px 0 black' }}>
                        <div style={{ fontSize: '1.2em', color: 'var(--neon-green)' }}>{gameState.message}</div>
                    </div>

                    {/* Recipe Selector */}
                    {!currentRecipe && (
                        <RecipeSelector onSelect={handleRecipeSelect} />
                    )}

                    {/* Start Screen */}
                    {currentRecipe && !isGameStarted && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                            background: 'rgba(0,0,0,0.8)',
                            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                            zIndex: 2000
                        }}>
                            <h2 style={{ color: 'var(--neon-yellow)', marginBottom: '20px', textShadow: '2px 2px var(--neon-purple)' }}>
                                TIME TO COOK: {currentRecipe.name.toUpperCase()}
                            </h2>
                            <p style={{ color: '#aaa', marginBottom: '30px' }}>Use Arrow Keys/WASD to Move<br />Spacebar/Enter to Interact</p>
                            <button
                                onClick={handleStartGame}
                                style={{
                                    padding: '15px 40px',
                                    fontSize: '1.5em',
                                    background: 'var(--neon-green)',
                                    color: 'black',
                                    border: 'none',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    boxShadow: '0 0 10px var(--neon-green)',
                                    transform: 'uppercase'
                                }}
                            >
                                START COOKING
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* PREP VIEW */}
            {viewMode === 'PREP' && (
                <PrepView
                    gatheredIngredients={
                        gameState.stations.find(s => s.type === 'prep')?.inventory || []
                    }
                    recipe={currentRecipe}
                    onComplete={handlePrepComplete}
                />
            )}

            {/* OVEN VIEW */}
            {viewMode === 'OVEN' && (
                <OvenView
                    initialPizza={gameState.stations.find(s => s.type === 'oven')?.content}
                    onComplete={handleOvenComplete}
                />
            )}

            {/* DINING VIEW */}
            {viewMode === 'DINING' && (
                <DiningView
                    pizza={gameState.player.holding}
                    recipe={currentRecipe}
                    onNext={handleDiningComplete}
                    avatarConfig={avatarConfig}
                />
            )}
        </div>
    );
};



return KitchenGame;
})();

const PizzaGame = (() => {

// Re-defining ingredients locally for mapping, enabling lookup by ID
const INGREDIENTS_DB = {
    'cheese': { id: 'cheese', name: 'Mozzarella', color: '#FFFACD', symbol: '🧀' },
    'pepperoni': { id: 'pepperoni', name: 'Pepperoni', color: '#FF4444', symbol: '🔴' },
    'basil': { id: 'basil', name: 'Fresh Basil', color: '#39ff14', symbol: '🌿' },
    'mushroom': { id: 'mushroom', name: 'Mushroom', color: '#D2B48C', symbol: '🍄' },
    'pineapple': { id: 'pineapple', name: 'Pineapple', color: '#FFFF00', symbol: '🍍' },
    'jalapeno': { id: 'jalapeno', name: 'Jalapeno', color: '#006400', symbol: '🌶️' },
    'marshmallow': { id: 'marshmallow', name: 'Marshmallow', color: '#FFFFFF', symbol: '☁️' },
    'dough': { id: 'dough', name: 'Dough', symbol: '🍘' },
    'sauce': { id: 'sauce', name: 'Tomato Sauce', symbol: '🍅' }
};

const PizzaGame = () => {
    /* returning chefs skip the avatar editor — their chef is remembered */
    const savedAvatar = (() => {
        try { return JSON.parse(localStorage.getItem('hyperpizza_avatar')); } catch (e) { return null; }
    })();
    const [gameState, setGameState] = useState(savedAvatar ? 'MENU' : 'AVATAR'); // AVATAR, MENU, ARCADE, CRITIC
    const [avatarConfig, setAvatarConfig] = useState(savedAvatar);
    const [finalPizza, setFinalPizza] = useState(null);
    const [selectedRecipe, setSelectedRecipe] = useState(null);

    const handleAvatarComplete = (config) => {
        playPowerUp();
        setAvatarConfig(config);
        try { localStorage.setItem('hyperpizza_avatar', JSON.stringify(config)); } catch (e) { /* private mode */ }
        setGameState('MENU'); // Go to Menu instead of Arcades
    };

    const handleRecipeSelect = (recipe) => {
        playClick();
        setSelectedRecipe(recipe);
        setGameState('ARCADE');
    };

    const handleGameComplete = (pizza) => {
        // Pizza object from KitchenGame: { state: 'cooked', toppings: ['cheese', 'pep'] }

        // Map topping IDs back to full objects for the Critic
        // If the recipe is generated, we might need a dynamic mapper?
        // Actually, KitchenGame spawns crates with data. If ingredients are standard, mapping works.
        // If they are new, we should rely on the object passed back? 
        // For now, let's keep the mapping logic but relax it?
        // Actually, KitchenGame passes `toppings` as IDs. 
        // We need to ensure INGREDIENTS_DB has the new items?
        // OR: KitchenGame should probably pass full objects if possible?
        // Let's stick to existing logic for now, but if ID is not in DB, use a fallback from the recipe list?

        let mappedToppings = [];
        if (selectedRecipe) {
            // Try to map from recipe ingredients first (dynamic source of truth)
            mappedToppings = (pizza.toppings || []).map(idOrObj => {
                // If it's an object already, great
                if (typeof idOrObj === 'object') return idOrObj;
                // Try DB
                if (INGREDIENTS_DB[idOrObj]) return INGREDIENTS_DB[idOrObj];
                // Try Recipe
                const fromRecipe = selectedRecipe.ingredients.find(i => i.id === idOrObj);
                if (fromRecipe) return fromRecipe;

                return { id: idOrObj, name: idOrObj, symbol: '?' };
            });
        } else {
            mappedToppings = (pizza.toppings || []).map(id => INGREDIENTS_DB[id] || { id, name: id, symbol: '?' });
        }


        setFinalPizza({ ...pizza, toppings: mappedToppings });
        setGameState('CRITIC');
    };

    const resetGame = () => {
        playClick();
        setFinalPizza(null);
        setSelectedRecipe(null);
        setGameState('MENU');
    };

    return (
        <div style={{ textAlign: 'center', padding: '2rem 1rem' }}>
            <h2 className="text-neon-green" style={{ marginBottom: '1rem', fontSize: '2rem' }}>
                8-BIT <span className="text-neon-pink">PIZZA LAB</span>
            </h2>

            {gameState === 'AVATAR' && (
                <AvatarEditor onComplete={handleAvatarComplete} />
            )}

            {gameState === 'MENU' && (
                <div>
                    <MenuSystem onSelectRecipe={handleRecipeSelect} />
                    <button
                        onClick={() => { playClick(); setGameState('AVATAR'); }}
                        className="btn"
                        style={{ marginTop: '1rem', fontSize: '0.55rem', padding: '0.6rem 1rem', opacity: 0.75 }}
                    >← NEW CHEF</button>
                </div>
            )}

            {gameState === 'ARCADE' && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ marginBottom: '1rem', color: '#aaa', fontSize: '0.9rem' }}>
                        WASD/Arrows to Move • SPACE to Interact • Serve at Bottom Right
                    </div>
                    <KitchenGame
                        avatarConfig={avatarConfig}
                        onGameComplete={handleGameComplete}
                        initialRecipe={selectedRecipe}
                    />
                </div>
            )}

            {gameState === 'CRITIC' && finalPizza && (
                <div style={{ width: '100%', maxWidth: '500px', margin: '0 auto' }}>
                    <PizzaCritic
                        toppings={finalPizza.toppings}
                        stars={finalPizza.stars}
                        onRestart={resetGame}
                        avatarConfig={avatarConfig}
                    />
                </div>
            )}
        </div>
    );
};



return PizzaGame;
})();

export default PizzaGame;
