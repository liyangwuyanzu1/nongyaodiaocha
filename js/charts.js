/**
 * 图表模块逻辑
 */
const ChartsModule = {
    instances: {},
    // 参考图配色方案
    colorPalette: [
        '#4C6EF5', '#40C057', '#FAB005', '#FA5252', '#15AABF', 
        '#7950F2', '#E64980', '#2B8A3E', '#FD7E14', '#228BE6'
    ],

    init() {
        this.initTrendChart();
        this.initCategoryPie();
        this.initToxicityPie();
        this.initFormulationPie();
        this.initCropUsageBar();
        this.initResistanceScatter();
        this.initEnvironmentLine();
        this.initPestBubble();
        this.updateIndicators(MockData.indicators);
    },

    // 统一的提示框样式
    getCommonTooltip() {
        return {
            backgroundColor: 'rgba(11, 15, 45, 0.9)',
            borderColor: '#38bdf8',
            borderWidth: 1,
            padding: [10, 15],
            textStyle: {
                color: '#fff',
                fontSize: 12
            },
            extraCssText: 'box-shadow: 0 0 15px rgba(56, 189, 248, 0.4); border-radius: 8px; backdrop-filter: blur(4px);',
            transitionDuration: 0.5, // 更加平滑的过渡
            confine: true
        };
    },

    // 1. 年度趋势图 (保持不变)
    initTrendChart() {
        const chart = echarts.init(document.getElementById('trend-chart'));
        const option = {
            tooltip: { 
                ...this.getCommonTooltip(),
                trigger: 'axis',
                valueFormatter: (value) => value.toFixed(2) + ' 吨'
            },
            legend: { data: ['今年', '去年'], textStyle: { color: '#a5b4fc' }, bottom: 0 },
            grid: { top: '15%', left: '3%', right: '4%', bottom: '15%', containLabel: true },
            xAxis: {
                type: 'category',
                data: MockData.trend.months,
                axisLine: { lineStyle: { color: '#1e3a8a' } },
                axisLabel: { color: '#a5b4fc' }
            },
            yAxis: {
                type: 'value',
                name: '单位：吨',
                nameTextStyle: { color: '#a5b4fc', fontSize: 10, padding: [0, 0, 10, 0] },
                axisLine: { lineStyle: { color: '#1e3a8a' } },
                axisLabel: { 
                    color: '#a5b4fc',
                    formatter: (value) => value.toFixed(2)
                },
                splitLine: { lineStyle: { color: '#1e3a8a', type: 'dashed' } }
            },
            series: [
                {
                    name: '今年',
                    type: 'line',
                    data: MockData.trend.usage,
                    smooth: true,
                    itemStyle: { color: '#38bdf8' },
                    areaStyle: {
                        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                            { offset: 0, color: 'rgba(56, 189, 248, 0.3)' },
                            { offset: 1, color: 'transparent' }
                        ])
                    }
                },
                {
                    name: '去年',
                    type: 'line',
                    data: MockData.trend.lastYearUsage,
                    smooth: true,
                    itemStyle: { color: '#a5b4fc' },
                    lineStyle: { type: 'dashed' }
                }
            ]
        };
        chart.setOption(option);
        this.instances.trend = chart;
    },

    // 2. 农药品类分布
    initCategoryPie() {
        const chart = echarts.init(document.getElementById('category-pie'));
        chart.setOption(this.getPieOption('农药品类', MockData.categories));
        this.instances.category = chart;
    },

    // 3. 毒性等级分布
    initToxicityPie() {
        const chart = echarts.init(document.getElementById('toxicity-pie'));
        chart.setOption(this.getPieOption('毒性等级', MockData.toxicity));
        this.instances.toxicity = chart;
    },

    // 4. 剂型分布 (已移至 Tab)
    initFormulationPie() {
        const chart = echarts.init(document.getElementById('formulation-pie'));
        const option = this.getPieOption('剂型分布', MockData.formulations);
        option.series[0].roseType = 'area';
        chart.setOption(option);
        this.instances.formulation = chart;
    },

    // 5. 使用量 TOP10
    initCropUsageBar(type = 'crop', filteredData) {
        const chart = echarts.init(document.getElementById('crop-usage-bar'));
        const rawData = filteredData || (type === 'crop' ? MockData.crops : MockData.pesticides);
        const data = [...rawData].sort((a, b) => a.value - b.value);
        const option = {
            tooltip: { 
                ...this.getCommonTooltip(),
                trigger: 'axis', 
                axisPointer: { type: 'shadow' },
                formatter: (params) => {
                    const item = params[0];
                    return `${item.name}<br/>使用量: ${item.value.toFixed(2)} 吨`;
                }
            },
            grid: { top: '10%', left: '3%', right: '20%', bottom: '5%', containLabel: true },
            xAxis: { 
                type: 'value', 
                // 移除模块右下角的“吨”单位标识
                axisLine: { show: false }, 
                splitLine: { show: false }, 
                axisLabel: { show: false } 
            },
            yAxis: {
                type: 'category',
                data: data.map(d => d.name),
                axisLine: { lineStyle: { color: '#1e3a8a' } },
                axisLabel: { color: '#a5b4fc' }
            },
            series: [{
                name: '使用量',
                type: 'bar',
                data: data.map(d => d.value),
                itemStyle: {
                    color: new echarts.graphic.LinearGradient(1, 0, 0, 0, [
                        { offset: 0, color: type === 'crop' ? '#4C6EF5' : '#40C057' },
                        { offset: 1, color: '#1e3a8a' }
                    ]),
                    borderRadius: [0, 4, 4, 0]
                },
                label: { 
                    show: true, 
                    position: 'right', 
                    color: '#a5b4fc',
                    formatter: (params) => params.value.toFixed(2)
                }
            }]
        };
        chart.setOption(option);
        this.instances.crops = chart;
    },

    // 6. 抗药性关联分析 (散点图)
    initResistanceScatter(filteredData) {
        const chart = echarts.init(document.getElementById('resistance-scatter'));
        const data = filteredData || MockData.resistanceAnalysis;
        const option = {
            tooltip: {
                ...this.getCommonTooltip(),
                formatter: (params) => `${params.value[2]} - ${params.value[3]}<br/>使用频率: ${params.value[0].toFixed(2)} 次/季<br/>抗性倍数: ${params.value[1].toFixed(2)} 倍`
            },
            grid: { 
                top: '20%', 
                left: '5%', 
                right: '12%', 
                bottom: '10%',
                containLabel: true 
            },
            xAxis: { 
                name: '频率(次/季)', 
                type: 'value', 
                splitLine: { lineStyle: { color: '#1e3a8a', type: 'dashed' } },
                axisLabel: { color: '#a5b4fc', fontSize: 10 },
                nameTextStyle: { color: '#a5b4fc', fontSize: 10, padding: [0, 0, 0, 5] }
            },
            yAxis: { 
                name: '抗性(倍)', 
                type: 'value', 
                splitLine: { lineStyle: { color: '#1e3a8a', type: 'dashed' } },
                axisLabel: { color: '#a5b4fc', fontSize: 10 },
                nameTextStyle: { color: '#a5b4fc', fontSize: 10, align: 'right', padding: [0, 5, 0, 0] }
            },
            visualMap: {
                show: false,
                min: 0,
                max: 150,
                dimension: 1,
                inRange: { color: ['#4ade80', '#fbbf24', '#f87171'] }
            },
            series: [{
                type: 'scatter',
                data: data,
                symbolSize: 15,
                markArea: {
                    silent: true,
                    itemStyle: { color: 'rgba(248, 113, 113, 0.1)', borderWidth: 1, borderType: 'dashed' },
                    data: [[{
                        name: '高抗-高频聚类区',
                        xAxis: 8,
                        yAxis: 40,
                        label: { position: 'top', color: '#f87171', fontSize: 10 }
                    }, {
                        xAxis: 20,
                        yAxis: 200
                    }]]
                }
            }]
        };
        chart.setOption(option);
        this.instances.resistance = chart;
    },

    // 7. 环境关联分析 (双轴折线图)
    initEnvironmentLine() {
        const chart = echarts.init(document.getElementById('environment-line'));
        const option = {
            tooltip: { 
                ...this.getCommonTooltip(),
                trigger: 'axis',
                formatter: (params) => {
                    let res = params[0].name + '<br/>';
                    params.forEach(item => {
                        const unit = item.seriesName === '用量' ? ' 吨' : (item.seriesName === '温度' ? ' ℃' : ' mm');
                        res += `${item.marker} ${item.seriesName}: ${item.value.toFixed(2)}${unit}<br/>`;
                    });
                    return res;
                }
            },
            legend: { data: ['用量', '温度', '降水'], textStyle: { color: '#a5b4fc', fontSize: 10 }, bottom: 0 },
            grid: { top: '20%', left: '5%', right: '5%', bottom: '15%', containLabel: true },
            xAxis: {
                type: 'category',
                data: MockData.environmentAnalysis.months,
                axisLabel: { color: '#a5b4fc', fontSize: 10 }
            },
            yAxis: [
                { type: 'value', name: '用量(吨)', axisLabel: { color: '#a5b4fc', fontSize: 10 }, nameTextStyle: { color: '#a5b4fc', fontSize: 10 }, splitLine: { show: false } },
                { type: 'value', name: '环境', axisLabel: { color: '#a5b4fc', fontSize: 10 }, nameTextStyle: { color: '#a5b4fc', fontSize: 10 }, splitLine: { lineStyle: { color: '#1e3a8a', type: 'dashed' } } }
            ],
            series: [
                { name: '用量', type: 'bar', data: MockData.environmentAnalysis.usage, itemStyle: { color: 'rgba(56, 189, 248, 0.5)' } },
                { name: '温度', type: 'line', yAxisIndex: 1, data: MockData.environmentAnalysis.temp, smooth: true, itemStyle: { color: '#fbbf24' } },
                { name: '降水', type: 'line', yAxisIndex: 1, data: MockData.environmentAnalysis.precip, smooth: true, itemStyle: { color: '#4ade80' } }
            ]
        };
        chart.setOption(option);
        this.instances.environment = chart;
    },

    // 8. 病虫害关联分析 (气泡图)
    initPestBubble() {
        const chart = echarts.init(document.getElementById('pest-bubble'));
        const option = {
            tooltip: {
                ...this.getCommonTooltip(),
                formatter: (params) => `${params.value[3]}<br/>发生面积: ${params.value[0].toFixed(2)} 万亩<br/>农药用量: ${params.value[1].toFixed(2)} 吨`
            },
            grid: { 
                top: '25%', 
                left: '8%', 
                right: '15%', 
                bottom: '15%',
                containLabel: true 
            },
            xAxis: { 
                name: '面积(万亩)', 
                type: 'value', 
                splitLine: { lineStyle: { color: '#1e3a8a', type: 'dashed' } },
                axisLabel: { color: '#a5b4fc', fontSize: 10 },
                nameTextStyle: { color: '#a5b4fc', fontSize: 10, padding: [0, 0, 0, 2] }
            },
            yAxis: { 
                name: '用量(吨)', 
                type: 'value', 
                splitLine: { lineStyle: { color: '#1e3a8a', type: 'dashed' } },
                axisLabel: { color: '#a5b4fc', fontSize: 10 },
                nameTextStyle: { color: '#a5b4fc', fontSize: 10, align: 'right', padding: [0, 8, 10, 0] }
            },
            series: [{
                type: 'scatter',
                data: MockData.pestAnalysis,
                symbolSize: (data) => Math.sqrt(data[2]) * 5,
                itemStyle: {
                    color: new echarts.graphic.RadialGradient(0.4, 0.3, 1, [
                        { offset: 0, color: 'rgba(56, 189, 248, 0.8)' },
                        { offset: 1, color: 'rgba(30, 58, 138, 0.8)' }
                    ]),
                    shadowBlur: 10,
                    shadowColor: 'rgba(56, 189, 248, 0.5)'
                }
            }]
        };
        chart.setOption(option);
        this.instances.pest = chart;
    },

    // 移除旧的 initBioChemRing 和 initSparklines
    initSparklines() {},
    initBioChemRing() {},

    // 更新指标卡片
    updateIndicators(data) {
        const format = (val) => val.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        
        $('#total-usage .value').html(`${format(data.totalUsage.value)} <span class="unit">${data.totalUsage.unit}</span>`);
        $('#total-usage .up').text(`↑ ${data.totalUsage.yoy.toFixed(2)}%`);
        $('#total-usage .down').text(`↓ ${Math.abs(data.totalUsage.mom).toFixed(2)}%`);
        
        $('#commodity-volume .value').html(`${format(data.commodityVolume.value)} <span class="unit">${data.commodityVolume.unit}</span>`);
        $('#commodity-volume .up').text(`↑ ${data.commodityVolume.yoy.toFixed(2)}%`);
        
        $('#active-ingredient .value').html(`${format(data.activeIngredient.value)} <span class="unit">${data.activeIngredient.unit}</span>`);
        $('#active-ingredient .down').text(`↓ ${Math.abs(data.activeIngredient.yoy).toFixed(2)}%`);
        
        $('#usage-area .value').html(`${format(data.usageArea.value)} <span class="unit">${data.usageArea.unit}</span>`);
        
        $('#usage-frequency .value').html(`${data.usageFrequency.value.toFixed(2)} <span class="unit">${data.usageFrequency.unit}</span>`);
        
        $('#intensity-vs-std .value').html(`${data.intensity.current.toFixed(2)} / ${data.intensity.standard.toFixed(2)} <span class="unit">${data.intensity.unit}</span>`);
        const statusTag = $('#intensity-vs-std .status-tag');
        if (data.intensity.current <= data.intensity.standard) {
            statusTag.text('达标').removeClass('danger').addClass('success');
        } else {
            statusTag.text('超标').removeClass('success').addClass('danger');
        }
    },

    // 统一的饼图配置生成器
    getPieOption(title, data) {
        return {
            color: this.colorPalette,
            tooltip: {
                ...this.getCommonTooltip(),
                trigger: 'item',
                formatter: '{b}: {c} ({d}%)'
            },
            legend: {
                bottom: '2%',
                left: 'center',
                icon: 'circle',
                textStyle: { color: '#a5b4fc', fontSize: 10 },
                itemWidth: 10,
                itemGap: 10
            },
            series: [{
                name: title,
                type: 'pie',
                radius: ['35%', '60%'],
                center: ['50%', '45%'],
                avoidLabelOverlap: true,
                itemStyle: {
                    borderRadius: 4,
                    borderColor: '#0b0f2d',
                    borderWidth: 2
                },
                label: {
                    show: true,
                    position: 'outside',
                    formatter: '{b}: {d}%',
                    color: '#a5b4fc',
                    fontSize: 10,
                    edgeDistance: '5%'
                },
                labelLine: {
                    show: true,
                    length: 10,
                    length2: 15,
                    lineStyle: { color: '#1e3a8a' }
                },
                data: data
            }]
        };
    },

    // 响应式调整
    resize() {
        Object.values(this.instances).forEach(chart => chart.resize());
    }
};
