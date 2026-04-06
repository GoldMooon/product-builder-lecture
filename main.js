/**
 * LottoBall Component
 * Displays a single lotto number with dynamic range-based coloring.
 */
class LottoBall extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    static get observedAttributes() {
        return ['number', 'delay'];
    }

    attributeChangedCallback() {
        this.render();
    }

    getRangeClass(num) {
        if (num <= 10) return 'range1';
        if (num <= 20) return 'range2';
        if (num <= 30) return 'range3';
        if (num <= 40) return 'range4';
        return 'range5';
    }

    getRangeColor(num) {
        const colors = {
            range1: '#f59e0b',
            range2: '#3b82f6',
            range3: '#ef4444',
            range4: '#6b7280',
            range5: '#22c55e'
        };
        return colors[this.getRangeClass(num)];
    }

    render() {
        const number = parseInt(this.getAttribute('number') || '0', 10);
        const delay = this.getAttribute('delay') || '0';
        const color = this.getRangeColor(number);

        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: inline-block;
                }
                .ball {
                    width: 58px;
                    height: 58px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.1rem;
                    font-weight: 700;
                    color: #fff;
                    background: ${color};
                    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.18);
                    transform: scale(0.9);
                    opacity: 0;
                    animation: pop 0.35s ease forwards;
                    animation-delay: ${delay}s;
                }
                @keyframes pop {
                    to {
                        transform: scale(1);
                        opacity: 1;
                    }
                }
                @media (max-width: 600px) {
                    .ball {
                        width: 52px;
                        height: 52px;
                        font-size: 1rem;
                    }
                }
            </style>
            <div class="ball">${number}</div>
        `;
    }
}

/**
 * LottoGenerator Component
 * Manages the UI and logic for generating multiple sets of lotto numbers.
 */
class LottoGenerator extends HTMLElement {
    constructor() {
        super();
        this.history = [];
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
        // Initial generation
        this.pickNumbers();
    }

    setupEventListeners() {
        const pickBtn = this.querySelector('#pickBtn');
        if (pickBtn) {
            pickBtn.addEventListener('click', () => this.pickNumbers());
        }
        
        const clearBtn = this.querySelector('#clearBtn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => this.clearHistory());
        }
    }

    clearHistory() {
        if (confirm('모든 추천 기록을 삭제하시겠습니까?')) {
            this.history = [];
            this.renderHistory();
        }
    }

    generateMainNumbers() {
        const selected = new Set();
        while (selected.size < 6) {
            selected.add(Math.floor(Math.random() * 45) + 1);
        }
        return [...selected].sort((a, b) => a - b);
    }

    generateBonusNumber(mainNumbers) {
        let bonus;
        do {
            bonus = Math.floor(Math.random() * 45) + 1;
        } while (mainNumbers.includes(bonus));
        return bonus;
    }

    pickNumbers() {
        const setCountEl = this.querySelector('#setCount');
        const includeBonusEl = this.querySelector('#includeBonus');
        
        const count = setCountEl ? Number(setCountEl.value) : 5;
        const includeBonus = includeBonusEl ? includeBonusEl.checked : false;

        const results = Array.from({ length: count }, () => {
            const main = this.generateMainNumbers();
            return {
                main,
                bonus: includeBonus ? this.generateBonusNumber(main) : null,
            };
        });

        this.history.unshift({ count, includeBonus, results, timestamp: new Date() });
        this.renderResults(results, includeBonus);
        this.renderHistory();
    }

    renderResults(results, includeBonus) {
        const resultGrid = this.querySelector('#resultGrid');
        if (!resultGrid) return;

        resultGrid.innerHTML = '';

        results.forEach((item, idx) => {
            const card = document.createElement('article');
            card.className = 'result-card';

            const title = document.createElement('h3');
            title.className = 'result-title';
            title.textContent = `${idx + 1}번째 추천 번호`;
            card.appendChild(title);

            const numberWrap = document.createElement('div');
            numberWrap.className = 'numbers';

            item.main.forEach((num, index) => {
                const ball = document.createElement('lotto-ball');
                ball.setAttribute('number', num);
                ball.setAttribute('delay', index * 0.06);
                numberWrap.appendChild(ball);
            });

            if (includeBonus) {
                const bonusLabel = document.createElement('span');
                bonusLabel.className = 'bonus-label';
                bonusLabel.textContent = '+ 보너스';
                numberWrap.appendChild(bonusLabel);

                const bonusBall = document.createElement('lotto-ball');
                bonusBall.setAttribute('number', item.bonus);
                bonusBall.setAttribute('delay', (item.main.length + 1) * 0.06);
                numberWrap.appendChild(bonusBall);
            }

            card.appendChild(numberWrap);
            resultGrid.appendChild(card);
        });
    }

    renderHistory() {
        const historyList = this.querySelector('#historyList');
        if (!historyList) return;

        historyList.innerHTML = '';

        if (this.history.length === 0) {
            historyList.innerHTML = '<li class="empty-text">아직 추천 기록이 없습니다.</li>';
            return;
        }

        this.history.slice(0, 5).forEach((entry, index) => {
            const li = document.createElement('li');
            const title = `<strong>${index + 1}. ${entry.count}세트 추천</strong>`;
            const bonusText = entry.includeBonus ? " (보너스 포함)" : "";
            
            const lines = entry.results
                .map((result, idx) => {
                    const base = result.main.join(' / ');
                    const line = entry.includeBonus ? `${base} + 보너스 ${result.bonus}` : base;
                    return `세트 ${idx + 1}: ${line}`;
                })
                .join('<br />');

            li.innerHTML = `${title}${bonusText}<br />${lines}`;
            historyList.appendChild(li);
        });
    }

    render() {
        // We assume the light DOM already has the necessary structure from index.html
        // If it was empty, we could populate it here, but we'll respect the user's HTML.
    }
}

/**
 * GenderClassifier Component
 * Uses Teachable Machine to classify gender from webcam feed.
 */
class GenderClassifier extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.model = null;
        this.webcam = null;
        this.labelContainer = null;
        this.maxPredictions = 0;
        this.isModelLoaded = false;
        this.isStreaming = false;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.shadowRoot.querySelector('#startBtn').addEventListener('click', () => this.init());
    }

    async init() {
        const startBtn = this.shadowRoot.querySelector('#startBtn');
        startBtn.disabled = true;
        startBtn.textContent = '모델 로딩 중...';

        const URL = "https://teachablemachine.withgoogle.com/models/ZJ-iabh4p/";
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";

        try {
            this.model = await tmImage.load(modelURL, metadataURL);
            this.maxPredictions = this.model.getTotalClasses();

            const flip = true;
            this.webcam = new tmImage.Webcam(300, 300, flip);
            await this.webcam.setup();
            await this.webcam.play();

            this.isModelLoaded = true;
            this.isStreaming = true;
            
            this.shadowRoot.querySelector('#webcam-container').innerHTML = '';
            this.shadowRoot.querySelector('#webcam-container').appendChild(this.webcam.canvas);
            
            startBtn.style.display = 'none';
            this.shadowRoot.querySelector('.result-area').style.display = 'block';

            window.requestAnimationFrame(() => this.loop());
        } catch (error) {
            console.error(error);
            alert('카메라 권한을 확인해 주세요.');
            startBtn.disabled = false;
            startBtn.textContent = '다시 시작하기';
        }
    }

    async loop() {
        this.webcam.update();
        await this.predict();
        if (this.isStreaming) {
            window.requestAnimationFrame(() => this.loop());
        }
    }

    async predict() {
        const prediction = await this.model.predict(this.webcam.canvas);
        const bars = this.shadowRoot.querySelectorAll('.progress-bar');
        
        prediction.forEach((p, i) => {
            const percentage = (p.probability * 100).toFixed(1);
            const bar = this.shadowRoot.querySelector(`.bar-${p.className.toLowerCase()}`);
            const text = this.shadowRoot.querySelector(`.text-${p.className.toLowerCase()}`);
            
            if (bar) bar.style.width = `${percentage}%`;
            if (text) text.textContent = `${p.className}: ${percentage}%`;
        });
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host {
                    display: block;
                    width: 100%;
                }
                .container {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 20px;
                    padding: 20px;
                    background: rgba(255, 255, 255, 0.5);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                }
                #webcam-container {
                    width: 300px;
                    height: 300px;
                    background: #e2e8f0;
                    border-radius: 16px;
                    overflow: hidden;
                    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                }
                #webcam-container canvas {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }
                .placeholder-icon {
                    font-size: 3rem;
                    color: #94a3b8;
                }
                .btn-start {
                    padding: 12px 24px;
                    font-size: 1rem;
                    font-weight: 700;
                    color: white;
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    border: none;
                    border-radius: 12px;
                    cursor: pointer;
                    transition: transform 0.2s, box-shadow 0.2s;
                }
                .btn-start:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 10px 20px rgba(37, 99, 235, 0.3);
                }
                .btn-start:disabled {
                    opacity: 0.7;
                    cursor: not-allowed;
                    transform: none;
                }
                .result-area {
                    width: 100%;
                    max-width: 300px;
                    display: none;
                }
                .class-result {
                    margin-bottom: 12px;
                }
                .label-text {
                    font-size: 0.9rem;
                    font-weight: 700;
                    color: #1e293b;
                    margin-bottom: 6px;
                    display: flex;
                    justify-content: space-between;
                }
                .progress-bg {
                    width: 100%;
                    height: 10px;
                    background: #f1f5f9;
                    border-radius: 999px;
                    overflow: hidden;
                }
                .progress-bar {
                    height: 100%;
                    border-radius: 999px;
                    transition: width 0.2s ease;
                }
                .bar-male {
                    background: linear-gradient(90deg, #3b82f6, #60a5fa);
                }
                .bar-female {
                    background: linear-gradient(90deg, #ec4899, #f472b6);
                }
            </style>
            <div class="container">
                <div id="webcam-container">
                    <div class="placeholder-icon">📷</div>
                </div>
                <button class="btn-start" id="startBtn">AI 테스트 시작하기</button>
                <div class="result-area">
                    <div class="class-result">
                        <div class="label-text text-male">Male: 0%</div>
                        <div class="progress-bg">
                            <div class="progress-bar bar-male" style="width: 0%"></div>
                        </div>
                    </div>
                    <div class="class-result">
                        <div class="label-text text-female">Female: 0%</div>
                        <div class="progress-bg">
                            <div class="progress-bar bar-female" style="width: 0%"></div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

// Register Custom Elements
customElements.define('lotto-ball', LottoBall);
customElements.define('lotto-generator', LottoGenerator);
customElements.define('gender-classifier', GenderClassifier);
