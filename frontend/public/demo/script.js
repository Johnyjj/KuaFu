// 全局变量
let charts = {};

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initCharts();
    initRealTimeUpdates();
    showNotification();
});

// 初始化导航功能
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetPage = item.dataset.page;

            // 更新导航状态
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // 更新页面显示
            pages.forEach(page => {
                page.classList.remove('active');
                if (page.id === targetPage) {
                    page.classList.add('active');
                }
            });

            // 更新页面标题
            const titles = {
                'dashboard': '仪表板',
                'my-tasks': '我的任务',
                'teams': '团队概览',
                'statistics': '数据统计'
            };
            document.getElementById('current-page-title').textContent = titles[targetPage];

            // 如果切换到统计页面，重新绘制图表
            if (targetPage === 'statistics') {
                setTimeout(() => {
                    Object.values(charts).forEach(chart => chart.resize());
                }, 100);
            }
        });
    });
}

// 初始化图表
function initCharts() {
    // 任务状态分布图
    const statusCtx = document.getElementById('statusChart');
    if (statusCtx) {
        charts.status = new Chart(statusCtx, {
            type: 'doughnut',
            data: {
                labels: ['已完成', '进行中', '待办', '待审核', '已阻塞'],
                datasets: [{
                    data: [36, 28, 12, 6, 2],
                    backgroundColor: [
                        '#00ff88',
                        '#00d4ff',
                        '#909399',
                        '#ff6b35',
                        '#ff2d95'
                    ],
                    borderColor: '#141829',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#a0aec0',
                            font: {
                                family: 'Rajdhani',
                                size: 13
                            },
                            padding: 15
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1a1f35',
                        titleColor: '#ffffff',
                        bodyColor: '#a0aec0',
                        borderColor: '#00d4ff',
                        borderWidth: 1,
                        padding: 12,
                        displayColors: true,
                        callbacks: {
                            label: function(context) {
                                let label = context.label || '';
                                let value = context.parsed || 0;
                                let total = context.dataset.data.reduce((a, b) => a + b, 0);
                                let percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });
    }

    // 各组任务分布图
    const groupCtx = document.getElementById('groupChart');
    if (groupCtx) {
        charts.group = new Chart(groupCtx, {
            type: 'bar',
            data: {
                labels: ['前端组', '后端组', '测试组', '运维组'],
                datasets: [{
                    label: '总任务',
                    data: [23, 18, 15, 12],
                    backgroundColor: 'rgba(79, 70, 229, 0.85)',
                    borderColor: '#4338ca',
                    borderWidth: 2,
                    borderRadius: 6
                }, {
                    label: '已完成',
                    data: [12, 8, 9, 7],
                    backgroundColor: 'rgba(245, 158, 11, 0.85)',
                    borderColor: '#d97706',
                    borderWidth: 2,
                    borderRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                family: 'Inter',
                                size: 12
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#64748b',
                            font: {
                                family: 'Inter',
                                size: 12,
                                weight: 500
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#64748b',
                            font: {
                                family: 'Inter',
                                size: 13,
                                weight: 500
                            },
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'rectRounded'
                        }
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                        titleColor: '#ffffff',
                        bodyColor: '#cbd5e1',
                        borderColor: '#4338ca',
                        borderWidth: 1,
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: true
                    }
                }
            }
        });
    }

    // 闭环率趋势图
    const trendCtx = document.getElementById('trendChart');
    if (trendCtx) {
        charts.trend = new Chart(trendCtx, {
            type: 'line',
            data: {
                labels: ['12/10', '12/11', '12/12', '12/13', '12/14', '12/15', '12/16'],
                datasets: [{
                    label: '闭环率',
                    data: [85, 87, 88, 89, 90, 91, 92],
                    borderColor: '#00d4ff',
                    backgroundColor: 'rgba(0, 212, 255, 0.1)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    pointBackgroundColor: '#00d4ff',
                    pointBorderColor: '#141829',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: false,
                        min: 80,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#a0aec0',
                            font: {
                                family: 'Rajdhani'
                            },
                            callback: function(value) {
                                return value + '%';
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: '#a0aec0',
                            font: {
                                family: 'Rajdhani'
                            }
                        }
                    }
                },
                plugins: {
                    legend: {
                        labels: {
                            color: '#a0aec0',
                            font: {
                                family: 'Rajdhani',
                                size: 13
                            }
                        }
                    },
                    tooltip: {
                        backgroundColor: '#1a1f35',
                        titleColor: '#ffffff',
                        bodyColor: '#a0aec0',
                        borderColor: '#00d4ff',
                        borderWidth: 1,
                        padding: 12,
                        callbacks: {
                            label: function(context) {
                                return '闭环率: ' + context.parsed.y + '%';
                            }
                        }
                    }
                }
            }
        });
    }

    // 团队小图表 (每个团队的任务状态分布)
    initTeamMiniCharts();
}

// 初始化团队小图表
function initTeamMiniCharts() {
    // 前端组图表
    const frontendCtx = document.getElementById('frontendChart');
    if (frontendCtx) {
        charts.frontend = new Chart(frontendCtx, {
            type: 'doughnut',
            data: {
                labels: ['已完成', '进行中', '待办'],
                datasets: [{
                    data: [12, 9, 2],
                    backgroundColor: [
                        '#10b981',
                        '#3b82f6',
                        '#94a3b8'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '65%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed;
                            }
                        }
                    }
                }
            }
        });
    }

    // 后端组图表
    const backendCtx = document.getElementById('backendChart');
    if (backendCtx) {
        charts.backend = new Chart(backendCtx, {
            type: 'doughnut',
            data: {
                labels: ['已完成', '进行中', '待办'],
                datasets: [{
                    data: [8, 8, 2],
                    backgroundColor: [
                        '#10b981',
                        '#3b82f6',
                        '#94a3b8'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '65%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed;
                            }
                        }
                    }
                }
            }
        });
    }

    // 测试组图表
    const testCtx = document.getElementById('testChart');
    if (testCtx) {
        charts.test = new Chart(testCtx, {
            type: 'doughnut',
            data: {
                labels: ['已完成', '进行中', '待办'],
                datasets: [{
                    data: [9, 4, 2],
                    backgroundColor: [
                        '#10b981',
                        '#3b82f6',
                        '#94a3b8'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '65%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed;
                            }
                        }
                    }
                }
            }
        });
    }

    // 运维组图表
    const opsCtx = document.getElementById('opsChart');
    if (opsCtx) {
        charts.ops = new Chart(opsCtx, {
            type: 'doughnut',
            data: {
                labels: ['已完成', '进行中', '待办'],
                datasets: [{
                    data: [7, 3, 2],
                    backgroundColor: [
                        '#10b981',
                        '#3b82f6',
                        '#94a3b8'
                    ],
                    borderWidth: 0
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '65%',
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return context.label + ': ' + context.parsed;
                            }
                        }
                    }
                }
            }
        });
    }
}

// 初始化实时更新功能
function initRealTimeUpdates() {
    // 模拟WebSocket连接
    console.log('WebSocket连接已建立 - 实时同步中');

    // 模拟实时通知
    setTimeout(() => {
        showNotification();
    }, 3000);

    // 模拟任务更新
    setTimeout(() => {
        updateTaskProgress('修复登录Bug', 85);
    }, 5000);
}

// 显示通知
function showNotification() {
    const panel = document.getElementById('notificationPanel');
    panel.classList.add('show');

    setTimeout(() => {
        panel.classList.remove('show');
    }, 5000);
}

// 更新任务进度
function updateTaskProgress(taskName, newProgress) {
    const taskCards = document.querySelectorAll('.task-card');
    taskCards.forEach(card => {
        const title = card.querySelector('h4').textContent;
        if (title === taskName) {
            const progressFill = card.querySelector('.progress-fill');
            const progressText = card.querySelector('.progress-text');

            progressFill.style.width = newProgress + '%';
            progressText.textContent = newProgress + '%';

            // 添加更新动画
            card.style.boxShadow = '0 0 30px rgba(0, 212, 255, 0.5)';
            setTimeout(() => {
                card.style.boxShadow = '';
            }, 1000);
        }
    });

    // 显示通知
    showNotification();
}

// 任务筛选功能
function initTaskFilters() {
    const filterBtns = document.querySelectorAll('.filter-btn');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.textContent.trim();
            const taskCards = document.querySelectorAll('.task-card');

            taskCards.forEach(card => {
                const status = getTaskStatus(card);

                if (filter === '全部' || status === filter) {
                    card.style.display = 'flex';
                    card.style.animation = 'fadeIn 0.5s';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });
}

// 获取任务状态
function getTaskStatus(card) {
    const progressText = card.querySelector('.progress-text').textContent;
    if (progressText === '100%') return '已完成';
    if (progressText === '0%') return '待办';
    return '进行中';
}

// 日期筛选功能
function initDateFilter() {
    const dateBtns = document.querySelectorAll('.date-btn');

    dateBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // 更新按钮状态
            dateBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const selectedDate = btn.dataset.date;
            const dateGroups = document.querySelectorAll('.tasks-by-date');

            if (selectedDate === 'all') {
                // 显示所有日期分组
                dateGroups.forEach(group => {
                    group.style.display = 'block';
                });
            } else {
                // 只显示选中的日期分组
                dateGroups.forEach(group => {
                    const groupDate = group.dataset.date;
                    if (groupDate === selectedDate) {
                        group.style.display = 'block';
                    } else {
                        group.style.display = 'none';
                    }
                });
            }
        });
    });
}

// 初始化任务操作
function initTaskActions() {
    const taskActions = document.querySelectorAll('.btn-icon');

    taskActions.forEach(btn => {
        btn.addEventListener('click', () => {
            const action = btn.title;
            console.log(`执行操作: ${action}`);

            // 添加点击动画
            btn.style.transform = 'scale(0.9)';
            setTimeout(() => {
                btn.style.transform = 'scale(1)';
            }, 100);
        });
    });
}

// 新建任务按钮
document.querySelector('.btn-primary').addEventListener('click', () => {
    console.log('打开新建任务对话框');
    // 这里可以添加模态框逻辑
    alert('新建任务功能开发中...');
});

// 通知按钮
document.querySelector('.notifications').addEventListener('click', () => {
    showNotification();
});

// 初始化任务筛选和操作
initTaskFilters();
initDateFilter();
initTaskActions();

// 窗口大小改变时重新调整图表
window.addEventListener('resize', () => {
    Object.values(charts).forEach(chart => {
        if (chart && typeof chart.resize === 'function') {
            chart.resize();
        }
    });
});

// 导出数据功能
function exportData() {
    console.log('导出数据');
    // 这里可以添加导出Excel或PDF的逻辑
    alert('导出功能开发中...');
}

// 图表工具栏功能
function addChartTooltips() {
    // 为图表添加工具提示功能
    Object.values(charts).forEach(chart => {
        if (chart && chart.options) {
            chart.options.interactions = {
                intersect: false,
                mode: 'index'
            };
        }
    });
}

// 初始化工具提示
addChartTooltips();

// 页面性能优化 - 懒加载图表
const observerOptions = {
    threshold: 0.1,
    rootMargin: '50px'
};

const chartObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const canvas = entry.target;
            const chartId = canvas.id;

            if (charts[chartId]) {
                charts[chartId].resize();
            }

            chartObserver.unobserve(canvas);
        }
    });
}, observerOptions);

// 观察所有图表
document.querySelectorAll('canvas').forEach(canvas => {
    chartObserver.observe(canvas);
});

// 模拟实时数据更新
setInterval(() => {
    // 随机更新一个任务的状态
    const taskCards = document.querySelectorAll('.task-card');
    if (taskCards.length > 0) {
        const randomCard = taskCards[Math.floor(Math.random() * taskCards.length)];
        const progressFill = randomCard.querySelector('.progress-fill');
        const progressText = randomCard.querySelector('.progress-text');

        let currentProgress = parseInt(progressText.textContent);
        if (currentProgress < 100) {
            currentProgress = Math.min(100, currentProgress + Math.floor(Math.random() * 5));
            progressFill.style.width = currentProgress + '%';
            progressText.textContent = currentProgress + '%';

            if (currentProgress === 100) {
                progressText.classList.add('success');
                showNotification();
            }
        }
    }
}, 10000); // 每10秒更新一次

console.log('🚀 团队任务追踪系统已启动');
console.log('📊 实时同步已连接');
console.log('✨ 界面加载完成');
