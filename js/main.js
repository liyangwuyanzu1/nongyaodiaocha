/**
 * 全局主控制逻辑
 */
const Dashboard = {
    timer: null,

    init() {
        // 1. 初始化各模块
        MapModule.init('main-map');
        ChartsModule.init();

        // 2. 初始化时间筛选器
        this.initTimeFilter();

        // 2.5 初始化农药筛选器
        this.initPesticideFilters();

        // 3. 初始化 Tab 切换
        this.initTabs();

        // 4. 启动自动轮播
        this.startChartActionCarousel();
        this.startMapCarousel();

        // 5. 启动时钟
        this.startTime();

        // 6. 绑定全局窗口调整事件
        this.bindResizeEvent();
    },

    // 绑定全局窗口调整事件
    bindResizeEvent() {
        window.addEventListener('resize', () => {
            // 调整地图大小
            if (MapModule.chart) {
                MapModule.chart.resize();
            }
            // 调整所有业务图表大小
            Object.values(ChartsModule.instances).forEach(chart => {
                if (chart) {
                    chart.resize();
                }
            });
        });
    },

    // 初始化时间筛选器
    initTimeFilter() {
        // 初始化 Flatpickr
        const picker = flatpickr("#date-range-picker", {
            mode: "range",
            dateFormat: "Y-m-d",
            theme: "dark",
            onClose: (selectedDates) => {
                if (selectedDates.length === 2) {
                    console.log('自定义时间范围已选择:', selectedDates);
                    this.updateAllData('custom');
                    $('.filter-btn').removeClass('active');
                }
            }
        });

        // 按钮点击事件
        $('.filter-btn').on('click', (e) => {
            const $btn = $(e.currentTarget);
            const range = $btn.data('range');
            $('.filter-btn').removeClass('active');
            $btn.addClass('active');
            picker.clear(); // 清除自定义选择
            console.log('时间维度切换:', range);
            this.updateAllData(range);
        });
    },

    // 初始化农药筛选器
    initPesticideFilters() {
        const $mapSelect = $('#map-pesticide-filter');
        const $trendSelect = $('#trend-pesticide-filter');
        
        MockData.pesticides.forEach(p => {
            $mapSelect.append(`<option value="${p.name}">${p.name}</option>`);
            $trendSelect.append(`<option value="${p.name}">${p.name}</option>`);
        });

        // 绑定地图农药筛选事件
        $mapSelect.on('change', (e) => {
            const val = $(e.target).val();
            console.log('地图农药筛选:', val);
            const currentMap = MapModule.chart.getOption().geo[0].map;
            MapModule.refreshCurrentMap(currentMap);
        });

        // 绑定趋势图农药筛选事件
        $trendSelect.on('change', (e) => {
            const val = $(e.target).val();
            console.log('趋势图农药筛选:', val);
            this.refreshTrendData(val);
        });
    },

    // 刷新趋势图数据
    refreshTrendData(pesticideName) {
        const trendChart = ChartsModule.instances.trend;
        if (!trendChart) return;

        // 模拟不同农药的趋势数据差异
        const multiplier = pesticideName === 'all' ? 1 : (0.2 + (pesticideName.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0) % 10) / 20);
        
        const option = trendChart.getOption();
        option.series[0].data = MockData.trend.usage.map(v => Math.round(v * multiplier));
        option.series[1].data = MockData.trend.lastYearUsage.map(v => Math.round(v * multiplier));
        
        trendChart.setOption(option);
    },

    // 初始化 Tab 切换
    initTabs() {
        // 原有 tab-btn 逻辑
        $('.tab-btn').on('click', (e) => {
            const $btn = $(e.currentTarget);
            const tabId = $btn.data('tab');
            
            // 切换按钮状态
            $btn.siblings().removeClass('active');
            $btn.addClass('active');

            // 切换内容显示
            const $content = $btn.closest('.tabbed-chart').find('.tab-content');
            
            $content.find('.chart-container').removeClass('active');
            $(`#${tabId}-pie`).addClass('active');

            // 触发 ECharts 重绘，防止布局错乱
            if (ChartsModule.instances[tabId]) {
                ChartsModule.instances[tabId].resize();
            }
        });

        // 新增 mini-tab-btn 逻辑 (TOP10 模块)
        $('.mini-tab-btn').on('click', (e) => {
            const $btn = $(e.currentTarget);
            const tabId = $btn.data('tab');
            
            // 切换按钮状态
            $btn.siblings().removeClass('active');
            $btn.addClass('active');

            // 更新动态标题
            const $title = $('#top10-title');
            if (tabId === 'crop') {
                $title.text('作物农药使用量 TOP10');
            } else {
                $title.text('农药使用量 TOP10');
            }

            // 重新初始化图表数据
            ChartsModule.initCropUsageBar(tabId);
        });
    },

    // 自动轮播逻辑
    initCarousel() {
        // 1. Tab 切换轮播 (农药使用结构分析)
        this.startTabCarousel();
        
        // 2. ECharts 自动高亮/提示轮播
        this.startChartActionCarousel();

        // 3. 地图区域自动轮播
        this.startMapCarousel();
    },

    // Tab 轮播
    startTabCarousel() {
        const tabs = ['category', 'toxicity', 'formulation'];
        let currentIndex = 0;
        const interval = 5000; // 5秒切换一次

        setInterval(() => {
            // 如果用户正在操作，或者鼠标悬停在容器上，可以考虑暂停（这里简化处理）
            currentIndex = (currentIndex + 1) % tabs.length;
            const tabId = tabs[currentIndex];
            $(`.tab-btn[data-tab="${tabId}"]`).trigger('click');
        }, interval);
    },

    // ECharts 动作轮播 (自动显示提示框)
    startChartActionCarousel() {
        const chartKeys = ['trend', 'resistance', 'environment', 'pest', 'crops'];
        const intervals = {};

        chartKeys.forEach(key => {
            const chart = ChartsModule.instances[key];
            if (!chart) return;

            let dataIndex = -1;
            
            intervals[key] = setInterval(() => {
                const dataLen = this.getChartDataLen(key);
                dataIndex = (dataIndex + 1) % dataLen;
                
                // 触发 showTip 动作
                chart.dispatchAction({
                    type: 'showTip',
                    seriesIndex: 0,
                    dataIndex: dataIndex
                });
                
                // 同时也触发 highlight 动作
                chart.dispatchAction({
                    type: 'highlight',
                    seriesIndex: 0,
                    dataIndex: dataIndex
                });
                
                // 延迟取消高亮，模拟移动效果
                setTimeout(() => {
                    chart.dispatchAction({
                        type: 'downplay',
                        seriesIndex: 0,
                        dataIndex: dataIndex
                    });
                }, 2500);
                
            }, 4000); // 4秒切换一个数据点
        });
    },

    // 地图轮播
    startMapCarousel() {
        setInterval(() => {
            const chart = MapModule.chart;
            if (!chart) return;
            
            const option = chart.getOption();
            if (!option || !option.series || !option.series[0] || !option.series[0].data) return;
            
            const data = option.series[0].data;
            const dataLen = data.length;
            
            // 使用 Dashboard 自己的计数器或从闭包获取
            if (this.mapCarouselIndex === undefined) this.mapCarouselIndex = -1;
            this.mapCarouselIndex = (this.mapCarouselIndex + 1) % dataLen;
            
            chart.dispatchAction({
                type: 'showTip',
                seriesIndex: 0,
                dataIndex: this.mapCarouselIndex
            });
            
            chart.dispatchAction({
                type: 'highlight',
                seriesIndex: 0,
                dataIndex: this.mapCarouselIndex
            });
            
            setTimeout(() => {
                chart.dispatchAction({
                    type: 'downplay',
                    seriesIndex: 0,
                    dataIndex: this.mapCarouselIndex
                });
            }, 4000);
        }, 6000);
    },

    // 辅助方法：获取图表数据长度
    getChartDataLen(key) {
        switch(key) {
            case 'trend': return MockData.trend.months.length;
            case 'resistance': return MockData.resistanceAnalysis.length;
            case 'environment': return MockData.environmentAnalysis.months.length;
            case 'pest': return MockData.pestAnalysis.length;
            case 'crops': return MockData.crops.length;
            default: return 0;
        }
    },

    // 统一更新所有数据
    updateAllData(timeRange) {
        console.log(`正在根据时间维度 [${timeRange}] 刷新所有图表数据...`);
        // 模拟数据变动
        this.refreshData();
        // 如果是省级或全国，也可以在这里决定是否重新加载地图数据
        const currentMap = MapModule.chart.getOption().geo[0].map;
        MapModule.refreshCurrentMap(currentMap);
    },

    // 顶部时间显示
    startTime() {
        const updateTime = () => {
            const now = new Date();
            const timeStr = now.getFullYear() + '-' + 
                String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                String(now.getDate()).padStart(2, '0') + ' ' + 
                String(now.getHours()).padStart(2, '0') + ':' + 
                String(now.getMinutes()).padStart(2, '0') + ':' + 
                String(now.getSeconds()).padStart(2, '0');
            $('#current-time').text(timeStr);
        };
        updateTime();
        setInterval(updateTime, 1000);
    },

    // 刷新数据 (模拟)
    refreshData(regionName = '全国') {
        // 使用区域名称作为种子生成一致的随机数
        const seed = regionName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const seededRandom = (val, offset = 0) => {
            const rand = Math.abs(Math.sin(seed + offset));
            return val * (0.8 + rand * 0.4); // 在 80% 到 120% 之间波动
        };
        
        // 1. 更新顶部指标
        const newData = JSON.parse(JSON.stringify(MockData.indicators));
        newData.totalUsage.value = seededRandom(newData.totalUsage.value, 1);
        newData.commodityVolume.value = seededRandom(newData.commodityVolume.value, 2);
        newData.activeIngredient.value = seededRandom(newData.activeIngredient.value, 3);
        newData.usageArea.value = seededRandom(newData.usageArea.value, 4);
        ChartsModule.updateIndicators(newData);

        // 2. 更新趋势图
        const trendChart = ChartsModule.instances.trend;
        if (trendChart) {
            const option = trendChart.getOption();
            option.series[0].data = MockData.trend.usage.map((v, i) => seededRandom(v, i + 10));
            option.series[1].data = MockData.trend.lastYearUsage.map((v, i) => seededRandom(v, i + 20));
            trendChart.setOption(option);
        }

        // 3. 更新结构分析饼图 (更新 MockData 中的引用并重绘)
        const categories = MockData.categories.map((c, i) => ({ ...c, value: seededRandom(c.value, i + 30) }));
        const toxicity = MockData.toxicity.map((t, i) => ({ ...t, value: seededRandom(t.value, i + 40) }));
        const formulations = MockData.formulations.map((f, i) => ({ ...f, value: seededRandom(f.value, i + 50) }));

        if (ChartsModule.instances.category) ChartsModule.instances.category.setOption({ series: [{ data: categories }] });
        if (ChartsModule.instances.toxicity) ChartsModule.instances.toxicity.setOption({ series: [{ data: toxicity }] });
        if (ChartsModule.instances.formulation) ChartsModule.instances.formulation.setOption({ series: [{ data: formulations }] });

        // 4. 更新 TOP10 (根据当前选中的 tab 重新初始化并传入模拟数据)
        const activeTop10Tab = $('.mini-tab-btn.active').data('tab') || 'crop';
        const rawTopData = activeTop10Tab === 'crop' ? MockData.crops : MockData.pesticides;
        const regionTopData = rawTopData.map((d, i) => ({ ...d, value: seededRandom(d.value, i + 55) }));
        ChartsModule.initCropUsageBar(activeTop10Tab, regionTopData);

        // 5. 更新关联分析图表
        if (ChartsModule.instances.resistance) {
            const resData = MockData.resistanceAnalysis.map((d, i) => [
                seededRandom(d[0], i + 60), 
                seededRandom(d[1], i + 70), 
                d[2], 
                d[3]
            ]);
            ChartsModule.instances.resistance.setOption({ series: [{ data: resData }] });
        }

        if (ChartsModule.instances.environment) {
            const envData = MockData.environmentAnalysis;
            const envUsage = envData.usage.map((v, i) => seededRandom(v, i + 80));
            ChartsModule.instances.environment.setOption({ series: [{ data: envUsage }] });
        }

        if (ChartsModule.instances.pest) {
            const pestData = MockData.pestAnalysis.map((d, i) => [
                seededRandom(d[0], i + 90), 
                seededRandom(d[1], i + 100), 
                seededRandom(d[2], i + 110), 
                d[3]
            ]);
            ChartsModule.instances.pest.setOption({ series: [{ data: pestData }] });
        }
    },

    // 绑定事件
    bindEvents() {
        // 弹窗关闭
        $('.close-btn').on('click', () => {
            $('#station-modal').fadeOut();
        });

        // 点击外部关闭弹窗
        $(window).on('click', (event) => {
            if ($(event.target).is('#station-modal')) {
                $('#station-modal').fadeOut();
            }
        });
    },

    // 联动更新图表 (当地图下钻时调用)
    updateCharts(regionName) {
        console.log(`联动更新数据: ${regionName}`);
        this.refreshData(regionName);
    },

    // 显示站点详情弹窗
    showStationDetail(station) {
        $('#modal-station-name').text(station.name);
        $('#pest-level').text(station.pestLevel);
        $('#resistance-level').text(station.resistanceLevel);
        
        // 渲染明细表格
        const tbody = $('#usage-detail-table tbody');
        tbody.empty();
        station.usageDetails.forEach(detail => {
            tbody.append(`
                <tr>
                    <td>${detail.name}</td>
                    <td>${detail.amount.toFixed(2)}</td>
                    <td>${detail.count}</td>
                </tr>
            `);
        });

        $('#station-modal').fadeIn();
    }
};

// 页面加载完成后启动
$(document).ready(() => {
    Dashboard.init();
});
