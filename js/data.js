/**
 * 模拟数据 - 农药用量分析
 */
const MockData = {
    // 顶部核心指标
    indicators: {
        totalUsage: { value: 12450.00, unit: '吨', yoy: 5.2, mom: -1.8 },
        commodityVolume: { value: 15680.00, unit: '吨', yoy: 3.1 },
        activeIngredient: { value: 8920.00, unit: '吨', yoy: -2.4 },
        usageArea: { value: 450.50, unit: '万亩', yoy: 1.5 },
        usageFrequency: { value: 3.2, unit: '次/季', yoy: -0.5 },
        intensity: { current: 0.85, standard: 1.0, unit: 'kg/亩' }
    },

    // 趋势分析
    trend: {
        months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        usage: [800, 950, 1200, 1500, 1800, 2100, 1900, 1600, 1300, 1000, 850, 750],
        lastYearUsage: [750, 900, 1100, 1400, 1750, 2000, 1850, 1550, 1250, 950, 800, 700]
    },

    // 结构分析
    categories: [
        { name: '杀虫剂', value: 45 },
        { name: '杀菌剂', value: 25 },
        { name: '除草剂', value: 20 },
        { name: '植物生长调节剂', value: 7 },
        { name: '其他', value: 3 }
    ],

    toxicity: [
        { name: '微毒', value: 40 },
        { name: '低毒', value: 35 },
        { name: '中等毒', value: 20 },
        { name: '高毒', value: 5 }
    ],

    bioChem: [
        { name: '化学农药', value: 70 },
        { name: '生物农药', value: 20 },
        { name: '高风险农药', value: 10 }
    ],

    crops: [
        { name: '水稻', value: 3500 },
        { name: '小麦', value: 2800 },
        { name: '玉米', value: 2400 },
        { name: '蔬菜', value: 2100 },
        { name: '果树', value: 1800 },
        { name: '棉花', value: 1200 },
        { name: '大豆', value: 950 },
        { name: '茶叶', value: 600 },
        { name: '马铃薯', value: 450 },
        { name: '甘蔗', value: 300 }
    ],

    pesticides: [
        { name: '阿维菌素', value: 1200 },
        { name: '吡虫啉', value: 950 },
        { name: '高效氯氰菊酯', value: 880 },
        { name: '毒死蜱', value: 720 },
        { name: '噻虫嗪', value: 650 },
        { name: '溴氰菊酯', value: 580 },
        { name: '肟菌酯', value: 450 },
        { name: '代森锰锌', value: 380 },
        { name: '多菌灵', value: 320 },
        { name: '苦参碱', value: 250 }
    ],

    formulations: [
        { name: '乳油(EC)', value: 30 },
        { name: '悬浮剂(SC)', value: 25 },
        { name: '可湿性粉剂(WP)', value: 20 },
        { name: '水分散粒剂(WG)', value: 15 },
        { name: '其他', value: 10 }
    ],

    // 新增：抗药性关联分析
    resistanceAnalysis: [
        [5, 12, '阿维菌素', '红火蚁'], [8, 45, '吡虫啉', '红火蚁'], [3, 8, '毒死蜱', '蚜虫'],
        [12, 120, '高效氯氰菊酯', '红火蚁'], [6, 25, '肟菌酯', '稻瘟病'], [10, 85, '溴氰菊酯', '红火蚁'],
        [4, 15, '代森锰锌', '叶斑病'], [15, 150, '噻虫嗪', '红火蚁'], [2, 5, '苦参碱', '菜青虫']
    ],

    // 新增：环境关联分析
    environmentAnalysis: {
        months: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'],
        temp: [10, 12, 18, 22, 26, 30, 32, 31, 28, 22, 16, 12],
        precip: [20, 35, 60, 120, 180, 250, 200, 150, 90, 50, 30, 20],
        usage: [800, 950, 1200, 1500, 1800, 2100, 1900, 1600, 1300, 1000, 850, 750]
    },

    // 新增：病虫害关联分析
    pestAnalysis: [
        [50, 800, 30, '蚜虫'], [120, 2100, 85, '红火蚁'], [80, 1500, 50, '稻飞虱'],
        [40, 600, 20, '菜青虫'], [150, 2800, 95, '红火蚁'], [30, 400, 15, '红蜘蛛'],
        [90, 1700, 60, '红火蚁'], [60, 1100, 40, '棉铃虫']
    ],

    // 关联指标
    associated: {
        greenControl: [35, 38, 40, 42.5],
        compliance: [95, 96, 97.5, 98.2],
        riskIndex: [0.45, 0.42, 0.38, 0.34],
        highResistance: [18, 17, 16.5, 15.8]
    },

    // 地图数据 (模拟各省数据 - 使用全称以匹配 GeoJSON)
    mapData: [
        { name: '广东省', value: 1200, intensity: 1.2, status: 'over', cp: [113.23, 23.16] },
        { name: '广西壮族自治区', value: 950, intensity: 0.9, status: 'ok', cp: [108.33, 22.84] },
        { name: '云南省', value: 880, intensity: 0.8, status: 'ok', cp: [102.73, 25.04] },
        { name: '福建省', value: 720, intensity: 1.1, status: 'over', cp: [119.30, 26.08] },
        { name: '湖南省', value: 1050, intensity: 0.95, status: 'ok', cp: [112.98, 28.21] },
        { name: '四川省', value: 920, intensity: 0.85, status: 'ok', cp: [104.06, 30.67] },
        { name: '贵州省', value: 640, intensity: 0.7, status: 'ok', cp: [106.71, 26.57] },
        { name: '江西省', value: 780, intensity: 1.05, status: 'over', cp: [115.89, 28.68] },
        { name: '浙江省', value: 850, intensity: 0.9, status: 'ok', cp: [120.19, 30.26] },
        { name: '安徽省', value: 890, intensity: 0.92, status: 'ok', cp: [117.27, 31.86] },
        { name: '湖北省', value: 940, intensity: 0.88, status: 'ok', cp: [114.31, 30.52] },
        { name: '江苏省', value: 1100, intensity: 1.15, status: 'over', cp: [118.78, 32.04] },
        { name: '山东省', value: 1300, intensity: 1.25, status: 'over', cp: [117.00, 36.65] },
        { name: '河南省', value: 1250, intensity: 1.1, status: 'over', cp: [113.65, 34.76] },
        { name: '河北省', value: 980, intensity: 0.9, status: 'ok', cp: [114.48, 38.03] },
        { name: '北京市', value: 200, intensity: 0.6, status: 'ok', cp: [116.46, 39.92] },
        { name: '天津市', value: 250, intensity: 0.7, status: 'ok', cp: [117.20, 39.13] },
        { name: '上海市', value: 180, intensity: 0.65, status: 'ok', cp: [121.48, 31.22] },
        { name: '重庆市', value: 550, intensity: 0.8, status: 'ok', cp: [106.54, 29.59] },
        { name: '黑龙江省', value: 1500, intensity: 0.8, status: 'ok', cp: [126.63, 45.75] },
        { name: '吉林省', value: 1100, intensity: 0.85, status: 'ok', cp: [125.35, 43.88] },
        { name: '辽宁省', value: 900, intensity: 0.9, status: 'ok', cp: [123.42, 41.8] },
        { name: '内蒙古自治区', value: 800, intensity: 0.5, status: 'ok', cp: [111.65, 40.82] },
        { name: '陕西省', value: 700, intensity: 0.85, status: 'ok', cp: [108.95, 34.27] },
        { name: '山西省', value: 600, intensity: 0.8, status: 'ok', cp: [112.53, 37.87] },
        { name: '甘肃省', value: 500, intensity: 0.7, status: 'ok', cp: [103.73, 36.03] },
        { name: '青海省', value: 200, intensity: 0.4, status: 'ok', cp: [101.74, 36.56] },
        { name: '宁夏回族自治区', value: 300, intensity: 0.75, status: 'ok', cp: [106.27, 38.47] },
        { name: '新疆维吾尔自治区', value: 1400, intensity: 0.9, status: 'ok', cp: [87.68, 43.77] },
        { name: '西藏自治区', value: 100, intensity: 0.3, status: 'ok', cp: [91.11, 29.97] },
        { name: '海南省', value: 400, intensity: 1.1, status: 'over', cp: [110.35, 20.02] }
    ],

    // 监测站点
    stations: [
        { id: 1, name: '广州南沙监测站', lng: 113.52, lat: 22.8, pestLevel: '中', resistanceLevel: '高风险', usageDetails: [
            { name: '阿维菌素', amount: 15.5, count: 3 },
            { name: '吡虫啉', amount: 22.0, count: 5 },
            { name: '毒死蜱', amount: 45.2, count: 2 }
        ]},
        { id: 2, name: '成都双流监测站', lng: 103.92, lat: 30.57, pestLevel: '低', resistanceLevel: '中风险', usageDetails: [
            { name: '高效氯氰菊酯', amount: 12.0, count: 2 },
            { name: '多菌灵', amount: 18.5, count: 4 }
        ]},
        { id: 3, name: '武汉蔡甸监测站', lng: 114.02, lat: 30.58, pestLevel: '高', resistanceLevel: '极高风险', usageDetails: [
            { name: '肟菌酯', amount: 35.0, count: 6 },
            { name: '溴氰菊酯', amount: 28.5, count: 4 },
            { name: '代森锰锌', amount: 60.0, count: 3 }
        ]},
        { id: 4, name: '北京大兴监测站', lng: 116.33, lat: 39.73, pestLevel: '低', resistanceLevel: '低风险', usageDetails: [
            { name: '苦参碱', amount: 8.0, count: 2 },
            { name: '苏云金杆菌', amount: 25.5, count: 5 }
        ]}
    ]
};
