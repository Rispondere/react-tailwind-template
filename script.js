/**
 * キャスト収入プランシミュレーター - JavaScript
 * 機能: リアルタイム計算、グラフ表示、データ保存など
 */

// グローバル変数
let incomeChart = null;
let savingsChart = null;
let pieChart = null;

// DOM読み込み完了時の初期化
document.addEventListener('DOMContentLoaded', function() {
    console.log('キャスト収入プランシミュレーター開始');
    
    // イベントリスナーを設定
    setupEventListeners();
    
    // 初期計算実行
    calculateResults();
    
    // グラフ初期化
    initCharts();
    
    // スライダーの初期値設定
    updateSliderValue();
});

/**
 * イベントリスナーの設定
 */
function setupEventListeners() {
    const inputIds = ['dailyCount', 'pricePerService', 'workDays', 'monthlyTarget', 'savingsTarget', 'targetPeriod', 'livingExpenses'];
    
    inputIds.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.addEventListener('input', function() {
                // スライダーの場合は表示値も更新
                if (id === 'workDays') {
                    updateSliderValue();
                }
                
                // 計算とグラフを更新
                calculateResults();
                updateCharts();
            });
            
            // リアルタイム更新のためのイベント
            element.addEventListener('change', function() {
                calculateResults();
                updateCharts();
            });
        }
    });

    // ボタンイベント
    const shareBtn = document.querySelector('[onclick="shareResults()"]');
    const saveBtn = document.querySelector('[onclick="saveResults()"]');
    const printBtn = document.querySelector('[onclick="printResults()"]');
    
    if (shareBtn) shareBtn.addEventListener('click', shareResults);
    if (saveBtn) saveBtn.addEventListener('click', saveResults);
    if (printBtn) printBtn.addEventListener('click', printResults);
}

/**
 * スライダー値の表示更新
 */
function updateSliderValue() {
    const workDaysSlider = document.getElementById('workDays');
    const workDaysValue = document.getElementById('workDaysValue');
    
    if (workDaysSlider && workDaysValue) {
        workDaysValue.textContent = workDaysSlider.value + '日';
    }
}

/**
 * メイン計算処理
 */
function calculateResults() {
    try {
        // 入力値を取得
        const inputs = getInputValues();
        
        // 計算実行
        const results = performCalculations(inputs);
        
        // 表示を更新
        updateDisplay(inputs, results);
        
        console.log('計算完了:', results);
    } catch (error) {
        console.error('計算エラー:', error);
        showError('計算中にエラーが発生しました');
    }
}

/**
 * 入力値の取得
 */
function getInputValues() {
    return {
        dailyCount: parseInt(document.getElementById('dailyCount')?.value) || 0,
        pricePerService: parseInt(document.getElementById('pricePerService')?.value) || 0,
        workDays: parseInt(document.getElementById('workDays')?.value) || 0,
        monthlyTarget: parseInt(document.getElementById('monthlyTarget')?.value) || 0,
        savingsTarget: parseInt(document.getElementById('savingsTarget')?.value) || 0,
        targetPeriod: parseInt(document.getElementById('targetPeriod')?.value) || 12,
        livingExpenses: parseInt(document.getElementById('livingExpenses')?.value) || 0
    };
}

/**
 * 計算の実行
 */
function performCalculations(inputs) {
    const monthlyIncome = inputs.dailyCount * inputs.pricePerService * inputs.workDays;
    const yearlyIncome = monthlyIncome * 12;
    const targetDifference = monthlyIncome - inputs.monthlyTarget;
    const neededServices = Math.max(0, Math.ceil((inputs.monthlyTarget - monthlyIncome) / inputs.pricePerService));
    const disposableIncome = monthlyIncome - inputs.livingExpenses;
    const actualSavings = Math.max(0, disposableIncome);
    const savingsMonths = actualSavings > 0 ? Math.ceil(inputs.savingsTarget / actualSavings) : 0;
    const achievementRate = inputs.monthlyTarget > 0 ? (monthlyIncome / inputs.monthlyTarget) * 100 : 0;
    
    return {
        monthlyIncome,
        yearlyIncome,
        targetDifference,
        neededServices,
        savingsMonths,
        achievementRate,
        disposableIncome,
        actualSavings
    };
}

/**
 * 表示の更新
 */
function updateDisplay(inputs, results) {
    // 月収表示
    updateIncomeDisplay(inputs, results);
    
    // 目標との差額
    updateTargetDifference(results);
    
    // 達成率
    updateAchievementRate(results);
    
    // レベル情報
    updateLevelInfo(results.monthlyIncome);
    
    // モチベーションメッセージ
    updateMotivationMessage(results.achievementRate);
    
    // 貯金情報
    updateSavingsInfo(inputs, results);
    
    // 年収表示
    updateYearlyIncome(results);
}

/**
 * 月収表示の更新
 */
function updateIncomeDisplay(inputs, results) {
    const monthlyIncomeEl = document.getElementById('monthlyIncome');
    const incomeBreakdownEl = document.getElementById('incomeBreakdown');
    
    if (monthlyIncomeEl) {
        monthlyIncomeEl.textContent = '¥' + results.monthlyIncome.toLocaleString();
        
        // カウントアップアニメーション
        animateNumber(monthlyIncomeEl, results.monthlyIncome);
    }
    
    if (incomeBreakdownEl) {
        incomeBreakdownEl.textContent = 
            `${inputs.dailyCount}本 × ¥${inputs.pricePerService.toLocaleString()} × ${inputs.workDays}日`;
    }
}

/**
 * 目標との差額更新
 */
function updateTargetDifference(results) {
    const diffElement = document.getElementById('targetDifference');
    const alertBox = document.getElementById('alertBox');
    const alertText = document.getElementById('alertText');
    
    if (diffElement) {
        if (results.targetDifference >= 0) {
            diffElement.textContent = '+¥' + results.targetDifference.toLocaleString();
            diffElement.className = 'stat-value positive';
            if (alertBox) alertBox.style.display = 'none';
        } else {
            diffElement.textContent = '-¥' + Math.abs(results.targetDifference).toLocaleString();
            diffElement.className = 'stat-value negative';
            if (alertBox) {
                alertBox.style.display = 'block';
                if (alertText) {
                    alertText.textContent = `💡 目標達成まであと${results.neededServices}本必要です！`;
                }
            }
        }
    }
}

/**
 * 達成率の更新
 */
function updateAchievementRate(results) {
    const achievementRateEl = document.getElementById('achievementRate');
    const progressFill = document.getElementById('progressFill');
    const progressText = document.getElementById('progressText');
    
    if (achievementRateEl) {
        achievementRateEl.textContent = results.achievementRate.toFixed(1) + '%';
    }
    
    if (progressFill) {
        const progressWidth = Math.min(results.achievementRate, 100);
        progressFill.style.width = progressWidth + '%';
        
        if (progressText) {
            if (results.achievementRate >= 10) {
                progressText.textContent = results.achievementRate.toFixed(0) + '%';
            } else {
                progressText.textContent = '';
            }
        }
    }
}

/**
 * レベル情報の更新
 */
function updateLevelInfo(monthlyIncome) {
    const levelIcon = document.getElementById('levelIcon');
    const levelName = document.getElementById('levelName');
    
    const levelInfo = getLevelInfo(monthlyIncome);
    
    if (levelIcon) {
        levelIcon.textContent = levelInfo.icon;
    }
    
    if (levelName) {
        levelName.textContent = levelInfo.level + 'ランク';
        levelName.style.color = levelInfo.color;
    }
}

/**
 * レベル情報の取得
 */
function getLevelInfo(monthlyIncome) {
    if (monthlyIncome >= 1600000) {
        return { level: 'プラチナ', color: '#8b5cf6', icon: '👑' };
    } else if (monthlyIncome >= 1200000) {
        return { level: 'ゴールド', color: '#f59e0b', icon: '⭐' };
    } else if (monthlyIncome >= 800000) {
        return { level: 'シルバー', color: '#6b7280', icon: '💎' };
    } else {
        return { level: 'ブロンズ', color: '#f97316', icon: '🔥' };
    }
}

/**
 * モチベーションメッセージの更新
 */
function updateMotivationMessage(achievementRate) {
    const motivationText = document.getElementById('motivationText');
    
    if (motivationText) {
        let message;
        
        if (achievementRate >= 100) {
            message = '🎉 目標達成！素晴らしいペースです！';
        } else if (achievementRate >= 80) {
            message = '💪 あと少しで目標達成！頑張って！';
        } else if (achievementRate >= 60) {
            message = '📈 良いペースです！継続していきましょう';
        } else {
            message = '🚀 まだまだ伸びしろがあります！一緒に頑張りましょう';
        }
        
        motivationText.textContent = message;
    }
}

/**
 * 貯金情報の更新
 */
function updateSavingsInfo(inputs, results) {
    const savingsMonthsEl = document.getElementById('savingsMonths');
    const annualSavingsEl = document.getElementById('annualSavings');
    const savingsProgress = document.getElementById('savingsProgress');
    const disposableIncomeEl = document.getElementById('disposableIncome');
    const actualSavingsEl = document.getElementById('actualSavings');
    
    if (savingsMonthsEl) {
        savingsMonthsEl.textContent = results.savingsMonths > 0 ? results.savingsMonths + 'ヶ月' : '要見直し';
    }
    
    if (annualSavingsEl) {
        annualSavingsEl.textContent = '¥' + (results.actualSavings * 12).toLocaleString();
    }
    
    if (disposableIncomeEl) {
        disposableIncomeEl.textContent = '¥' + results.disposableIncome.toLocaleString();
        disposableIncomeEl.className = results.disposableIncome >= 0 ? 'stat-value positive' : 'stat-value negative';
    }
    
    if (actualSavingsEl) {
        actualSavingsEl.textContent = '¥' + results.actualSavings.toLocaleString();
    }
    
    if (savingsProgress && inputs.savingsTarget > 0) {
        const progressPercentage = Math.min((results.actualSavings * 12 / inputs.savingsTarget) * 100, 100);
        savingsProgress.style.width = Math.max(progressPercentage, 0) + '%';
    }
}

/**
 * 年収表示の更新
 */
function updateYearlyIncome(results) {
    const yearlyIncomeEl = document.getElementById('yearlyIncome');
    const fiveYearSavingsEl = document.getElementById('fiveYearSavings');
    
    if (yearlyIncomeEl) {
        yearlyIncomeEl.textContent = '¥' + results.yearlyIncome.toLocaleString();
    }
    
    if (fiveYearSavingsEl) {
        fiveYearSavingsEl.textContent = '¥' + (results.yearlyIncome * 5).toLocaleString();
    }
}

/**
 * 数値のカウントアップアニメーション
 */
function animateNumber(element, targetValue) {
    const duration = 1000; // 1秒
    const startValue = 0;
    const startTime = Date.now();
    
    function update() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // イージング関数（ease-out）
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentValue = Math.round(startValue + (targetValue - startValue) * easeOut);
        
        element.textContent = '¥' + currentValue.toLocaleString();
        
        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }
    
    requestAnimationFrame(update);
}

/**
 * グラフの初期化
 */
function initCharts() {
    try {
        initIncomeChart();
        initSavingsChart();
        initPieChart();
        console.log('グラフ初期化完了');
    } catch (error) {
        console.error('グラフ初期化エラー:', error);
    }
}

/**
 * 年間収入推移チャートの初期化
 */
function initIncomeChart() {
    const ctx = document.getElementById('incomeChart');
    if (!ctx) return;
    
    const inputs = getInputValues();
    const results = performCalculations(inputs);
    
    incomeChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
            datasets: [{
                label: '予想収入',
                data: Array(12).fill(results.monthlyIncome),
                backgroundColor: '#f59e0b',
                borderColor: '#d97706',
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false
            }, {
                label: '目標金額',
                data: Array(12).fill(inputs.monthlyTarget),
                backgroundColor: 'rgba(239, 68, 68, 0.7)',
                borderColor: '#dc2626',
                borderWidth: 1,
                borderRadius: 4,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: '#f59e0b',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return context.dataset.label + ': ¥' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '¥' + (value / 10000).toFixed(0) + '万';
                        },
                        font: {
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

/**
 * 貯金推移チャートの初期化
 */
function initSavingsChart() {
    const ctx = document.getElementById('savingsChart');
    if (!ctx) return;
    
    const inputs = getInputValues();
    const results = performCalculations(inputs);
    
    savingsChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['1年目', '2年目', '3年目', '4年目', '5年目'],
            datasets: [{
                label: '累積貯金',
                data: [
                    results.yearlyIncome,
                    results.yearlyIncome * 2,
                    results.yearlyIncome * 3,
                    results.yearlyIncome * 4,
                    results.yearlyIncome * 5
                ],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: '#10b981',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 3
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500,
                easing: 'easeOutQuart'
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    borderColor: '#10b981',
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            return '累積貯金: ¥' + context.parsed.y.toLocaleString();
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(0, 0, 0, 0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return '¥' + (value / 10000).toFixed(0) + '万';
                        },
                        font: {
                            size: 11
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            size: 11
                        }
                    }
                }
            }
        }
    });
}

/**
 * 円グラフの初期化（収入内訳）
 */
function initPieChart() {
    const ctx = document.getElementById('pieChart');
    if (!ctx) return;
    
    const workStyleData = [
        { name: '本指名', value: 40, color: '#f59e0b' },
        { name: '新規', value: 35, color: '#ef4444' },
        { name: 'フリー', value: 15, color: '#10b981' },
        { name: 'イベント', value: 10, color: '#8b5cf6' }
    ];
    
    pieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: workStyleData.map(item => item.name),
            datasets: [{
                data: workStyleData.map(item => item.value),
                backgroundColor: workStyleData.map(item => item.color),
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverBorderWidth: 3,
                hoverOffset: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            animation: {
                duration: 1500,
                easing: 'easeOutBounce'
            },
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        usePointStyle: true,
                        padding: 15,
                        font: {
                            size: 12
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleColor: 'white',
                    bodyColor: 'white',
                    callbacks: {
                        label: function(context) {
                            return context.label + ': ' + context.parsed + '%';
                        }
                    }
                }
            }
        }
    });
}

/**
 * グラフの更新
 */
function updateCharts() {
    try {
        updateIncomeChart();
        updateSavingsChart();
        console.log('グラフ更新完了');
    } catch (error) {
        console.error('グラフ更新エラー:', error);
    }
}

/**
 * 年間収入チャートの更新
 */
function updateIncomeChart() {
    if (!incomeChart) return;
    
    const inputs = getInputValues();
    const results = performCalculations(inputs);
    
    incomeChart.data.datasets[0].data = Array(12).fill(results.monthlyIncome);
    incomeChart.data.datasets[1].data = Array(12).fill(inputs.monthlyTarget);
    incomeChart.update('active');
}

/**
 * 貯金推移チャートの更新
 */
function updateSavingsChart() {
    if (!savingsChart) return;
    
    const inputs = getInputValues();
    const results = performCalculations(inputs);
    
    savingsChart.data.datasets[0].data = [
        results.yearlyIncome,
        results.yearlyIncome * 2,
        results.yearlyIncome * 3,
        results.yearlyIncome * 4,
        results.yearlyIncome * 5
    ];
    savingsChart.update('active');
}

/**
 * 結果の共有（改良版）
 */
function shareResults() {
    try {
        const inputs = getInputValues();
        const results = performCalculations(inputs);
        const levelInfo = getLevelInfo(results.monthlyIncome);
        
        // 詳細な共有テキストを作成
        const shareData = createShareData(inputs, results, levelInfo);
        
        // モバイル対応の共有
        if (navigator.share && isMobileDevice()) {
            mobileShare(shareData);
        } else {
            // デスクトップ版の共有オプション
            showShareModal(shareData);
        }
    } catch (error) {
        console.error('共有エラー:', error);
        showError('共有に失敗しました');
    }
}

/**
 * 共有データの作成
 */
function createShareData(inputs, results, levelInfo) {
    const currentDate = new Date().toLocaleDateString('ja-JP');
    
    return {
        title: 'キャスト収入シミュレーション結果',
        text: `💰 キャスト収入シミュレーション結果
📅 ${currentDate}

【基本設定】
🔢 1日平均本数: ${inputs.dailyCount}本
💰 バック額: ¥${inputs.pricePerService.toLocaleString()}
📅 出勤日数: ${inputs.workDays}日/月
🎯 目標金額: ¥${inputs.monthlyTarget.toLocaleString()}
🏠 生活費: ¥${inputs.livingExpenses.toLocaleString()}

【結果】
💵 予想月収: ¥${results.monthlyIncome.toLocaleString()}
📈 達成率: ${results.achievementRate.toFixed(1)}%
🏆 ランク: ${levelInfo.level} ${levelInfo.icon}
💰 貯金可能額: ¥${results.actualSavings.toLocaleString()}/月
⏰ 貯金目標まで: ${results.savingsMonths}ヶ月

【年間予測】
📊 年収: ¥${results.yearlyIncome.toLocaleString()}
💰 年間貯金: ¥${(results.actualSavings * 12).toLocaleString()}

#キャスト収入シミュレーター #収入管理 #目標達成`,
        url: window.location.href,
        data: {
            inputs,
            results,
            levelInfo,
            timestamp: new Date().toISOString()
        }
    };
}

/**
 * モバイルデバイス判定
 */
function isMobileDevice() {
    return /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

/**
 * モバイル共有
 */
function mobileShare(shareData) {
    navigator.share({
        title: shareData.title,
        text: shareData.text,
        url: shareData.url
    }).then(() => {
        showNotification('共有しました！', 'success');
    }).catch(err => {
        console.log('共有キャンセル:', err);
        showShareModal(shareData);
    });
}

/**
 * 共有モーダルの表示
 */
function showShareModal(shareData) {
    const modal = createModal();
    const content = document.createElement('div');
    content.className = 'share-modal-content';
    
    content.innerHTML = `
        <h3 style="margin-bottom: 1rem; color: #1f2937;">📱 結果を共有</h3>
        
        <div class="share-options">
            <button class="share-btn share-copy" onclick="copyToClipboard('${escapeHtml(shareData.text)}')">
                📋 テキストをコピー
            </button>
            
            <button class="share-btn share-line" onclick="shareToLine('${escapeHtml(shareData.text)}')">
                💬 LINEで共有
            </button>
            
            <button class="share-btn share-twitter" onclick="shareToTwitter('${escapeHtml(shareData.text)}')">
                🐦 Twitterで共有
            </button>
            
            <button class="share-btn share-url" onclick="copyUrlWithParams()">
                🔗 URLをコピー
            </button>
        </div>
        
        <div class="share-preview">
            <h4>プレビュー:</h4>
            <textarea readonly style="width: 100%; height: 200px; padding: 0.5rem; border: 1px solid #ddd; border-radius: 0.5rem; font-size: 0.9rem;">${shareData.text}</textarea>
        </div>
        
        <button class="btn btn-purple" onclick="closeModal()" style="margin-top: 1rem; width: 100%;">
            閉じる
        </button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

/**
 * データ保存（改良版 - 複数形式対応）
 */
function saveResults() {
    const modal = createModal();
    const content = document.createElement('div');
    content.className = 'save-modal-content';
    
    content.innerHTML = `
        <h3 style="margin-bottom: 1rem; color: #1f2937;">💾 データ保存</h3>
        
        <div class="save-options">
            <button class="save-btn save-pdf" onclick="saveToPDF()">
                📄 PDFで保存
            </button>
            
            <button class="save-btn save-image" onclick="saveAsImage()">
                🖼️ 画像で保存
            </button>
            
            <button class="save-btn save-excel" onclick="saveToExcel()">
                📊 Excelで保存
            </button>
            
            <button class="save-btn save-json" onclick="saveAsJSON()">
                💾 データファイル(JSON)
            </button>
            
            <button class="save-btn save-txt" onclick="saveAsText()">
                📝 テキストファイル
            </button>
        </div>
        
        <button class="btn btn-purple" onclick="closeModal()" style="margin-top: 1rem; width: 100%;">
            閉じる
        </button>
    `;
    
    modal.appendChild(content);
    document.body.appendChild(modal);
}

/**
 * PDFで保存
 */
function saveToPDF() {
    try {
        const inputs = getInputValues();
        const results = performCalculations(inputs);
        const levelInfo = getLevelInfo(results.monthlyIncome);
        
        // 印刷用のスタイルを適用
        const printContent = createPrintableContent(inputs, results, levelInfo);
        
        // 新しいウィンドウで開いて印刷
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>収入シミュレーション結果</title>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; margin: 20px; color: #333; }
                    .header { text-align: center; margin-bottom: 30px; }
                    .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; }
                    .section h3 { color: #f59e0b; margin-top: 0; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
                    .item { padding: 8px; background: #f8f9fa; border-radius: 4px; }
                    .highlight { background: #fef3c7; font-weight: bold; }
                    @media print {
                        body { margin: 0; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                ${printContent}
                <div class="no-print" style="text-align: center; margin-top: 20px;">
                    <button onclick="window.print()" style="padding: 10px 20px; background: #f59e0b; color: white; border: none; border-radius: 5px; cursor: pointer;">PDFで保存</button>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        
        closeModal();
        showNotification('PDF保存用ウィンドウを開きました', 'success');
    } catch (error) {
        console.error('PDF保存エラー:', error);
        showError('PDF保存に失敗しました');
    }
}

/**
 * 印刷可能なコンテンツの作成
 */
function createPrintableContent(inputs, results, levelInfo) {
    const currentDate = new Date().toLocaleDateString('ja-JP');
    
    return `
        <div class="header">
            <h1>💰 キャスト収入シミュレーション結果</h1>
            <p>作成日: ${currentDate}</p>
        </div>
        
        <div class="section">
            <h3>📊 基本設定</h3>
            <div class="grid">
                <div class="item">1日平均本数: ${inputs.dailyCount}本</div>
                <div class="item">バック額: ¥${inputs.pricePerService.toLocaleString()}</div>
                <div class="item">出勤日数: ${inputs.workDays}日/月</div>
                <div class="item">目標金額: ¥${inputs.monthlyTarget.toLocaleString()}</div>
                <div class="item">生活費: ¥${inputs.livingExpenses.toLocaleString()}</div>
                <div class="item">貯金目標: ¥${inputs.savingsTarget.toLocaleString()}</div>
            </div>
        </div>
        
        <div class="section">
            <h3>💵 収入結果</h3>
            <div class="grid">
                <div class="item highlight">予想月収: ¥${results.monthlyIncome.toLocaleString()}</div>
                <div class="item highlight">達成率: ${results.achievementRate.toFixed(1)}%</div>
                <div class="item">ランク: ${levelInfo.level}</div>
                <div class="item">生活費差引後: ¥${results.disposableIncome.toLocaleString()}</div>
                <div class="item">月間貯金可能額: ¥${results.actualSavings.toLocaleString()}</div>
                <div class="item">貯金目標まで: ${results.savingsMonths}ヶ月</div>
            </div>
        </div>
        
        <div class="section">
            <h3>📈 年間予測</h3>
            <div class="grid">
                <div class="item highlight">年収: ¥${results.yearlyIncome.toLocaleString()}</div>
                <div class="item highlight">年間貯金: ¥${(results.actualSavings * 12).toLocaleString()}</div>
                <div class="item">5年後貯金: ¥${(results.actualSavings * 60).toLocaleString()}</div>
                <div class="item">目標達成まで: ${results.savingsMonths}ヶ月</div>
            </div>
        </div>
        
        <div class="section">
            <h3>🎯 アドバイス</h3>
            <ul>
                <li>写メ日記を毎日更新して認知度UP</li>
                <li>オキニトークで距離を縮める</li>
                <li>キテネで来店を促進する</li>
                <li>本指名のお客様を大切にする</li>
                <li>出勤日数を安定させる</li>
            </ul>
        </div>
    `;
}

/**
 * 画像として保存
 */
function saveAsImage() {
    try {
        // Canvas要素を作成してチャートを含むスクリーンショットを作成
        html2canvas(document.body, {
            scale: 2,
            useCORS: true,
            scrollX: 0,
            scrollY: 0
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = `income_simulation_${new Date().toISOString().split('T')[0]}.png`;
            link.href = canvas.toDataURL();
            link.click();
            
            showNotification('画像として保存しました！', 'success');
        });
        
        closeModal();
    } catch (error) {
        console.error('画像保存エラー:', error);
        // html2canvasが利用できない場合のフォールバック
        window.print();
        showNotification('印刷画面を開きました（画像保存の代替）', 'info');
    }
}

/**
 * Excelファイルとして保存
 */
function saveToExcel() {
    try {
        const inputs = getInputValues();
        const results = performCalculations(inputs);
        const levelInfo = getLevelInfo(results.monthlyIncome);
        
        // CSV形式で保存（Excelで開ける）
        const csvContent = createCSVContent(inputs, results, levelInfo);
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `income_simulation_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        
        closeModal();
        showNotification('Excelファイルとして保存しました！', 'success');
    } catch (error) {
        console.error('Excel保存エラー:', error);
        showError('Excel保存に失敗しました');
    }
}

/**
 * CSV形式のコンテンツ作成
 */
function createCSVContent(inputs, results, levelInfo) {
    const currentDate = new Date().toLocaleDateString('ja-JP');
    
    return `キャスト収入シミュレーション結果,${currentDate}

基本設定
項目,値
1日平均本数,${inputs.dailyCount}本
バック額,${inputs.pricePerService}円
出勤日数,${inputs.workDays}日/月
目標金額,${inputs.monthlyTarget}円
生活費,${inputs.livingExpenses}円
貯金目標,${inputs.savingsTarget}円

結果
項目,値
予想月収,${results.monthlyIncome}円
達成率,${results.achievementRate.toFixed(1)}%
ランク,${levelInfo.level}
生活費差引後,${results.disposableIncome}円
月間貯金可能額,${results.actualSavings}円
貯金目標まで,${results.savingsMonths}ヶ月

年間予測
項目,値
年収,${results.yearlyIncome}円
年間貯金,${results.actualSavings * 12}円
5年後貯金,${results.actualSavings * 60}円`;
}

/**
 * テキストファイルとして保存
 */
function saveAsText() {
    try {
        const shareData = createShareData(getInputValues(), performCalculations(getInputValues()), getLevelInfo(performCalculations(getInputValues()).monthlyIncome));
        
        const blob = new Blob([shareData.text], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `income_simulation_${new Date().toISOString().split('T')[0]}.txt`;
        link.click();
        
        closeModal();
        showNotification('テキストファイルとして保存しました！', 'success');
    } catch (error) {
        console.error('テキスト保存エラー:', error);
        showError('テキスト保存に失敗しました');
    }
}

/**
 * JSONファイルとして保存（既存の機能を改良）
 */
function saveAsJSON() {
    try {
        const inputs = getInputValues();
        const results = performCalculations(inputs);
        
        const data = {
            version: '2.0',
            timestamp: new Date().toISOString(),
            inputs: inputs,
            results: {
                monthlyIncome: results.monthlyIncome,
                yearlyIncome: results.yearlyIncome,
                targetDifference: results.targetDifference,
                neededServices: results.neededServices,
                savingsMonths: results.savingsMonths,
                achievementRate: results.achievementRate,
                disposableIncome: results.disposableIncome,
                actualSavings: results.actualSavings,
                levelInfo: getLevelInfo(results.monthlyIncome)
            },
            calculations: {
                breakdown: `${inputs.dailyCount}本 × ¥${inputs.pricePerService.toLocaleString()} × ${inputs.workDays}日`,
                fiveYearSavings: results.actualSavings * 60
            }
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { 
            type: 'application/json' 
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `income_simulation_${new Date().toISOString().split('T')[0]}.json`;
        
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        closeModal();
        showNotification('データファイルを保存しました！', 'success');
    } catch (error) {
        console.error('JSON保存エラー:', error);
        showError('データ保存に失敗しました');
    }
}

/**
 * 共有用ヘルパー関数
 */
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showNotification('クリップボードにコピーしました！', 'success');
        closeModal();
    }).catch(() => {
        showError('コピーに失敗しました');
    });
}

function shareToLine(text) {
    const encodedText = encodeURIComponent(text);
    window.open(`https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(window.location.href)}&text=${encodedText}`, '_blank');
    closeModal();
}

function shareToTwitter(text) {
    const encodedText = encodeURIComponent(text);
    window.open(`https://twitter.com/intent/tweet?text=${encodedText}&url=${encodeURIComponent(window.location.href)}`, '_blank');
    closeModal();
}

function copyUrlWithParams() {
    updateURL();
    navigator.clipboard.writeText(window.location.href).then(() => {
        showNotification('設定付きURLをコピーしました！', 'success');
        closeModal();
    }).catch(() => {
        showError('URLコピーに失敗しました');
    });
}

function escapeHtml(text) {
    return text.replace(/'/g, "\\'").replace(/"/g, '\\"');
}

/**
 * モーダル作成ヘルパー
 */
function createModal() {
    const modal = document.createElement('div');
    modal.className = 'modal-overlay';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 1000;
        animation: fadeIn 0.3s ease;
    `;
    
    modal.onclick = (e) => {
        if (e.target === modal) closeModal();
    };
    
    return modal;
}

function closeModal() {
    const modal = document.querySelector('.modal-overlay');
    if (modal) {
        document.body.removeChild(modal);
    }
}

/**
 * 印刷処理
 */
function printResults() {
    try {
        // 印刷前にグラフを再描画（印刷用に最適化）
        if (incomeChart) incomeChart.resize();
        if (savingsChart) savingsChart.resize();
        if (pieChart) pieChart.resize();
        
        window.print();
        console.log('印刷開始');
    } catch (error) {
        console.error('印刷エラー:', error);
        showError('印刷に失敗しました');
    }
}

/**
 * 通知の表示
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        font-weight: 600;
        z-index: 1000;
        animation: slideInRight 0.3s ease;
        max-width: 300px;
    `;
    
    switch (type) {
        case 'success':
            notification.style.background = '#10b981';
            break;
        case 'error':
            notification.style.background = '#ef4444';
            break;
        default:
            notification.style.background = '#3b82f6';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 3000);
}

/**
 * エラーの表示
 */
function showError(message) {
    showNotification(message, 'error');
}

/**
 * 入力値の検証
 */
function validateInputs(inputs) {
    const errors = [];
    
    if (inputs.dailyCount <= 0) {
        errors.push('1日の平均本数は1以上で入力してください');
    }
    
    if (inputs.pricePerService <= 0) {
        errors.push('1本あたりのバック額は1円以上で入力してください');
    }
    
    if (inputs.workDays <= 0) {
        errors.push('月の出勤日数は1日以上で入力してください');
    }
    
    if (inputs.monthlyTarget <= 0) {
        errors.push('月の目標金額は1円以上で入力してください');
    }
    
    if (inputs.savingsTarget <= 0) {
        errors.push('貯金目標は1円以上で入力してください');
    }
    
    return errors;
}

/**
 * データの読み込み（保存されたJSONファイルから）
 */
function loadData(file) {
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const data = JSON.parse(e.target.result);
            
            // 入力値を復元
            if (data.inputs) {
                Object.keys(data.inputs).forEach(key => {
                    const element = document.getElementById(key);
                    if (element) {
                        element.value = data.inputs[key];
                    }
                });
                
                // スライダー値の表示更新
                updateSliderValue();
                
                // 計算とグラフを更新
                calculateResults();
                updateCharts();
                
                showNotification('データを読み込みました！', 'success');
            }
        } catch (error) {
            console.error('データ読み込みエラー:', error);
            showError('データの読み込みに失敗しました');
        }
    };
    reader.readAsText(file);
}

/**
 * ローカルストレージに設定を保存
 */
function saveSettings() {
    try {
        const inputs = getInputValues();
        localStorage.setItem('incomeSimulatorSettings', JSON.stringify(inputs));
        console.log('設定を保存しました');
    } catch (error) {
        console.error('設定保存エラー:', error);
    }
}

/**
 * ローカルストレージから設定を読み込み
 */
function loadSettings() {
    try {
        const savedSettings = localStorage.getItem('incomeSimulatorSettings');
        if (savedSettings) {
            const inputs = JSON.parse(savedSettings);
            
            Object.keys(inputs).forEach(key => {
                const element = document.getElementById(key);
                if (element && inputs[key] !== undefined) {
                    element.value = inputs[key];
                }
            });
            
            updateSliderValue();
            console.log('設定を読み込みました');
            return true;
        }
    } catch (error) {
        console.error('設定読み込みエラー:', error);
    }
    return false;
}

/**
 * 設定のリセット
 */
function resetSettings() {
    if (confirm('設定をリセットしますか？')) {
        // デフォルト値に戻す
        document.getElementById('dailyCount').value = 3;
        document.getElementById('pricePerService').value = 12000;
        document.getElementById('workDays').value = 15;
        document.getElementById('monthlyTarget').value = 500000;
        document.getElementById('savingsTarget').value = 3000000;
        document.getElementById('targetPeriod').value = 12;
        document.getElementById('livingExpenses').value = 200000;
        
        updateSliderValue();
        calculateResults();
        updateCharts();
        
        // ローカルストレージからも削除
        localStorage.removeItem('incomeSimulatorSettings');
        
        showNotification('設定をリセットしました', 'info');
    }
}

/**
 * URLパラメータから設定を読み込み
 */
function loadFromURL() {
    const params = new URLSearchParams(window.location.search);
    let hasParams = false;
    
    const paramMap = {
        'daily': 'dailyCount',
        'price': 'pricePerService',
        'days': 'workDays',
        'target': 'monthlyTarget',
        'savings': 'savingsTarget',
        'period': 'targetPeriod',
        'expenses': 'livingExpenses'
    };
    
    Object.keys(paramMap).forEach(paramKey => {
        const value = params.get(paramKey);
        if (value) {
            const element = document.getElementById(paramMap[paramKey]);
            if (element) {
                element.value = value;
                hasParams = true;
            }
        }
    });
    
    if (hasParams) {
        updateSliderValue();
        calculateResults();
        updateCharts();
        console.log('URLパラメータから設定を読み込みました');
    }
}

/**
 * 現在の設定をURLに反映
 */
function updateURL() {
    const inputs = getInputValues();
    const params = new URLSearchParams();
    
    params.set('daily', inputs.dailyCount);
    params.set('price', inputs.pricePerService);
    params.set('days', inputs.workDays);
    params.set('target', inputs.monthlyTarget);
    params.set('savings', inputs.savingsTarget);
    params.set('period', inputs.targetPeriod);
    params.set('expenses', inputs.livingExpenses);
    
    const newURL = window.location.pathname + '?' + params.toString();
    window.history.replaceState({}, '', newURL);
}

/**
 * 比較モードの切り替え
 */
function toggleComparisonMode() {
    // 未実装: 複数のシナリオを比較する機能
    console.log('比較モード（将来の機能）');
}

/**
 * データの検証とエラーハンドリング
 */
function validateAndCalculate() {
    const inputs = getInputValues();
    const errors = validateInputs(inputs);
    
    if (errors.length > 0) {
        showError(errors[0]);
        return false;
    }
    
    calculateResults();
    return true;
}

/**
 * キーボードショートカットの設定
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Ctrl+S で保存
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            saveResults();
        }
        
        // Ctrl+P で印刷
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            printResults();
        }
        
        // Ctrl+R でリセット
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            resetSettings();
        }
        
        // Ctrl+Shift+S で設定保存
        if (e.ctrlKey && e.shiftKey && e.key === 'S') {
            e.preventDefault();
            saveSettings();
            showNotification('設定を保存しました', 'success');
        }
    });
}

/**
 * タッチデバイスでの操作性向上
 */
function setupTouchSupport() {
    // スライダーのタッチサポート改善
    const slider = document.getElementById('workDays');
    if (slider && 'ontouchstart' in window) {
        slider.addEventListener('touchmove', function(e) {
            e.preventDefault();
            updateSliderValue();
            calculateResults();
            updateCharts();
        });
    }
}

/**
 * パフォーマンス最適化: デバウンス処理
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * 入力変更のデバウンス版
 */
const debouncedCalculate = debounce(() => {
    calculateResults();
    updateCharts();
    saveSettings(); // 自動保存
    updateURL(); // URL更新
}, 300);

/**
 * アクセシビリティの向上
 */
function improveAccessibility() {
    // フォーカス管理
    const inputs = document.querySelectorAll('input, select, button');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.setAttribute('aria-selected', 'true');
        });
        
        input.addEventListener('blur', function() {
            this.removeAttribute('aria-selected');
        });
    });
    
    // スクリーンリーダー対応
    const results = document.querySelectorAll('[id*="monthly"], [id*="achievement"], [id*="level"]');
    results.forEach(result => {
        result.setAttribute('aria-live', 'polite');
        result.setAttribute('aria-atomic', 'true');
    });
}

/**
 * エラー監視とログ
 */
function setupErrorHandling() {
    window.addEventListener('error', function(e) {
        console.error('グローバルエラー:', e.error);
        showError('予期しないエラーが発生しました');
    });
    
    window.addEventListener('unhandledrejection', function(e) {
        console.error('未処理のPromise拒否:', e.reason);
        showError('処理中にエラーが発生しました');
    });
}

/**
 * 初期化の完了処理
 */
function initComplete() {
    // URL パラメータがあれば優先、なければローカルストレージから読み込み
    if (!loadFromURL()) {
        loadSettings();
    }
    
    // キーボードショートカット設定
    setupKeyboardShortcuts();
    
    // タッチサポート設定
    setupTouchSupport();
    
    // アクセシビリティ向上
    improveAccessibility();
    
    // エラーハンドリング設定
    setupErrorHandling();
    
    // デバウンス版の計算を既存のイベントリスナーに適用
    const inputs = ['dailyCount', 'pricePerService', 'workDays', 'monthlyTarget', 'savingsTarget', 'targetPeriod', 'livingExpenses'];
    inputs.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            // 既存のイベントリスナーを削除して、デバウンス版を追加
            element.removeEventListener('input', calculateResults);
            element.addEventListener('input', debouncedCalculate);
        }
    });
    
    console.log('初期化完了 - キャスト収入プランシミュレーター');
    showNotification('シミュレーターが準備完了しました！', 'success');
}

// 初期化完了後に追加の設定を実行
document.addEventListener('DOMContentLoaded', function() {
    // 既存の初期化の後に実行
    setTimeout(initComplete, 100);
});

/**
 * 開発・デバッグ用関数（本番環境では削除可能）
 */
function debugInfo() {
    const inputs = getInputValues();
    const results = performCalculations(inputs);
    
    console.group('Debug Info');
    console.log('Inputs:', inputs);
    console.log('Results:', results);
    console.log('Charts:', { incomeChart, savingsChart, pieChart });
    console.groupEnd();
    
    return { inputs, results };
}

// デバッグ用にグローバルに公開（本番では削除）
window.debugInfo = debugInfo;
