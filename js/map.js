/**
 * 地图模块逻辑
 */
const MapModule = {
    chart: null,
    currentLevel: 'national',
    currentProvince: null,
    geoData: null,

    init(containerId) {
        this.chart = echarts.init(document.getElementById(containerId));
        this.loadNationalMap();
        this.bindEvents();
    },

    // 加载全国地图
    async loadNationalMap() {
        this.currentLevel = 'national';
        $('#breadcrumb-province').hide();
        $('#breadcrumb-city').hide();
        $('#breadcrumb-national').addClass('active');

        try {
            const response = await fetch('https://geo.datav.aliyun.com/areas_v3/bound/100000_full.json');
            const chinaJson = await response.json();
            echarts.registerMap('china', chinaJson);
            this.renderMap('china', MockData.mapData);
        } catch (error) {
            console.error('加载地图失败:', error);
        }
    },

    // 加载省级地图
    async loadProvinceMap(provinceName, adcode) {
        this.currentLevel = 'province';
        this.currentProvince = provinceName;
        $('#breadcrumb-province').text(provinceName).show().addClass('active');
        $('#breadcrumb-national').removeClass('active');

        try {
            const response = await fetch(`https://geo.datav.aliyun.com/areas_v3/bound/${adcode}_full.json`);
            const provinceJson = await response.json();
            echarts.registerMap(provinceName, provinceJson);
            
            // 模拟省级下的市级数据，增加 cp 坐标
            const cityData = provinceJson.features.map(f => ({
                name: f.properties.name,
                value: Math.floor(Math.random() * 500) + 100,
                intensity: parseFloat((Math.random() * 0.6 + 0.6).toFixed(2)),
                status: Math.random() > 0.7 ? 'over' : 'ok',
                cp: f.properties.center || f.properties.centroid
            }));

            this.renderMap(provinceName, cityData);
        } catch (error) {
            console.error(`加载${provinceName}地图失败:`, error);
        }
    },

    // 简化行政区名称
    shortenName(name) {
        if (!name) return '';
        // 屏蔽港澳台名称展示
        const blackList = ['台湾省', '香港特别行政区', '澳门特别行政区', '台湾', '香港', '澳门'];
        if (blackList.some(item => name.includes(item))) return '';
        
        // 核心简化逻辑：去掉省、市、自治区等后缀
        return name.replace(/省|市|自治区|特别行政区|壮族|回族|维吾尔/g, '');
    },

    renderMap(mapName, data) {
        const showUsage = $('#layer-usage').is(':checked');
        const showIntensity = $('#layer-intensity').is(':checked');
        const showStations = $('#layer-stations').is(':checked');
        const pesticideFilter = $('#map-pesticide-filter').val();

        // 模拟筛选逻辑：如果不是“全部”，则根据农药名称对数值做一些扰动处理
        let filteredData = [...data];
        if (pesticideFilter !== 'all') {
            const seed = pesticideFilter.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            filteredData = filteredData.map(d => {
                const multiplier = 0.2 + (seed % 10) / 30; // 模拟不同农药的使用占比
                return {
                    ...d,
                    value: Math.round(d.value * multiplier),
                    intensity: parseFloat((d.intensity * multiplier).toFixed(2))
                };
            });
        }

        // 特殊处理：ECharts map 系列默认使用 data 中的 value 字段进行视觉映射。
        const processedData = filteredData.map(d => ({
            ...d,
            realValue: d.value,
            value: showUsage ? d.value : d.intensity
        }));

        // 更新图例显示
        if (showUsage) {
            $('.usage-legend').show();
            $('.intensity-legend').hide();
        } else {
            $('.usage-legend').hide();
            $('.intensity-legend').show();
        }

        const option = {
            tooltip: {
                trigger: 'item',
                backgroundColor: 'rgba(11, 15, 45, 0.9)',
                borderColor: '#38bdf8',
                borderWidth: 1,
                padding: [10, 15],
                textStyle: { color: '#fff', fontSize: 12 },
                extraCssText: 'box-shadow: 0 0 15px rgba(56, 189, 248, 0.4); border-radius: 8px; backdrop-filter: blur(4px);',
                confine: true,
                transitionDuration: 0.5,
                formatter: (params) => {
                    const blackList = ['台湾省', '香港特别行政区', '澳门特别行政区', '台湾', '香港', '澳门'];
                    if (blackList.some(item => params.name && params.name.includes(item))) {
                        return null; // 屏蔽港澳台提示框
                    }

                    if (params.seriesType === 'effectScatter' || params.seriesType === 'scatter') {
                        const data = params.data;
                        if (data.pestLevel) {
                            return `${data.name}<br/>病虫害等级: ${data.pestLevel}<br/>抗药性等级: ${data.resistanceLevel}`;
                        }
                    }
                    if (params.data) {
                        const usageInfo = `农药使用量: ${params.data.value.toFixed(2)} 吨`;
                        const intensityInfo = `农药使用强度: ${params.data.intensity.toFixed(2)} kg/亩`;
                        const statusInfo = `状态: ${params.data.status === 'over' ? '<span style="color:#f87171">超标</span>' : '<span style="color:#4ade80">达标</span>'}`;
                        return `${params.name}<br/>${usageInfo}<br/>${intensityInfo}<br/>${statusInfo}`;
                    }
                    return params.name;
                }
            },
            visualMap: showUsage ? {
                show: true,
                id: 'usageMap',
                min: 0,
                max: 1500,
                left: '20',
                bottom: '20',
                text: ['高用量', '低用量'],
                calculable: true,
                inRange: {
                    color: ['#4ade80', '#fbbf24', '#f87171']
                },
                textStyle: { color: '#fff' }
            } : {
                show: true,
                id: 'intensityMap',
                min: 0.3,
                max: 1.3,
                left: '20',
                bottom: '20',
                text: ['高强度', '低强度'],
                calculable: true,
                inRange: {
                    color: ['#4ade80', '#fbbf24', '#f87171']
                },
                textStyle: { color: '#fff' }
            },
            geo: {
                map: mapName,
                roam: true,
                label: {
                    show: true,
                    color: 'rgba(255,255,255,0.85)',
                    fontSize: 10,
                    formatter: (params) => this.shortenName(params.name),
                    // 增加文字阴影提高可读性
                    textShadowBlur: 2,
                    textShadowColor: '#000'
                },
                // ECharts 5 标签布局优化：自动隐藏重叠标签
                labelLayout: {
                    hideOverlap: true,
                    moveOverlap: 'shiftY'
                },
                emphasis: {
                    itemStyle: { 
                        areaColor: '#1e3a8a',
                        shadowBlur: 20,
                        shadowColor: 'rgba(0, 0, 0, 0.5)'
                    },
                    label: { 
                        show: true, 
                        color: '#fff', 
                        fontWeight: 'bold',
                        formatter: (params) => this.shortenName(params.name)
                    }
                },
                itemStyle: {
                    areaColor: '#101840',
                    borderColor: 'rgba(56, 189, 248, 0.4)',
                    borderWidth: 1.5,
                    shadowBlur: 5,
                    shadowColor: 'rgba(0, 0, 0, 0.3)'
                },
                regions: [
                    { name: '台湾省', itemStyle: { areaColor: '#101840' }, emphasis: { itemStyle: { areaColor: '#101840' }, label: { show: false } } },
                    { name: '香港特别行政区', itemStyle: { areaColor: '#101840' }, emphasis: { itemStyle: { areaColor: '#101840' }, label: { show: false } } },
                    { name: '澳门特别行政区', itemStyle: { areaColor: '#101840' }, emphasis: { itemStyle: { areaColor: '#101840' }, label: { show: false } } }
                ]
            },
            series: [
                // 1. 热力图层 (互斥)
                {
                    name: showUsage ? '农药使用量' : '农药使用强度',
                    type: 'map',
                    geoIndex: 0,
                    data: processedData,
                    emphasis: {
                        itemStyle: {
                            areaColor: '#1e3a8a'
                        }
                    }
                },
                // 2. 监测站点图层
                ...(showStations ? [{
                    name: '监测站点',
                    type: 'scatter',
                    coordinateSystem: 'geo',
                    data: MockData.stations.map(s => ({
                        name: s.name,
                        value: [s.lng, s.lat],
                        ...s
                    })),
                    // 使用地图原生定位风格图标 (Pin)
                    symbol: 'path://M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
                    symbolSize: [24, 30],
                    symbolOffset: [0, '-50%'],
                    itemStyle: { 
                        color: '#00f2ff', 
                        shadowBlur: 10, 
                        shadowColor: 'rgba(0, 0, 0, 0.8)',
                        borderColor: '#fff',
                        borderWidth: 1
                    },
                    label: {
                        show: false,
                        position: 'top',
                        formatter: '{b}',
                        color: '#fff',
                        fontSize: 11,
                        backgroundColor: 'rgba(11, 15, 45, 0.85)',
                        padding: [4, 8],
                        borderRadius: 4,
                        borderColor: '#00f2ff',
                        borderWidth: 1
                    },
                    emphasis: {
                        label: { show: true },
                        itemStyle: {
                            color: '#fbbf24',
                            scale: 1.2,
                            shadowBlur: 20,
                            shadowColor: '#fbbf24'
                        }
                    },
                    zlevel: 1
                }] : [])
            ]
        };

        this.chart.setOption(option, true);
    },

    bindEvents() {
        // 地图点击下钻
        this.chart.on('click', (params) => {
            const blackList = ['台湾省', '香港特别行政区', '澳门特别行政区', '台湾', '香港', '澳门'];
            const isBlackListed = blackList.some(item => params.name && params.name.includes(item));

            if (params.seriesType === 'map' && this.currentLevel === 'national') {
                if (isBlackListed) return; // 禁用港澳台下钻
                
                const province = params.name;
                const adcode = this.getAdcode(province);
                if (adcode) {
                    this.loadProvinceMap(province, adcode);
                    Dashboard.updateCharts(province);
                }
            } else if (params.seriesName === '监测站点') {
                Dashboard.showStationDetail(params.data);
            }
        });

        // 面包屑点击
        $('#breadcrumb-national').on('click', () => {
            this.loadNationalMap();
            Dashboard.updateCharts('全国');
        });

        // 图层开关 (单选互斥逻辑)
        $('.layer-toggle input').on('change', function() {
            const $this = $(this);
            if ($this.attr('type') === 'radio') {
                $('.radio-label').removeClass('active');
                $this.parent().addClass('active');
            }
            
            const currentMap = MapModule.chart.getOption().geo[0].map;
            // 重新获取当前数据并渲染
            MapModule.refreshCurrentMap(currentMap);
        });
    },

    // 辅助方法：重新获取并渲染当前地图数据
    async refreshCurrentMap(mapName) {
        let data = [];
        if (this.currentLevel === 'national') {
            data = MockData.mapData;
        } else {
            // 如果是省级，尝试从当前 option 中获取（简化处理）
            data = this.chart.getOption().series[0].data;
        }
        this.renderMap(mapName, data);
    },

    getAdcode(name) {
        const adcodes = {
            '北京市': '110000', '天津市': '120000', '河北省': '130000', '山西省': '140000',
            '内蒙古自治区': '150000', '辽宁省': '210000', '吉林省': '220000', '黑龙江省': '230000',
            '上海市': '310000', '江苏省': '320000', '浙江省': '330000', '安徽省': '340000',
            '福建省': '350000', '江西省': '360000', '山东省': '370000', '河南省': '410000',
            '湖北省': '420000', '湖南省': '430000', '广东省': '440000', '广西壮族自治区': '450000',
            '海南省': '460000', '重庆市': '500000', '四川省': '510000', '贵州省': '520000',
            '云南省': '530000', '西藏自治区': '540000', '陕西省': '610000', '甘肃省': '620000',
            '青海省': '630000', '宁夏回族自治区': '640000', '新疆维吾尔自治区': '650000'
        };
        for (let key in adcodes) {
            if (key.includes(name)) return adcodes[key];
        }
        return null;
    }
};
