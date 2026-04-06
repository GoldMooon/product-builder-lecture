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
 * Uses Teachable Machine to classify gender from webcam feed or uploaded images.
 */
class GenderClassifier extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.model = null;
        this.webcam = null;
        this.maxPredictions = 0;
        this.isStreaming = false;
    }

    connectedCallback() {
        this.render();
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.shadowRoot.querySelector('#startBtn').addEventListener('click', () => this.initWebcam());
        this.shadowRoot.querySelector('#uploadBtn').addEventListener('click', () => {
            this.shadowRoot.querySelector('#fileInput').click();
        });
        this.shadowRoot.querySelector('#fileInput').addEventListener('change', (e) => this.handleFileUpload(e));
    }

    async loadModel() {
        if (this.model) return;
        const URL = "https://teachablemachine.withgoogle.com/models/ZJ-iabh4p/";
        const modelURL = URL + "model.json";
        const metadataURL = URL + "metadata.json";
        this.model = await tmImage.load(modelURL, metadataURL);
        this.maxPredictions = this.model.getTotalClasses();
    }

    async initWebcam() {
        const startBtn = this.shadowRoot.querySelector('#startBtn');
        const uploadBtn = this.shadowRoot.querySelector('#uploadBtn');
        startBtn.disabled = true;
        uploadBtn.disabled = true;
        startBtn.textContent = '로딩 중...';

        try {
            await this.loadModel();
            
            const flip = true;
            this.webcam = new tmImage.Webcam(300, 300, flip);
            await this.webcam.setup();
            await this.webcam.play();

            this.isStreaming = true;
            
            const container = this.shadowRoot.querySelector('#webcam-container');
            container.innerHTML = '';
            container.appendChild(this.webcam.canvas);
            
            this.renderResultLabels();
            this.shadowRoot.querySelector('.result-area').style.display = 'block';

            startBtn.style.display = 'none';
            uploadBtn.style.display = 'inline-flex';
            uploadBtn.disabled = false;
            uploadBtn.textContent = '이미지 업로드로 전환';

            window.requestAnimationFrame(() => this.loop());
        } catch (error) {
            console.error(error);
            alert('카메라 권한을 확인해 주세요.');
            startBtn.disabled = false;
            uploadBtn.disabled = false;
            startBtn.textContent = '웹캠으로 테스트';
        }
    }

    async handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const uploadBtn = this.shadowRoot.querySelector('#uploadBtn');
        const startBtn = this.shadowRoot.querySelector('#startBtn');
        uploadBtn.disabled = true;
        startBtn.disabled = true;
        const originalText = uploadBtn.textContent;
        uploadBtn.textContent = '분석 중...';

        try {
            await this.loadModel();

            const reader = new FileReader();
            reader.onload = async (e) => {
                const img = new Image();
                img.src = e.target.result;
                img.onload = async () => {
                    this.isStreaming = false;
                    if (this.webcam) {
                        await this.webcam.stop();
                    }

                    const container = this.shadowRoot.querySelector('#webcam-container');
                    container.innerHTML = '';
                    const previewImg = document.createElement('img');
                    previewImg.src = img.src;
                    previewImg.style.width = '100%';
                    previewImg.style.height = '100%';
                    previewImg.style.objectFit = 'cover';
                    container.appendChild(previewImg);

                    this.renderResultLabels();
                    this.shadowRoot.querySelector('.result-area').style.display = 'block';
                    
                    const prediction = await this.model.predict(img);
                    this.updateUI(prediction);

                    uploadBtn.disabled = false;
                    uploadBtn.textContent = '다른 이미지 업로드';
                    startBtn.style.display = 'inline-flex';
                    startBtn.disabled = false;
                    startBtn.textContent = '웹캠으로 테스트';
                };
            };
            reader.readAsDataURL(file);
        } catch (error) {
            console.error(error);
            alert('이미지 분석 중 오류가 발생했습니다.');
            uploadBtn.disabled = false;
            startBtn.disabled = false;
            uploadBtn.textContent = originalText;
        }
    }

    renderResultLabels() {
        const resultArea = this.shadowRoot.querySelector('.result-area');
        resultArea.innerHTML = '';
        for (let i = 0; i < this.maxPredictions; i++) {
            const className = this.model.getClassLabels()[i];
            const item = document.createElement('div');
            item.className = 'class-result';
            item.innerHTML = `
                <div class="label-text" id="label-${i}">${className}: 0%</div>
                <div class="progress-bg">
                    <div class="progress-bar" id="bar-${i}"></div>
                </div>
            `;
            resultArea.appendChild(item);
        }
    }

    async loop() {
        if (!this.isStreaming) return;
        this.webcam.update();
        const prediction = await this.model.predict(this.webcam.canvas);
        this.updateUI(prediction);
        window.requestAnimationFrame(() => this.loop());
    }

    updateUI(prediction) {
        for (let i = 0; i < this.maxPredictions; i++) {
            const p = prediction[i];
            const percentage = (p.probability * 100).toFixed(1);
            const label = this.shadowRoot.querySelector(`#label-${i}`);
            const bar = this.shadowRoot.querySelector(`#bar-${i}`);
            
            if (label) label.textContent = `${p.className}: ${percentage}%`;
            if (bar) {
                bar.style.width = `${percentage}%`;
                const cls = p.className.toLowerCase();
                bar.style.background = cls === 'male' 
                    ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' 
                    : 'linear-gradient(90deg, #ec4899, #f472b6)';
            }
        }
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                :host { display: block; width: 100%; }
                .container {
                    display: flex; flex-direction: column; align-items: center; gap: 24px;
                    padding: 24px; background: rgba(255, 255, 255, 0.5);
                    backdrop-filter: blur(12px); border-radius: 24px;
                    border: 1px solid rgba(255, 255, 255, 0.3);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.05);
                }
                #webcam-container {
                    width: 300px; height: 300px; background: #f1f5f9;
                    border-radius: 20px; overflow: hidden;
                    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.12);
                    display: flex; align-items: center; justify-content: center;
                    position: relative; border: 1px solid #e2e8f0;
                }
                #webcam-container canvas, #webcam-container img {
                    width: 100%; height: 100%; object-fit: cover;
                }
                .placeholder-icon { font-size: 3.5rem; color: #cbd5e1; }
                .button-group {
                    display: flex; gap: 12px; width: 100%;
                    justify-content: center; flex-wrap: wrap;
                }
                .btn {
                    padding: 14px 28px; font-size: 0.95rem; font-weight: 700;
                    color: white; border: none; border-radius: 14px;
                    cursor: pointer; transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                    display: inline-flex; align-items: center; gap: 8px;
                }
                .btn-start {
                    background: linear-gradient(135deg, #2563eb, #3b82f6);
                    box-shadow: 0 8px 20px rgba(37, 99, 235, 0.25);
                }
                .btn-upload {
                    background: linear-gradient(135deg, #7c3aed, #8b5cf6);
                    box-shadow: 0 8px 20px rgba(124, 58, 237, 0.25);
                }
                .btn:hover:not(:disabled) {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.15);
                    filter: brightness(1.1);
                }
                .btn:disabled { opacity: 0.6; cursor: not-allowed; filter: grayscale(0.5); }
                .result-area {
                    width: 100%; max-width: 300px; display: none; margin-top: 10px;
                }
                .class-result { margin-bottom: 16px; }
                .label-text {
                    font-size: 0.9rem; font-weight: 800; color: #1e293b;
                    margin-bottom: 8px; display: flex; justify-content: space-between;
                }
                .progress-bg {
                    width: 100%; height: 12px; background: #f1f5f9;
                    border-radius: 999px; overflow: hidden; border: 1px solid #e2e8f0;
                }
                .progress-bar {
                    height: 100%; border-radius: 999px;
                    transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                }
            </style>
            <div class="container">
                <div id="webcam-container">
                    <div class="placeholder-icon">📷</div>
                </div>
                <div class="button-group">
                    <button class="btn btn-start" id="startBtn">웹캠으로 테스트</button>
                    <button class="btn btn-upload" id="uploadBtn">이미지 업로드</button>
                    <input type="file" id="fileInput" accept="image/*" hidden>
                </div>
                <div class="result-area"></div>
            </div>
        `;
    }
}
}

// Register Custom Elements
customElements.define('lotto-ball', LottoBall);
customElements.define('lotto-generator', LottoGenerator);
customElements.define('gender-classifier', GenderClassifier);
